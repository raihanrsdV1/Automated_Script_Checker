import logging
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from database.db_connection import connect
import uuid

router = APIRouter()
logger = logging.getLogger(__name__)

# --- Question Set Models ---

class QuestionSetCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    subject_id: str
    teacher_id: str  # Added teacher_id field

class QuestionSetUpdateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    subject_id: str
    teacher_id: str  # Added teacher_id field

class QuestionSetAddQuestionRequest(BaseModel):
    question_id: str
    question_order: int = 0  # Default order if not specified

# New model for adding multiple questions at once
class QuestionSetAddMultipleQuestionsRequest(BaseModel):
    question_ids: List[str]

# --- Create Question Set ---

@router.post("/sets")
async def create_question_set(req: QuestionSetCreateRequest):
    conn = connect()
    cur = conn.cursor()
    question_set_id = str(uuid.uuid4())
    
    try:
        cur.execute(
            "INSERT INTO question_set (id, name, description, subject_id, teacher_id) VALUES (%s, %s, %s, %s, %s)",
            (question_set_id, req.name, req.description, req.subject_id, req.teacher_id)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"Error creating question set: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error creating question set: {str(e)}")
        
    return {"id": question_set_id, "message": "Question set created"}

# --- Get All Question Sets ---

@router.get("/sets", response_model=List[dict])
async def get_question_sets(subject_id: Optional[str] = Query(None)):
    conn = connect()
    cur = conn.cursor()
    
    try:
        if subject_id:
            cur.execute(
                """
                SELECT qs.id, qs.name, qs.description, qs.subject_id, s.name as subject_name, 
                       qs.teacher_id, qs.created_at 
                FROM question_set qs
                JOIN subject s ON qs.subject_id = s.id
                WHERE qs.subject_id = %s 
                ORDER BY qs.created_at DESC
                """,
                (subject_id,)
            )
        else:
            cur.execute(
                """
                SELECT qs.id, qs.name, qs.description, qs.subject_id, s.name as subject_name, 
                       qs.teacher_id, qs.created_at 
                FROM question_set qs
                JOIN subject s ON qs.subject_id = s.id
                ORDER BY qs.created_at DESC
                """
            )
        rows = cur.fetchall()
    except Exception as e:
        logger.error(f"Error fetching question sets: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching question sets: {str(e)}")
    
    result = []
    for r in rows:
        result.append({
            "id": r[0],
            "name": r[1],
            "description": r[2],
            "subject_id": r[3],
            "subject_name": r[4],
            "teacher_id": r[5],
            "created_at": r[6]
        })
    return result

# --- Get Question Set by ID ---

@router.get("/sets/{question_set_id}", response_model=dict)
async def get_question_set(question_set_id: str):
    conn = connect()
    cur = conn.cursor()
    
    try:
        # Get question set details
        cur.execute(
            """
            SELECT qs.id, qs.name, qs.description, qs.subject_id, s.name as subject_name, 
                   qs.teacher_id, qs.created_at 
            FROM question_set qs
            JOIN subject s ON qs.subject_id = s.id
            WHERE qs.id = %s
            """,
            (question_set_id,)
        )
        question_set = cur.fetchone()
        
        if not question_set:
            raise HTTPException(status_code=404, detail="Question set not found")
            
        # Get questions in this set with their rubrics
        cur.execute(
            """
            SELECT q.id, q.subject_id, s.name as subject_name, q.question_text, qsm.question_order,
                   COALESCE(SUM(r.marks), 0) as total_marks
            FROM question q
            JOIN subject s ON q.subject_id = s.id
            JOIN question_set_mapping qsm ON q.id = qsm.question_id
            LEFT JOIN rubric r ON q.id = r.question_id
            WHERE qsm.question_set_id = %s
            GROUP BY q.id, q.subject_id, s.name, q.question_text, qsm.question_order
            ORDER BY qsm.question_order
            """,
            (question_set_id,)
        )
        questions = cur.fetchall()
        
    except HTTPException: # Re-raise HTTPException as is (e.g. 404)
        raise
    except Exception as e:
        logger.error(f"Error fetching question set by ID {question_set_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching question set by ID: {str(e)}")
    
    # Format the response
    question_list = []
    for q in questions:
        question_list.append({
            "id": q[0],
            "subject_id": q[1],
            "subject_name": q[2],
            "question_text": q[3],
            "order": q[4],
            "marks": q[5]
        })
    
    return {
        "id": question_set[0],
        "name": question_set[1],
        "description": question_set[2],
        "subject_id": question_set[3],
        "subject_name": question_set[4],
        "teacher_id": question_set[5],
        "created_at": question_set[6],
        "questions": question_list
    }

# --- Update Question Set ---

@router.put("/sets/{question_set_id}")
async def update_question_set(
    question_set_id: str, 
    req: QuestionSetUpdateRequest
):
    conn = connect()
    cur = conn.cursor()
    
    try:
        cur.execute(
            "UPDATE question_set SET name = %s, description = %s, subject_id = %s, teacher_id = %s WHERE id = %s",
            (req.name, req.description, req.subject_id, req.teacher_id, question_set_id)
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Question set not found")
        conn.commit()
    except HTTPException: 
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"Error updating question set {question_set_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error updating question set: {str(e)}")
        
    return {"message": "Question set updated"}

# --- Delete Question Set ---

@router.delete("/sets/{question_set_id}")
async def delete_question_set(question_set_id: str):
    conn = connect()
    cur = conn.cursor()
    
    try:
        # First delete mappings (should cascade, but being explicit)
        cur.execute("DELETE FROM question_set_mapping WHERE question_set_id = %s", (question_set_id,))
        
        # Then delete the question set
        cur.execute("DELETE FROM question_set WHERE id = %s", (question_set_id,))
        
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Question set not found")
            
        conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"Error deleting question set {question_set_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error deleting question set: {str(e)}")
        
    return {"message": "Question set deleted"}

# --- Add Question to Question Set (Single) ---

@router.post("/sets/{question_set_id}/question")
async def add_question_to_set(
    question_set_id: str, 
    req: QuestionSetAddQuestionRequest
):
    conn = connect()
    cur = conn.cursor()
    mapping_id = str(uuid.uuid4())
    
    try:
        # Check if question set exists
        cur.execute("SELECT 1 FROM question_set WHERE id = %s", (question_set_id,))
        if cur.fetchone() is None:
            raise HTTPException(status_code=404, detail="Question set not found")
            
        # Check if question exists
        cur.execute("SELECT 1 FROM question WHERE id = %s", (req.question_id,))
        if cur.fetchone() is None:
            raise HTTPException(status_code=404, detail="Question not found")
            
        # Check if mapping already exists
        cur.execute(
            "SELECT 1 FROM question_set_mapping WHERE question_set_id = %s AND question_id = %s",
            (question_set_id, req.question_id)
        )
        
        if cur.fetchone() is not None:
            raise HTTPException(status_code=400, detail="Question already in set") # 400 is appropriate here
        
        # Add question to set
        cur.execute(
            "INSERT INTO question_set_mapping (id, question_set_id, question_id, question_order) VALUES (%s, %s, %s, %s)",
            (mapping_id, question_set_id, req.question_id, req.question_order)
        )
        conn.commit()
    except HTTPException:
        conn.rollback() # Rollback if an HTTPException (like 404 or 400) occurred
        raise
    except Exception as e:
        logger.error(f"Error adding question to set {question_set_id}: {str(e)}", exc_info=True)
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error adding question to set: {str(e)}")
        
    return {"id": mapping_id, "message": "Question added to set"}

# --- Add Multiple Questions to Question Set ---

@router.post("/sets/{question_set_id}/questions")
async def add_questions_to_set(
    question_set_id: str, 
    req: QuestionSetAddMultipleQuestionsRequest
):
    conn = connect()
    cur = conn.cursor()
    added_count = 0
    
    try:
        # Check if question set exists
        cur.execute("SELECT 1 FROM question_set WHERE id = %s", (question_set_id,))
        if cur.fetchone() is None:
            raise HTTPException(status_code=404, detail="Question set not found")
        
        # Get the current highest order value
        cur.execute(
            "SELECT COALESCE(MAX(question_order), 0) FROM question_set_mapping WHERE question_set_id = %s", 
            (question_set_id,)
        )
        current_max_order = cur.fetchone()[0] or 0
        
        # Process each question ID
        for i, question_id in enumerate(req.question_ids):
            # Generate a unique ID for this mapping
            mapping_id = str(uuid.uuid4())
            
            # Check if question exists
            cur.execute("SELECT 1 FROM question WHERE id = %s", (question_id,))
            if cur.fetchone() is None:
                logger.warning(f"Skipping non-existent question ID {question_id} for question set {question_set_id}")
                continue  # Skip non-existent questions
                
            # Check if mapping already exists
            cur.execute(
                "SELECT 1 FROM question_set_mapping WHERE question_set_id = %s AND question_id = %s",
                (question_set_id, question_id)
            )
            
            if cur.fetchone() is not None:
                logger.warning(f"Skipping question ID {question_id} already in set {question_set_id}")
                continue  # Skip questions already in the set
            
            # Add question to set with incremented order
            question_order = current_max_order + i + 1 # This logic might need review if questions are processed out of order or some are skipped
            cur.execute(
                "INSERT INTO question_set_mapping (id, question_set_id, question_id, question_order) VALUES (%s, %s, %s, %s)",
                (mapping_id, question_set_id, question_id, question_order)
            )
            added_count += 1
        
        conn.commit()
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        logger.error(f"Error adding multiple questions to set {question_set_id}: {str(e)}", exc_info=True)
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error adding multiple questions to set: {str(e)}")
        
    return {"message": f"Added {added_count} questions to set"}

# --- Remove Question from Question Set ---

@router.delete("/sets/{question_set_id}/questions/{question_id}")
async def remove_question_from_set(
    question_set_id: str,
    question_id: str
):
    conn = connect()
    cur = conn.cursor()
    
    try:
        cur.execute(
            "DELETE FROM question_set_mapping WHERE question_set_id = %s AND question_id = %s",
            (question_set_id, question_id)
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Question not found in set")
        conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing question from set {question_set_id} for question {question_id}: {str(e)}", exc_info=True)
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error removing question from set: {str(e)}")
        
    return {"message": "Question removed from set"}

# --- Get Subjects ---

@router.get("/subjects", response_model=List[dict])
async def get_subjects():
    conn = connect()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT id, name FROM subject")
        rows = cur.fetchall()
    except Exception as e:
        logger.error(f"Error fetching subjects: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching subjects: {str(e)}")
    
    result = []
    for r in rows:
        result.append({
            "id": r[0],
            "name": r[1]
        })
    return result