import os
import uuid
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from pydantic import BaseModel
from typing import Optional
from utils.auth import require_role
from database.db_connection import connect
from utils.firebase import upload_file_to_firebase
from utils.pdf_extractor import extract_text_from_pdf
import asyncio
from tempfile import NamedTemporaryFile
import logging

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

class SubmissionCreate(BaseModel):
    question_id: str
    question_set_id: Optional[str] = None

@router.post("")
async def submit_answer(
    question_id: str = Form(...),
    question_set_id: str = Form(None),
    file: UploadFile = File(...),
    user=Depends(require_role(['student']))
):
    # Get student ID from authenticated user
    student_id = user.get('user_id')
    if not student_id:
        raise HTTPException(status_code=403, detail="User ID not found in authentication token")

    # Validate file type
    if file.content_type != 'application/pdf':
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF is allowed.")

    conn = connect()
    cur = conn.cursor()
    submission_id = str(uuid.uuid4())
    pdf_link = ""
    solution_text = ""

    # Create a temporary file to store the uploaded PDF
    temp_file = NamedTemporaryFile(delete=False, suffix=".pdf")
    try:
        # Save the uploaded file to the temporary file
        file_content = await file.read()
        temp_file.write(file_content)
        temp_file.close()

        # --- 1. Upload PDF to Firebase ---
        firebase_path = f"submissions/{student_id}/{submission_id}.pdf"
        logger.info(f"Uploading PDF to Firebase: {firebase_path}")
        pdf_link = await upload_file_to_firebase(temp_file.name, firebase_path, file.content_type)
        
        # --- 2. Extract Text using OCR with Gemini API ---
        # This uses our implemented pdf_extractor utility
        logger.info(f"Extracting text from PDF: {submission_id}")
        solution_text = extract_text_from_pdf(temp_file.name)
        logger.info(f"Text extraction complete: {len(solution_text)} characters")

        # --- 3. Check if question exists and get its marks ---
        cur.execute("SELECT marks FROM question WHERE id = %s", (question_id,))
        question_result = cur.fetchone()
        if not question_result:
            raise HTTPException(status_code=404, detail="Question not found")
        
        question_marks = question_result[0]

        # --- 4. Save Submission to Database ---
        cur.execute(
            """
            INSERT INTO submission (
                id, student_id, question_id, question_set_id, 
                solution_pdf_url, solution_text, evaluated, result
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                submission_id, student_id, question_id, question_set_id, 
                pdf_link, solution_text, False, 0
            )
        )
        conn.commit()
        logger.info(f"Submission {submission_id} saved to database")

        # --- 5. Trigger LLM Evaluation (asynchronously) ---
        # We'll start this process but not wait for it to complete
        asyncio.create_task(trigger_evaluation(submission_id))
        logger.info(f"Evaluation triggered for submission {submission_id}")

    except Exception as e:
        conn.rollback()
        logger.error(f"Submission failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Submission failed: {str(e)}")
    finally:
        cur.close()
        # Remove the temporary file
        if os.path.exists(temp_file.name):
            os.unlink(temp_file.name)

    return {
        "id": submission_id, 
        "pdf_url": pdf_link, 
        "message": "Submission created successfully",
        "text_extracted": len(solution_text) > 0
    }

@router.get("/user")
async def get_user_submissions(user=Depends(require_role(['student']))):
    """Get all submissions for the current authenticated user"""
    student_id = user.get('user_id')
    
    conn = connect()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            SELECT 
                s.id, s.question_id, s.question_set_id, s.solution_pdf_url, 
                s.solution_text, s.evaluated, s.result, s.feedback, 
                s.created_at, q.question_text, q.marks, 
                qs.name as question_set_name,
                EXISTS (SELECT 1 FROM recheck r WHERE r.submission_id = s.id) as recheck_requested
            FROM 
                submission s
            JOIN 
                question q ON s.question_id = q.id
            LEFT JOIN 
                question_set qs ON s.question_set_id = qs.id
            WHERE 
                s.student_id = %s
            ORDER BY 
                s.created_at DESC
            """,
            (student_id,)
        )
        
        submissions = []
        for row in cur.fetchall():
            submissions.append({
                "id": row[0],
                "question_id": row[1],
                "question_set_id": row[2],
                "solution_pdf_url": row[3],
                "extracted_text": row[4],
                "evaluated": row[5],
                "result": row[6],
                "feedback": row[7],
                "created_at": row[8],
                "question_text": row[9],
                "question_marks": row[10],
                "question_set_name": row[11],
                "recheck_requested": row[12]
            })
            
        return submissions
        
    except Exception as e:
        logger.error(f"Failed to retrieve submissions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve submissions: {str(e)}")
    finally:
        cur.close()

async def trigger_evaluation(submission_id: str):
    """
    Trigger the LLM evaluation process for a submission.
    This function is meant to be run asynchronously.
    """
    try:
        # In a production environment, this would likely:
        # 1. Add the job to a queue (e.g., Celery, RQ)
        # 2. Or make an API call to a separate evaluation service
        
        # For now, we'll import and call the evaluate function if it exists
        try:
            from llm.evaluate import evaluate_submission
            logger.info(f"Starting evaluation for submission {submission_id}")
            await evaluate_submission(submission_id)
            logger.info(f"Evaluation completed for submission {submission_id}")
        except ImportError:
            logger.warning(f"LLM evaluation module not found, skipping evaluation for {submission_id}")
    except Exception as e:
        logger.error(f"Error triggering evaluation for submission {submission_id}: {e}")
        # Log this error but don't fail the submission process

