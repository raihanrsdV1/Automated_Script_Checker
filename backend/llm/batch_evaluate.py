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
LLM_EVALUATE_ENDPOINT = "https://4877-35-188-10-87.ngrok-free.app/evaluate"

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
    result = await evaluate_batch(request.evaluation_ids)
    
    return BatchEvaluationResponse(
        successful=result.get('successful', []),
        failed=result.get('failed', {}),
        message=result.get('message', "Batch evaluation completed")
    )

async def evaluate_batch(evaluation_ids: List[str]) -> Dict:
    """
    Simplified batch evaluation function that fetches data for evaluations,
    sends them to the LLM API, and updates the database with results.
    
    Steps:
    1. Fetch data for all evaluations
    2. Send batch to LLM API
    3. Update database with results
    
    Returns:
        Dict with success/failure information
    """
    logger.info(f"Processing batch evaluation for {len(evaluation_ids)} evaluations")
    
    # Results tracking
    successful_evaluations = []
    failed_evaluations = {}
    
    # STEP 1: Get all the data needed for evaluation
    batch_data = []
    evaluation_mapping = {}
    
    conn = connect()
    cur = conn.cursor()
    
    try:
        # First, fetch all the data we need for each evaluation
        for idx, evaluation_id in enumerate(evaluation_ids):
            try:
                # Get the evaluation data
                cur.execute(
                    """
                    SELECT answer_text, question_id, student_id
                    FROM evaluation
                    WHERE id = %s
                    """, 
                    (evaluation_id,)
                )
                eval_result = cur.fetchone()
                
                if not eval_result:
                    failed_evaluations[evaluation_id] = "Evaluation not found"
                    continue
                    
                answer_text, question_id, student_id = eval_result
                
                # Get the question text
                cur.execute(
                    """
                    SELECT question_text
                    FROM question
                    WHERE id = %s
                    """, 
                    (question_id,)
                )
                question_result = cur.fetchone()
                
                if not question_result:
                    failed_evaluations[evaluation_id] = "Question not found"
                    continue
                    
                question_text = question_result[0]
                
                # Get the rubrics
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
                    failed_evaluations[evaluation_id] = "No rubrics found for question"
                    continue
                
                # Format the rubric text for the LLM API
                rubric_text = "\n".join([f"{i+1}. {r[1]} ({r[2]} marks)" for i, r in enumerate(rubrics)])
                
                # Add to batch data
                batch_data.append({
                    "question": question_text,
                    "answer": answer_text,
                    "rubric": rubric_text
                })
                
                # Store mapping for later processing
                evaluation_mapping[len(batch_data) - 1] = {
                    "evaluation_id": evaluation_id,
                    "rubrics": rubrics
                }
                
            except Exception as e:
                logger.error(f"Error fetching data for evaluation {evaluation_id}: {str(e)}")
                failed_evaluations[evaluation_id] = f"Data fetch error: {str(e)}"
        
        # If no evaluations with valid data, return early
        if not batch_data:
            logger.warning("No valid evaluations to process")
            return {
                "successful": successful_evaluations,
                "failed": failed_evaluations,
                "message": "No valid evaluations to process"
            }
            
        # STEP 2: Send the batch to the LLM API
        logger.info(f"Sending batch of {len(batch_data)} evaluations to LLM API")
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    LLM_EVALUATE_ENDPOINT,
                    json=batch_data,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"Error from LLM API: {error_text[:200]}")
                        
                        # Mark all as failed
                        for idx in evaluation_mapping:
                            eval_id = evaluation_mapping[idx]["evaluation_id"]
                            if eval_id not in failed_evaluations:
                                failed_evaluations[eval_id] = f"LLM API error: {response.status}"
                        
                        return {
                            "successful": successful_evaluations,
                            "failed": failed_evaluations,
                            "message": f"LLM API error: {response.status}"
                        }
                    
                    # Get the response
                    llm_results = await response.json()
                    logger.info(f"Received response from LLM API for {len(llm_results)} evaluations")
                    
                    # Verify response format
                    if not isinstance(llm_results, list) or len(llm_results) != len(batch_data):
                        logger.error(f"Invalid response format from LLM API")
                        for idx in evaluation_mapping:
                            eval_id = evaluation_mapping[idx]["evaluation_id"]
                            if eval_id not in failed_evaluations:
                                failed_evaluations[eval_id] = "Invalid response format from LLM API"
                                
                        return {
                            "successful": successful_evaluations,
                            "failed": failed_evaluations,
                            "message": "Invalid response format from LLM API"
                        }
                    
                    # STEP 3: Process the results and update the database
                    for batch_idx, evaluation_results in enumerate(llm_results):
                        if batch_idx not in evaluation_mapping:
                            logger.warning(f"Received result for unknown batch index {batch_idx}")
                            continue
                            
                        evaluation_id = evaluation_mapping[batch_idx]["evaluation_id"]
                        rubrics = evaluation_mapping[batch_idx]["rubrics"]
                        
                        # Start a new connection for updating each evaluation
                        update_conn = connect()
                        update_cur = update_conn.cursor()
                        
                        try:
                            # Process the evaluation results
                            total_score = 0
                            max_marks = sum(float(r[2]) for r in rubrics)
                            detailed_result_text = "## Evaluation Results\n\n"
                            
                            # Process each rubric item
                            for i, (rubric_text, score, total, explanation) in enumerate(evaluation_results):
                                if i >= len(rubrics):
                                    continue  # Skip if more results than rubrics
                                
                                # Get corresponding rubric
                                rubric_id = rubrics[i][0]
                                max_mark = float(rubrics[i][2])
                                serial_number = rubrics[i][3]
                                
                                # Normalize score
                                normalized_score = (score / total) * max_mark if total > 0 else 0
                                total_score += normalized_score
                                
                                # Format detailed result text
                                item_detail = f"### {rubric_text}\n"
                                item_detail += f"**Score:** {normalized_score:.2f}/{max_mark}\n"
                                item_detail += f"**Explanation:** {explanation}\n\n"
                                detailed_result_text += item_detail
                                
                                # Insert evaluation detail
                                update_cur.execute(
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
                            update_cur.execute(
                                """
                                UPDATE evaluation
                                SET evaluation_status = 'completed'
                                WHERE id = %s
                                """,
                                (evaluation_id,)
                            )
                            
                            # Commit all changes
                            update_conn.commit()
                            
                            # Add to successful list
                            successful_evaluations.append(evaluation_id)
                            logger.info(f"Successfully processed evaluation {evaluation_id}")
                            
                        except Exception as e:
                            logger.error(f"Error updating database for evaluation {evaluation_id}: {str(e)}")
                            update_conn.rollback()
                            
                            # Mark as failed
                            try:
                                update_cur.execute(
                                    "UPDATE evaluation SET evaluation_status = 'failed' WHERE id = %s",
                                    (evaluation_id,)
                                )
                                update_conn.commit()
                            except Exception as update_error:
                                logger.error(f"Could not update status for {evaluation_id}: {str(update_error)}")
                            
                            failed_evaluations[evaluation_id] = f"Database update error: {str(e)}"
                            
                        finally:
                            update_cur.close()
                            update_conn.close()
                            
        except Exception as e:
            logger.error(f"Error communicating with LLM API: {str(e)}")
            
            # Mark all remaining as failed
            for idx in evaluation_mapping:
                eval_id = evaluation_mapping[idx]["evaluation_id"]
                if eval_id not in successful_evaluations and eval_id not in failed_evaluations:
                    failed_evaluations[eval_id] = f"API communication error: {str(e)}"
                    
                    # Try to update status
                    try:
                        status_conn = connect()
                        status_cur = status_conn.cursor()
                        status_cur.execute(
                            "UPDATE evaluation SET evaluation_status = 'failed' WHERE id = %s",
                            (eval_id,)
                        )
                        status_conn.commit()
                        status_cur.close()
                        status_conn.close()
                    except Exception as status_error:
                        logger.error(f"Could not update status for {eval_id}: {str(status_error)}")
    except Exception as e:
        logger.error(f"Unexpected error in batch evaluation: {str(e)}")
        
        # Mark all as failed that haven't been processed
        for eval_id in evaluation_ids:
            if eval_id not in successful_evaluations and eval_id not in failed_evaluations:
                failed_evaluations[eval_id] = f"Unexpected error: {str(e)}"
                
                # Try to update status
                try:
                    status_conn = connect()
                    status_cur = status_conn.cursor()
                    status_cur.execute(
                        "UPDATE evaluation SET evaluation_status = 'failed' WHERE id = %s",
                        (eval_id,)
                    )
                    status_conn.commit()
                    status_cur.close()
                    status_conn.close()
                except Exception as status_error:
                    logger.error(f"Could not update status for {eval_id}: {str(status_error)}")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
    
    # Return results
    return {
        "successful": successful_evaluations,
        "failed": failed_evaluations,
        "message": f"Batch evaluation completed. Success: {len(successful_evaluations)}/{len(evaluation_ids)}, Failed: {len(failed_evaluations)}/{len(evaluation_ids)}"
    }