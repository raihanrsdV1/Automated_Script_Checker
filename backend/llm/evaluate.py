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
LLM_EVALUATE_ENDPOINT = "https://7f9d-35-185-46-99.ngrok-free.app/evaluate"

router = APIRouter()

class EvaluationResponse(BaseModel):
    evaluation_id: str
    message: str
    result: float = None
    detailed_result: str = None

@router.post("/{submission_id}", response_model=EvaluationResponse)
async def evaluate_submission(submission_id: str):
    """
    Evaluate a submission using the LLM service.
    This fetches the necessary data from the database,
    sends it to the LLM service, and stores the results.
    """
    logger.info(f"Starting evaluation for submission {submission_id}")
    
    # Connect to database
    conn = connect()
    cur = conn.cursor()
    
    try:
        # 1. Fetch submission data (solution_text and question_id)
        cur.execute(
            """
            SELECT s.solution_text, s.question_id, s.student_id
            FROM submission s
            WHERE s.id = %s
            """,
            (submission_id,)
        )
        submission_data = cur.fetchone()
        
        if not submission_data:
            raise HTTPException(status_code=404, detail="Submission not found")
            
        solution_text, question_id, student_id = submission_data
        
        # 2. Fetch question data (question_text and rubric)
        cur.execute(
            """
            SELECT q.question_text, q.question_rubric, q.marks
            FROM question q
            WHERE q.id = %s
            """,
            (question_id,)
        )
        question_data = cur.fetchone()
        
        if not question_data:
            raise HTTPException(status_code=404, detail="Question not found")
            
        question_text, question_rubric, max_marks = question_data
        
        # Convert max_marks to float to avoid decimal.Decimal multiplication issues
        max_marks = float(max_marks)
        
        # 3. Prepare data for LLM API in the expected format
        evaluation_input = [
            {
                "question": question_text,
                "answer": solution_text,
                "rubric": question_rubric
            }
        ]
        
        # 4. Call LLM API via ngrok
        async with aiohttp.ClientSession() as session:
            logger.info(f"Sending evaluation request to LLM API for submission {submission_id}")
            try:
                async with session.post(
                    LLM_EVALUATE_ENDPOINT,
                    json=evaluation_input,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"LLM API error: {error_text}")
                        raise HTTPException(
                            status_code=500,
                            detail=f"Error from LLM service: {error_text}"
                        )
                    
                    # 5. Parse the LLM response
                    llm_response = await response.json()
                    logger.info(f"Received response from LLM API for submission {submission_id}")
                    
                    # The LLM response is the aggregated results with majority voting
                    # Format should be: List[List[Tuple[rubric_text, score, total, explanation]]]
                    if not llm_response or not isinstance(llm_response, list) or len(llm_response) == 0:
                        raise HTTPException(
                            status_code=500, 
                            detail="Invalid response from LLM service"
                        )
                        
                    # Since we only sent one question-answer pair, we take the first result
                    evaluation_results = llm_response[0]
                    print(evaluation_results)
                    # Calculate total score and generate detailed results
                    total_score = 0
                    total_possible = 0
                    detailed_result = "## Evaluation Results\n\n"
                    
                    for rubric_text, score, total, explanation in evaluation_results:
                        total_score += score
                        total_possible += total
                        detailed_result += f"### {rubric_text}\n"
                        detailed_result += f"**Score:** {score}/{total}\n"
                        detailed_result += f"**Explanation:** {explanation}\n\n"
                    
                    # Add final score to detailed result
                    detailed_result += f"## Final Score: {total_score}/{total_possible}"
                    
                    # Calculate normalized score (as percentage of max marks)
                    normalized_score = (total_score / total_possible) * max_marks if total_possible > 0 else 0
                    
                    # 6. Create evaluated_script record
                    evaluation_id = str(uuid.uuid4())
                    cur.execute(
                        """
                        INSERT INTO evaluated_script (
                            id, result, detailed_result
                        )
                        VALUES (%s, %s, %s)
                        """,
                        (evaluation_id, normalized_score, detailed_result)
                    )
                    
                    # 7. Add question_evaluation records for future analytics
                    cur.execute(
                        """
                        INSERT INTO question_evaluation (
                            evaluation_id, question_id, result, detailed_result
                        )
                        VALUES (%s, %s, %s, %s)
                        """,
                        (evaluation_id, question_id, normalized_score, detailed_result)
                    )
                    
                    # 8. Update submission with evaluation_id
                    cur.execute(
                        """
                        UPDATE submission
                        SET evaluation_id = %s, evaluated = TRUE, result = %s
                        WHERE id = %s
                        """,
                        (evaluation_id, normalized_score, submission_id)
                    )
                    
                    # Commit all database changes
                    conn.commit()
                    
                    logger.info(f"Evaluation completed for submission {submission_id}")
                    
                    # Return response with evaluation details
                    return EvaluationResponse(
                        evaluation_id=evaluation_id,
                        message="Evaluation completed successfully",
                        result=normalized_score,
                        detailed_result=detailed_result
                    )
                    
            except aiohttp.ClientError as e:
                logger.error(f"Error connecting to LLM API: {str(e)}")
                raise HTTPException(
                    status_code=503,
                    detail=f"Could not connect to LLM service: {str(e)}"
                )
    
    except Exception as e:
        conn.rollback()
        logger.error(f"Evaluation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Evaluation failed: {str(e)}"
        )
    
    finally:
        cur.close()

