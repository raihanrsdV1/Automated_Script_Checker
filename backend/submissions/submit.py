\
import os
import uuid
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from pydantic import BaseModel
from utils.auth import require_role
from database.db_connection import connect
# from utils.firebase import bucket # Import Firebase bucket
# from utils.ocr import extract_text_from_pdf # Placeholder for OCR utility

router = APIRouter()

@router.post("")
async def submit_answer(
    student_id: str = Form(...),
    question_id: str = Form(...),
    pdf_file: UploadFile = File(...),
    user=Depends(require_role(['student']))
):
    # TODO: Verify student_id matches authenticated user.get('user_id')

    # Validate file type
    if pdf_file.content_type != 'application/pdf':
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF is allowed.")

    conn = connect()
    cur = conn.cursor()
    submission_id = str(uuid.uuid4())
    pdf_link = ""
    solution_text = ""

    try:
        # --- 1. Upload PDF to Firebase ---
        # file_content = await pdf_file.read()
        # file_name = f"submissions/{student_id}/{submission_id}.pdf"
        # blob = bucket.blob(file_name)
        # blob.upload_from_string(file_content, content_type='application/pdf')
        # pdf_link = blob.public_url # Or signed URL
        pdf_link = f"placeholder/firebase/url/for/{submission_id}.pdf" # Placeholder
        print(f"Placeholder: Uploaded PDF to {pdf_link}")

        # --- 2. Extract Text using OCR (Optional - can be async) ---
        # solution_text = extract_text_from_pdf(file_content) # Pass content or path/URL
        solution_text = "Placeholder OCR text extraction."
        print("Placeholder: Extracted text from PDF.")

        # --- 3. Save Submission to Database ---
        cur.execute(
            """
            INSERT INTO submission (id, student_id, question_id, pdf_link, solution_text)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (submission_id, student_id, question_id, pdf_link, solution_text)
        )
        conn.commit()

        # --- 4. Trigger LLM Evaluation (Optional - can be async) ---
        # Consider triggering evaluation here or via a separate process/queue
        # Example: call evaluate_submission(submission_id) from llm.evaluate
        print("Placeholder: Evaluation trigger would go here.")

    except Exception as e:
        conn.rollback()
        # TODO: Add cleanup logic (e.g., delete uploaded file if DB insert fails)
        raise HTTPException(status_code=500, detail=f"Submission failed: {str(e)}")
    finally:
        cur.close()
        # conn.close() # Keep connection open if using a pool

    return {"id": submission_id, "pdf_link": pdf_link, "message": "Submission created successfully"}

