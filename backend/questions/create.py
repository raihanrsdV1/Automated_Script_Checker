from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.db_connection import connect
import uuid
import logging
from typing import List, Optional

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()

class RubricItem(BaseModel):
    rubric_text: str
    marks: float
    serial_number: int

class QuestionCreateRequest(BaseModel):
    subject_id: str
    teacher_id: Optional[str] = None  # Make teacher_id optional
    question_text: str
    rubrics: List[RubricItem]  # List of rubric items

@router.post("")
async def create_question(req: QuestionCreateRequest):
    conn = None
    try:
        # Get a new database connection
        conn = connect()
        cur = conn.cursor()
        
        # Generate a new UUID for the question
        question_id = str(uuid.uuid4())
        
        # Log the request data for debugging
        logger.info(f"Creating question with subject_id: {req.subject_id}, teacher_id: {req.teacher_id}")
        
        # Insert the question first - use teacher_id if provided, otherwise use a default value
        teacher_id = req.teacher_id
        if not teacher_id:
            # Use a default teacher ID for testing
            logger.warning("No teacher_id provided, using default")
            
            # Check if any teacher exists in the system
            cur.execute("SELECT user_id FROM teacher LIMIT 1")
            teacher_row = cur.fetchone()
            if teacher_row:
                teacher_id = teacher_row[0]
                logger.info(f"Using existing teacher with ID: {teacher_id}")
            else:
                # If no teachers in system, we can't create the question
                raise HTTPException(status_code=400, detail="No teacher found in the system")
        
        # Begin transaction by setting autocommit to false
        conn.autocommit = False
        
        # Now insert with the validated teacher_id
        try:
            cur.execute(
                "INSERT INTO question (id, subject_id, teacher_id, question_text) VALUES (%s, %s, %s, %s)",
                (question_id, req.subject_id, teacher_id, req.question_text)
            )
            logger.info(f"Question record created with ID: {question_id}")
        except Exception as insert_err:
            logger.error(f"Error inserting question: {str(insert_err)}")
            raise
        
        # Insert each rubric item
        try:
            for i, rubric in enumerate(req.rubrics):
                # Ensure serial_number is set properly
                serial_number = rubric.serial_number if hasattr(rubric, 'serial_number') else (i + 1)
                
                cur.execute(
                    "INSERT INTO rubric (question_id, rubric_text, marks, serial_number) VALUES (%s, %s, %s, %s)",
                    (question_id, rubric.rubric_text, rubric.marks, serial_number)
                )
            logger.info(f"Created {len(req.rubrics)} rubric items for question {question_id}")
        except Exception as rubric_err:
            logger.error(f"Error inserting rubrics: {str(rubric_err)}")
            raise
        
        # Commit transaction
        conn.commit()
        logger.info("Transaction committed successfully")
        
        # Create a new cursor for reading data after the transaction
        cur.close()
        cur = conn.cursor()
        
        # Fetch the newly created question with subject name and rubrics for frontend display
        cur.execute(
            """
            SELECT q.id, q.subject_id, s.name as subject_name, q.question_text, q.teacher_id
            FROM question q
            JOIN subject s ON q.subject_id = s.id
            WHERE q.id = %s
            """,
            (question_id,)
        )
        row = cur.fetchone()
        
        if row:
            question_data = {
                "id": row[0],
                "subject_id": row[1],
                "subject_name": row[2],
                "question_text": row[3],
                "teacher_id": row[4],
                "rubrics": []
            }
            
            # Fetch rubrics for this question
            cur.execute(
                """
                SELECT id, rubric_text, marks, serial_number 
                FROM rubric 
                WHERE question_id = %s
                ORDER BY serial_number
                """,
                (question_id,)
            )
            
            rubric_rows = cur.fetchall()
            for r_row in rubric_rows:
                question_data["rubrics"].append({
                    "id": r_row[0],
                    "rubric_text": r_row[1],
                    "marks": r_row[2],
                    "serial_number": r_row[3]
                })
            
            # Calculate total marks from rubrics
            total_marks = sum(float(r["marks"]) for r in question_data["rubrics"])
            question_data["total_marks"] = total_marks
            
            return question_data
        
        return {"id": question_id, "message": "Question created"}
    
    except Exception as e:
        logger.error(f"Error creating question: {str(e)}")
        if conn:
            try:
                conn.rollback()
            except Exception as rollback_err:
                logger.error(f"Error rolling back transaction: {str(rollback_err)}")
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if conn:
            try:
                # Reset autocommit before closing connection
                if not conn.closed:
                    conn.autocommit = True
                    conn.close()
            except Exception as close_err:
                logger.error(f"Error closing connection: {str(close_err)}")