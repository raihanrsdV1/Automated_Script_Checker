from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import json
import uuid
import aiohttp
from database.db_connection import connect
import logging

# Configure logging
logger = logging.getLogger(__name__)

# LLM API endpoint (Kaggle via ngrok)
LLM_EVALUATE_ENDPOINT = "https://1b2a-34-57-168-20.ngrok-free.app/evaluate"

router = APIRouter()

class EvaluationResponse(BaseModel):
    evaluation_id: str
    message: str
    result: float = None
    detailed_result: str = None

@router.post("/{evaluation_id}", response_model=EvaluationResponse)
async def evaluate_submission(evaluation_id: str):
    """
    Evaluate a submission using the LLM service.
    This fetches the necessary data from the database,
    sends it to the LLM service, and stores the results.
    """
    logger.info(f"Starting evaluation for evaluation {evaluation_id}")
    
    # Connect to database
    conn = connect()
    cur = conn.cursor()
    
    try:
        # 1. Fetch evaluation data (answer_text and question_id)
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
            raise HTTPException(status_code=404, detail="Evaluation not found")
            
        answer_text, question_id, student_id = evaluation_data
        
        # 2. Fetch question data and rubrics
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
            raise HTTPException(status_code=404, detail="Question not found")
            
        question_text = question_data[0]
        
        # 3. Fetch rubric items for this question
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
            raise HTTPException(status_code=404, detail="Rubric not found for this question")
        
        # Calculate total possible marks
        max_marks = sum(float(rubric[2]) for rubric in rubrics)
        
        # Create rubric text in format expected by LLM API
        rubric_text = "\n".join([f"{i+1}. {r[1]} ({r[2]} marks)" for i, r in enumerate(rubrics)])
        
        # 3. Prepare data for LLM API in the expected format
        evaluation_input = [
            {
                "question": question_text,
                "answer": answer_text,
                "rubric": rubric_text
            }
        ]
        
        # 4. Call LLM API via ngrok
        async with aiohttp.ClientSession() as session:
            logger.info(f"Sending evaluation request to LLM API for evaluation {evaluation_id}")
            try:
                async with session.post(
                    LLM_EVALUATE_ENDPOINT,
                    json=evaluation_input,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"LLM API error: {error_text}")
                        
                        # Update evaluation status to failed
                        cur.execute(
                            """
                            UPDATE evaluation
                            SET evaluation_status = 'failed'
                            WHERE id = %s
                            """,
                            (evaluation_id,)
                        )
                        conn.commit()
                        
                        raise HTTPException(
                            status_code=500,
                            detail=f"Error from LLM service: {error_text}"
                        )
                    
                    # 5. Parse the LLM response
                    llm_response = await response.json()
                    logger.info(f"Received response from LLM API for evaluation {evaluation_id}")
                    
                    # The LLM response is the aggregated results with majority voting
                    # Format should be: List[List[Tuple[rubric_text, score, total, explanation]]]
                    if not llm_response or not isinstance(llm_response, list) or len(llm_response) == 0:
                        # Update evaluation status to failed
                        cur.execute(
                            """
                            UPDATE evaluation
                            SET evaluation_status = 'failed'
                            WHERE id = %s
                            """,
                            (evaluation_id,)
                        )
                        conn.commit()
                        
                        raise HTTPException(
                            status_code=500, 
                            detail="Invalid response from LLM service"
                        )
                        
                    # Since we only sent one question-answer pair, we take the first result
                    evaluation_results = llm_response[0]
                    print(evaluation_results)
                    
                    # Calculate total score and generate detailed results
                    total_score = 0
                    detailed_result_text = "## Evaluation Results\n\n"
                    
                    # Process each rubric item evaluation from LLM
                    for i, (rubric_text, score, total, explanation) in enumerate(evaluation_results):
                        if i >= len(rubrics):
                            # More results than rubrics, log warning and continue
                            logger.warning(f"More evaluation results than rubrics for {evaluation_id}")
                            continue
                            
                        # Get corresponding rubric ID and max marks from our database
                        rubric_id = rubrics[i][0]
                        max_mark = float(rubrics[i][2])
                        serial_number = rubrics[i][3]
                        
                        # Normalize score based on our rubric's max marks
                        normalized_score = (score / total) * max_mark if total > 0 else 0
                        total_score += normalized_score
                        
                        # Format detailed result for this rubric item
                        item_detail = f"### {rubric_text}\n"
                        item_detail += f"**Score:** {normalized_score:.2f}/{max_mark}\n"
                        item_detail += f"**Explanation:** {explanation}\n\n"
                        detailed_result_text += item_detail
                        
                        # Insert evaluation_detail record for this rubric item
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
                    
                    # 6. Update evaluation status to completed
                    cur.execute(
                        """
                        UPDATE evaluation
                        SET evaluation_status = 'completed'
                        WHERE id = %s
                        """,
                        (evaluation_id,)
                    )
                    
                    # Commit all database changes
                    conn.commit()
                    
                    logger.info(f"Evaluation completed for submission {evaluation_id}")
                    
                    # Return response with evaluation details
                    return EvaluationResponse(
                        evaluation_id=evaluation_id,
                        message="Evaluation completed successfully",
                        result=total_score,
                        detailed_result=detailed_result_text
                    )
                    
            except aiohttp.ClientError as e:
                logger.error(f"Error connecting to LLM API: {str(e)}")
                
                # Update evaluation status to failed
                cur.execute(
                    """
                    UPDATE evaluation
                    SET evaluation_status = 'failed'
                    WHERE id = %s
                    """,
                    (evaluation_id,)
                )
                conn.commit()
                
                raise HTTPException(
                    status_code=503,
                    detail=f"Could not connect to LLM service: {str(e)}"
                )
    
    except Exception as e:
        conn.rollback()
        logger.error(f"Evaluation failed: {str(e)}")
        
        # Try to update evaluation status to failed
        try:
            cur.execute(
                """
                UPDATE evaluation
                SET evaluation_status = 'failed'
                WHERE id = %s
                """,
                (evaluation_id,)
            )
            conn.commit()
        except Exception:
            # Log but continue with the original error
            logger.error("Failed to update evaluation status")
        
        raise HTTPException(
            status_code=500,
            detail=f"Evaluation failed: {str(e)}"
        )
    
    finally:
        cur.close()

