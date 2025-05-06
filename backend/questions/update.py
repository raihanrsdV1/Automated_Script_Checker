from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.db_connection import connect
from typing import List, Optional
import logging

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()

class RubricUpdateItem(BaseModel):
    id: Optional[str] = None  # Existing rubric ID (if updating an existing one)
    rubric_text: str
    marks: float
    serial_number: int

class QuestionUpdateRequest(BaseModel):
    question_text: str
    rubrics: List[RubricUpdateItem]

@router.put("/{question_id}")
async def update_question(question_id: str, req: QuestionUpdateRequest):
    conn = None
    try:
        # Get a new database connection
        conn = connect()
        cur = conn.cursor()
        
        # Begin transaction
        conn.autocommit = False
        
        # Update the question text
        cur.execute(
            "UPDATE question SET question_text = %s WHERE id = %s",
            (req.question_text, question_id)
        )
        
        if cur.rowcount == 0:
            conn.rollback()
            raise HTTPException(status_code=404, detail="Question not found")
        
        # Get current rubrics for this question
        cur.execute(
            "SELECT id FROM rubric WHERE question_id = %s",
            (question_id,)
        )
        existing_rubric_ids = [row[0] for row in cur.fetchall()]
        
        # Keep track of which rubric IDs we're keeping
        kept_rubric_ids = []
        
        # Update existing rubrics and insert new ones
        for rubric in req.rubrics:
            if rubric.id:  # Existing rubric to update
                if rubric.id in existing_rubric_ids:
                    cur.execute(
                        "UPDATE rubric SET rubric_text = %s, marks = %s, serial_number = %s WHERE id = %s",
                        (rubric.rubric_text, rubric.marks, rubric.serial_number, rubric.id)
                    )
                    kept_rubric_ids.append(rubric.id)
                else:
                    # Provided ID doesn't exist for this question
                    conn.rollback()
                    raise HTTPException(status_code=400, detail=f"Rubric with ID {rubric.id} not found for this question")
            else:  # New rubric to insert
                cur.execute(
                    "INSERT INTO rubric (question_id, rubric_text, marks, serial_number) VALUES (%s, %s, %s, %s)",
                    (question_id, rubric.rubric_text, rubric.marks, rubric.serial_number)
                )
        
        # Delete rubrics that weren't included in the update
        for rubric_id in existing_rubric_ids:
            if rubric_id not in kept_rubric_ids:
                cur.execute("DELETE FROM rubric WHERE id = %s", (rubric_id,))
        
        # Commit the transaction
        conn.commit()
        logger.info(f"Question {question_id} updated successfully with {len(req.rubrics)} rubrics")
        
        # Create a new cursor for reading data after the transaction
        cur.close()
        cur = conn.cursor()
        
        # Fetch the updated question with subject name and rubrics for frontend display
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
            
            # Fetch updated rubrics for this question
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
    
    except Exception as e:
        logger.error(f"Error updating question {question_id}: {str(e)}")
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
        
    return {"message": "Question updated"}