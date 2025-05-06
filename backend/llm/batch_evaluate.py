from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid
import aiohttp
import asyncio
import logging
import json
from database.db_connection import connect
from utils.auth import require_role

# Configure logging
logger = logging.getLogger(__name__)

# LLM API endpoint (Kaggle via ngrok)
LLM_EVALUATE_ENDPOINT = "https://4ae8-104-196-180-232.ngrok-free.app/evaluate"

router = APIRouter()

class BatchEvaluationRequest(BaseModel):
    evaluation_ids: List[str]

class BatchEvaluationResponse(BaseModel):
    successful: List[str]
    failed: Dict[str, str]
    message: str

@router.post("/batch", response_model=BatchEvaluationResponse)
async def batch_evaluate_submissions(
    request: BatchEvaluationRequest,
    user=Depends(require_role(['teacher', 'moderator', 'admin']))
):
    """
    Process a batch of evaluations using the LLM service.
    This endpoint handles multiple submissions at once, improving efficiency.
    """
    logger.info(f"Starting batch evaluation for {len(request.evaluation_ids)} evaluations")
    
    # Initialize response objects
    successful_evaluations = []
    failed_evaluations = {}
    
    # Connect to database
    conn = connect()
    cur = conn.cursor()
    
    try:
        # Collect data for all evaluations
        batch_data = []
        evaluation_mapping = {}  # Maps index in batch to evaluation_id
        
        for index, evaluation_id in enumerate(request.evaluation_ids):
            try:
                # 1. Fetch evaluation data
                cur.execute(
                    """
                    SELECT e.answer_text, e.question_id, e.student_id
                    FROM evaluation e
                    WHERE e.id = %s
                    """,
                    (evaluation_id,)
                )
                evaluation_data = cur.fetchone()
                
                if not evaluation_data:
                    failed_evaluations[evaluation_id] = "Evaluation not found"
                    continue
                    
                answer_text, question_id, student_id = evaluation_data
                
                # 2. Fetch question text
                cur.execute(
                    """
                    SELECT q.question_text
                    FROM question q
                    WHERE q.id = %s
                    """,
                    (question_id,)
                )
                question_data = cur.fetchone()
                
                if not question_data:
                    failed_evaluations[evaluation_id] = "Question not found"
                    continue
                    
                question_text = question_data[0]
                
                # 3. Fetch rubric items
                cur.execute(
                    """
                    SELECT id, rubric_text, marks, serial_number
                    FROM rubric
                    WHERE question_id = %s
                    ORDER BY serial_number
                    """,
                    (question_id,)
                )
                
                rubrics = cur.fetchall()
                if not rubrics:
                    failed_evaluations[evaluation_id] = "Rubric not found for this question"
                    continue
                
                # Format rubric text for LLM API
                rubric_text = "\n".join([f"{i+1}. {r[1]} ({r[2]} marks)" for i, r in enumerate(rubrics)])
                
                # Add to batch for LLM processing
                batch_data.append({
                    "question": question_text,
                    "answer": answer_text,
                    "rubric": rubric_text
                })
                
                # Store mapping from batch index to evaluation metadata
                evaluation_mapping[index] = {
                    "evaluation_id": evaluation_id,
                    "rubrics": rubrics,
                    "max_marks": sum(float(rubric[2]) for rubric in rubrics)
                }
                
                # Update evaluation status to processing
                cur.execute(
                    """
                    UPDATE evaluation
                    SET evaluation_status = 'processing'
                    WHERE id = %s
                    """,
                    (evaluation_id,)
                )
                
            except Exception as e:
                logger.error(f"Failed to prepare evaluation {evaluation_id}: {str(e)}")
                failed_evaluations[evaluation_id] = f"Failed to prepare: {str(e)}"
        
        # Commit status updates
        conn.commit()
        
        # If no valid evaluations to process, return early
        if not batch_data:
            return BatchEvaluationResponse(
                successful=successful_evaluations,
                failed=failed_evaluations,
                message="No valid evaluations to process"
            )
        
        # Call LLM API with all questions in the batch
        try:
            async with aiohttp.ClientSession() as session:
                # Log the exact payload being sent to LLM API
                logger.info(f"Sending batch of {len(batch_data)} evaluations to LLM API")
                logger.info(f"Request payload: {json.dumps(batch_data, indent=2)}")
                
                async with session.post(
                    LLM_EVALUATE_ENDPOINT,
                    json=batch_data,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"LLM API error (Status {response.status}): {error_text[:500]}...")
                        
                        # Mark all as failed
                        for idx in evaluation_mapping:
                            eval_id = evaluation_mapping[idx]["evaluation_id"]
                            failed_evaluations[eval_id] = f"LLM API error: {error_text}"
                            
                            # Update evaluation status to failed
                            cur.execute(
                                """
                                UPDATE evaluation
                                SET evaluation_status = 'failed'
                                WHERE id = %s
                                """,
                                (eval_id,)
                            )
                        
                        conn.commit()
                        return BatchEvaluationResponse(
                            successful=successful_evaluations,
                            failed=failed_evaluations,
                            message=f"Batch evaluation failed: {error_text}"
                        )
                    
                    # Parse LLM responses - returns a list of lists of tuples
                    # Each outer list item corresponds to one evaluation
                    llm_responses = await response.json()
                    logger.info(f"Received responses from LLM API for {len(llm_responses)} evaluations")
                    
                    if not isinstance(llm_responses, list) or len(llm_responses) != len(batch_data):
                        error_msg = "Invalid response format from LLM API"
                        logger.error(error_msg)
                        
                        # Mark all as failed
                        for idx in evaluation_mapping:
                            eval_id = evaluation_mapping[idx]["evaluation_id"]
                            failed_evaluations[eval_id] = error_msg
                            
                            # Update evaluation status to failed
                            cur.execute(
                                """
                                UPDATE evaluation
                                SET evaluation_status = 'failed'
                                WHERE id = %s
                                """,
                                (eval_id,)
                            )
                        
                        conn.commit()
                        return BatchEvaluationResponse(
                            successful=successful_evaluations,
                            failed=failed_evaluations,
                            message=error_msg
                        )
                    
                    # Process each evaluation result
                    for batch_index, evaluation_results in enumerate(llm_responses):
                        if batch_index not in evaluation_mapping:
                            logger.warning(f"Received result for unknown batch index {batch_index}")
                            continue
                        
                        eval_metadata = evaluation_mapping[batch_index]
                        evaluation_id = eval_metadata["evaluation_id"]
                        rubrics = eval_metadata["rubrics"]
                        max_marks = eval_metadata["max_marks"]
                        
                        try:
                            # Calculate total score and generate detailed results
                            total_score = 0
                            detailed_result_text = "## Evaluation Results\n\n"
                            
                            # Process each rubric item evaluation
                            for i, (rubric_text, score, total, explanation) in enumerate(evaluation_results):
                                if i >= len(rubrics):
                                    # More results than rubrics, log warning and continue
                                    logger.warning(f"More evaluation results than rubrics for {evaluation_id}")
                                    continue
                                    
                                # Get corresponding rubric ID and max marks
                                rubric_id = rubrics[i][0]
                                max_mark = float(rubrics[i][2])
                                serial_number = rubrics[i][3]
                                
                                # Normalize score based on our rubric's max marks
                                normalized_score = (score / total) * max_mark if total > 0 else 0
                                total_score += normalized_score
                                
                                # Format detailed result
                                item_detail = f"### {rubric_text}\n"
                                item_detail += f"**Score:** {normalized_score:.2f}/{max_mark}\n"
                                item_detail += f"**Explanation:** {explanation}\n\n"
                                detailed_result_text += item_detail
                                
                                # Insert evaluation_detail
                                cur.execute(
                                    """
                                    INSERT INTO evaluation_detail (
                                        id, evaluation_id, rubric_id, obtained_marks, 
                                        detailed_result, serial_number
                                    )
                                    VALUES (%s, %s, %s, %s, %s, %s)
                                    """,
                                    (
                                        str(uuid.uuid4()), evaluation_id, rubric_id, 
                                        normalized_score, item_detail, serial_number
                                    )
                                )
                            
                            # Add final score to detailed result
                            detailed_result_text += f"## Final Score: {total_score:.2f}/{max_marks:.2f}"
                            
                            # Update evaluation status to completed
                            cur.execute(
                                """
                                UPDATE evaluation
                                SET evaluation_status = 'completed'
                                WHERE id = %s
                                """,
                                (evaluation_id,)
                            )
                            
                            # Add to successful list
                            successful_evaluations.append(evaluation_id)
                            logger.info(f"Evaluation completed for {evaluation_id}")
                            
                        except Exception as e:
                            logger.error(f"Failed to process evaluation results for {evaluation_id}: {str(e)}")
                            failed_evaluations[evaluation_id] = f"Failed to process results: {str(e)}"
                            
                            # Update evaluation status to failed
                            cur.execute(
                                """
                                UPDATE evaluation
                                SET evaluation_status = 'failed'
                                WHERE id = %s
                                """,
                                (evaluation_id,)
                            )
                    
                    # Commit all database changes
                    conn.commit()
        
        except Exception as e:
            logger.error(f"Error in LLM API communication: {str(e)}")
            
            # Mark all remaining as failed
            for idx in evaluation_mapping:
                eval_id = evaluation_mapping[idx]["evaluation_id"]
                if eval_id not in successful_evaluations and eval_id not in failed_evaluations:
                    failed_evaluations[eval_id] = f"API communication error: {str(e)}"
                    
                    # Update evaluation status to failed
                    cur.execute(
                        """
                        UPDATE evaluation
                        SET evaluation_status = 'failed'
                        WHERE id = %s
                        """,
                        (eval_id,)
                    )
            
            conn.commit()
    
    except Exception as e:
        conn.rollback()
        logger.error(f"Batch evaluation process failed: {str(e)}")
        return BatchEvaluationResponse(
            successful=successful_evaluations,
            failed=failed_evaluations,
            message=f"Batch evaluation process failed: {str(e)}"
        )
    
    finally:
        cur.close()
        conn.close()
    
    # Return summary of batch processing
    total = len(request.evaluation_ids)
    success_count = len(successful_evaluations)
    fail_count = len(failed_evaluations)
    
    return BatchEvaluationResponse(
        successful=successful_evaluations,
        failed=failed_evaluations,
        message=f"Batch evaluation completed. Success: {success_count}/{total}, Failed: {fail_count}/{total}"
    )