import os
import uuid
import json
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Dict
from utils.auth import require_role
from database.db_connection import connect
from utils.firebase import upload_file_to_firebase
from utils.pdf_extractor import extract_text_from_pdf
import asyncio
from tempfile import NamedTemporaryFile
import logging
import shutil

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

# File size limit in bytes (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024
# Maximum number of files in a batch
MAX_BATCH_FILES = 10

class SubmissionCreate(BaseModel):
    question_id: str
    question_set_id: Optional[str] = None

class SubmissionItem(BaseModel):
    question_id: str
    file_key: str  # Key to identify the file in the form data

class BatchSubmissionRequest(BaseModel):
    submissions: List[SubmissionItem]
    question_set_id: Optional[str] = None

@router.post("")
async def submit_answer(
    background_tasks: BackgroundTasks,
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
    
    # Read a small chunk to initialize the file without loading it all
    content = await file.read(1024)
    await file.seek(0)  # Reset file position

    evaluation_id = str(uuid.uuid4())

    # Create a temporary file to store the uploaded PDF
    temp_file = NamedTemporaryFile(delete=False, suffix=".pdf")
    try:
        # Save the uploaded file to the temporary file without loading it entirely into memory
        with open(temp_file.name, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Check if question exists
        conn = connect()
        cur = conn.cursor()
        try:
            cur.execute("SELECT id FROM question WHERE id = %s", (question_id,))
            question_result = cur.fetchone()
            if not question_result:
                raise HTTPException(status_code=404, detail="Question not found")
        finally:
            cur.close()
            conn.close()

        # Process the file in the background
        background_tasks.add_task(
            process_single_submission,
            file_path=temp_file.name,
            evaluation_id=evaluation_id,
            student_id=student_id,
            question_id=question_id,
            question_set_id=question_set_id
        )

        logger.info(f"Queued submission {evaluation_id} for processing")

    except Exception as e:
        logger.error(f"Submission failed: {str(e)}")
        # Clean up the temporary file
        if os.path.exists(temp_file.name):
            os.unlink(temp_file.name)
        raise HTTPException(status_code=500, detail=f"Submission failed: {str(e)}")

    return {
        "id": evaluation_id,
        "message": "Submission queued for processing",
        "status": "processing"
    }

async def process_single_submission(
    file_path: str,
    evaluation_id: str,
    student_id: str,
    question_id: str,
    question_set_id: Optional[str] = None
):
    """Process a single submission in the background."""
    pdf_link = ""
    answer_text = ""
    
    try:
        # --- 1. Upload PDF to Firebase ---
        firebase_path = f"submissions/{student_id}/{evaluation_id}.pdf"
        logger.info(f"Uploading PDF to Firebase: {firebase_path}")
        pdf_link = await upload_file_to_firebase(file_path, firebase_path, "application/pdf")
        
        # --- 2. Extract Text using OCR with Gemini API ---
        logger.info(f"Extracting text from PDF: {evaluation_id}")
        try:
            answer_text = extract_text_from_pdf(file_path)
            logger.info(f"Text extraction complete: {len(answer_text)} characters")
        except Exception as e:
            logger.error(f"Text extraction failed: {str(e)}")
            answer_text = ""  # Use empty string if extraction fails

        # --- 3. Save Evaluation to Database ---
        conn = connect()
        cur = conn.cursor()
        try:
            cur.execute(
                """
                INSERT INTO evaluation (
                    id, student_id, question_id, question_set_id, 
                    answer_pdf_url, answer_text, evaluation_status
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    evaluation_id, student_id, question_id, question_set_id, 
                    pdf_link, answer_text, 'pending'
                )
            )
            conn.commit()
            logger.info(f"Evaluation {evaluation_id} saved to database")
        except Exception as e:
            conn.rollback()
            logger.error(f"Database error: {str(e)}")
            raise
        finally:
            cur.close()
            conn.close()

        # --- 4. Trigger LLM Evaluation (asynchronously) ---
        asyncio.create_task(trigger_evaluation(evaluation_id))
        logger.info(f"Evaluation triggered for submission {evaluation_id}")

    except Exception as e:
        logger.error(f"Error processing submission {evaluation_id}: {str(e)}")
    finally:
        # Remove the temporary file
        if os.path.exists(file_path):
            os.unlink(file_path)

@router.post("/batch")
async def submit_batch_answers(
    background_tasks: BackgroundTasks,
    batch_data: str = Form(...),
    question_set_id: Optional[str] = Form(None),
    files: List[UploadFile] = File(...),
    user=Depends(require_role(['student']))
):
    """
    Handle multiple file submissions at once.
    
    The batch_data parameter should be a JSON string containing a list of objects, each with:
    - question_id: The ID of the question this file answers
    - file_key: A unique identifier to match with the uploaded files
    """
    # Get student ID from authenticated user
    student_id = user.get('user_id')
    if not student_id:
        raise HTTPException(status_code=403, detail="User ID not found in authentication token")
    
    # Parse the batch data
    try:
        submissions = json.loads(batch_data)
        if not isinstance(submissions, list):
            raise ValueError("batch_data must be a JSON array")
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in batch_data")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Check if batch size is too large
    if len(files) > MAX_BATCH_FILES:
        raise HTTPException(
            status_code=400, 
            detail=f"Too many files in batch. Maximum allowed is {MAX_BATCH_FILES}."
        )
    
    # Create a dictionary to easily look up files by their keys
    file_dict = {}
    for file in files:
        # Validate file size
        # Read a small chunk to initialize the file without loading it all
        content = await file.read(1024)
        await file.seek(0)  # Reset file position
        
        # Validate file type
        if file.content_type != 'application/pdf':
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type for {file.filename}. Only PDF is allowed."
            )

        # Assuming the filename is used as the file_key
        file_key = file.filename
        file_dict[file_key] = file
    
    # Create a temporary directory for storing the files
    temp_dir = f"/tmp/batch_submission_{uuid.uuid4()}"
    os.makedirs(temp_dir, exist_ok=True)
    
    # Store metadata for background processing
    submission_metadata = []
    
    # Validate all submissions first
    conn = connect()
    cur = conn.cursor()
    try:
        for submission in submissions:
            question_id = submission.get("question_id")
            file_key = submission.get("file_key")
            
            if not question_id or not file_key:
                raise HTTPException(status_code=400, detail="Each submission must have question_id and file_key")
            
            # Get the file
            file = file_dict.get(file_key)
            if not file:
                raise HTTPException(status_code=400, detail=f"No file found with key: {file_key}")
            
            # Check if question exists
            cur.execute("SELECT id FROM question WHERE id = %s", (question_id,))
            question_result = cur.fetchone()
            if not question_result:
                raise HTTPException(status_code=404, detail=f"Question with ID {question_id} not found")
            
            # Add to metadata for background processing
            submission_metadata.append({
                "question_id": question_id,
                "file_key": file_key,
                "evaluation_id": str(uuid.uuid4())
            })
    finally:
        cur.close()
        conn.close()
    
    # Save files to temporary directory
    for metadata in submission_metadata:
        file = file_dict[metadata["file_key"]]
        file_path = os.path.join(temp_dir, f"{metadata['evaluation_id']}.pdf")
        
        # Save file to disk without loading it all into memory
        with open(file_path, "wb") as buffer:
            # Copy file in small chunks to avoid memory issues
            shutil.copyfileobj(file.file, buffer)
    
    # Schedule the background task
    background_tasks.add_task(
        process_batch_submissions,
        temp_dir=temp_dir,
        metadata=submission_metadata,
        student_id=student_id,
        question_set_id=question_set_id
    )
    
    # Return immediately with pending status
    return {
        "message": f"Processing {len(submission_metadata)} submissions in the background",
        "submissions": [
            {
                "id": meta["evaluation_id"],
                "question_id": meta["question_id"],
                "status": "processing"
            } 
            for meta in submission_metadata
        ]
    }

async def process_batch_submissions(
    temp_dir: str,
    metadata: List[Dict],
    student_id: str,
    question_set_id: Optional[str] = None
):
    """Background task to process batch submissions without blocking the API response."""
    conn = None
    try:
        conn = connect()
        cur = conn.cursor()
        
        for meta in metadata:
            evaluation_id = meta["evaluation_id"]
            question_id = meta["question_id"]
            file_path = os.path.join(temp_dir, f"{evaluation_id}.pdf")
            
            try:
                # Upload PDF to Firebase
                firebase_path = f"submissions/{student_id}/{evaluation_id}.pdf"
                logger.info(f"Uploading PDF to Firebase: {firebase_path}")
                pdf_link = await upload_file_to_firebase(file_path, firebase_path, "application/pdf")
                
                # Extract Text using OCR - but don't wait for it to complete
                logger.info(f"Extracting text from PDF: {evaluation_id}")
                try:
                    answer_text = extract_text_from_pdf(file_path)
                    logger.info(f"Text extraction complete: {len(answer_text)} characters")
                except Exception as e:
                    logger.error(f"Text extraction failed: {str(e)}")
                    answer_text = ""  # Use empty string if extraction fails
                
                # Save Evaluation to Database
                cur.execute(
                    """
                    INSERT INTO evaluation (
                        id, student_id, question_id, question_set_id, 
                        answer_pdf_url, answer_text, evaluation_status
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        evaluation_id, student_id, question_id, question_set_id, 
                        pdf_link, answer_text, 'pending'
                    )
                )
                conn.commit()
                
                # Schedule LLM evaluation, but don't wait for it
                asyncio.create_task(trigger_evaluation(evaluation_id))
                
            except Exception as e:
                logger.error(f"Error processing submission {evaluation_id}: {str(e)}")
                conn.rollback()
            
            # Clean up the file after processing
            if os.path.exists(file_path):
                os.remove(file_path)
    except Exception as e:
        logger.error(f"Batch processing error: {str(e)}")
    finally:
        if conn:
            if cur:
                cur.close()
            conn.close()
        
        # Clean up the temporary directory
        try:
            shutil.rmtree(temp_dir)
        except Exception as e:
            logger.error(f"Error cleaning up temp directory: {str(e)}")

async def trigger_evaluation(evaluation_id: str):
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
            logger.info(f"Starting evaluation for submission {evaluation_id}")
            await evaluate_submission(evaluation_id)
            logger.info(f"Evaluation completed for submission {evaluation_id}")
        except ImportError:
            logger.warning(f"LLM evaluation module not found, skipping evaluation for {evaluation_id}")
    except Exception as e:
        logger.error(f"Error triggering evaluation for submission {evaluation_id}: {e}")
        # Log this error but don't fail the submission process

async def trigger_batch_evaluation(evaluation_ids: List[str]):
    """
    Trigger LLM evaluation for multiple submissions.
    This processes them one by one to avoid overloading the system.
    """
    try:
        from llm.evaluate import evaluate_submission
        
        for evaluation_id in evaluation_ids:
            try:
                logger.info(f"Starting evaluation for submission {evaluation_id}")
                await evaluate_submission(evaluation_id)
                logger.info(f"Evaluation completed for submission {evaluation_id}")
            except Exception as e:
                logger.error(f"Error evaluating submission {evaluation_id}: {e}")
                # Continue with the next submission even if one fails
    except ImportError:
        logger.warning(f"LLM evaluation module not found, skipping evaluation for {len(evaluation_ids)} submissions")

