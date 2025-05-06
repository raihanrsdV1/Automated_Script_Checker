from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from database.db_connection import connect
import uuid

router = APIRouter()

# --- Test Models ---

class TestCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    subject_id: str

class TestUpdateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    subject_id: str

class TestAddQuestionRequest(BaseModel):
    question_id: str
    question_order: int = 0  # Default order if not specified

# Model for adding multiple questions at once
class TestAddMultipleQuestionsRequest(BaseModel):
    question_ids: List[str]

# Model for test assignment
class TestAssignRequest(BaseModel):
    student_ids: List[str]

# --- Create Test ---

@router.post("")
async def create_test(req: TestCreateRequest):
    conn = connect()
    cur = conn.cursor()
    test_id = str(uuid.uuid4())
    
    try:
        cur.execute(
            "INSERT INTO question_set (id, name, description, subject_id, is_test) VALUES (%s, %s, %s, %s, %s)",
            (test_id, req.name, req.description, req.subject_id, True)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
        
    return {"id": test_id, "message": "Test created"}

# --- Get All Tests ---

@router.get("", response_model=List[dict])
async def get_tests(subject_id: Optional[str] = Query(None)):
    conn = connect()
    cur = conn.cursor()
    
    try:
        if subject_id:
            cur.execute(
                """
                SELECT qs.id, qs.name, qs.description, qs.subject_id, s.name as subject_name, qs.created_at 
                FROM question_set qs
                JOIN subject s ON qs.subject_id = s.id
                WHERE qs.subject_id = %s AND qs.is_test = TRUE
                ORDER BY qs.created_at DESC
                """,
                (subject_id,)
            )
        else:
            cur.execute(
                """
                SELECT qs.id, qs.name, qs.description, qs.subject_id, s.name as subject_name, qs.created_at 
                FROM question_set qs
                JOIN subject s ON qs.subject_id = s.id
                WHERE qs.is_test = TRUE
                ORDER BY qs.created_at DESC
                """
            )
        rows = cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    result = []
    for r in rows:
        result.append({
            "id": r[0],
            "name": r[1],
            "description": r[2],
            "subject_id": r[3],
            "subject_name": r[4],
            "created_at": r[5]
        })
    return result

# --- Get Test by ID ---

@router.get("/{test_id}", response_model=dict)
async def get_test(test_id: str):
    conn = connect()
    cur = conn.cursor()
    
    try:
        # Get test details
        cur.execute(
            """
            SELECT qs.id, qs.name, qs.description, qs.subject_id, s.name as subject_name, qs.created_at 
            FROM question_set qs
            JOIN subject s ON qs.subject_id = s.id
            WHERE qs.id = %s AND qs.is_test = TRUE
            """,
            (test_id,)
        )
        test = cur.fetchone()
        
        if not test:
            raise HTTPException(status_code=404, detail="Test not found")
            
        # Get questions in this test
        cur.execute(
            """
            SELECT q.id, q.subject_id, s.name as subject_name, q.question_text, q.question_rubric, 
                   q.total_marks, qsm.question_order 
            FROM question q
            JOIN subject s ON q.subject_id = s.id
            JOIN question_set_mapping qsm ON q.id = qsm.question_id
            WHERE qsm.question_set_id = %s
            ORDER BY qsm.question_order
            """,
            (test_id,)
        )
        questions = cur.fetchall()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Format the response
    question_list = []
    for q in questions:
        question_list.append({
            "id": q[0],
            "subject_id": q[1],
            "subject_name": q[2],
            "question_text": q[3],
            "question_rubric": q[4],
            "total_marks": q[5],
            "order": q[6]
        })
    
    return {
        "id": test[0],
        "name": test[1],
        "description": test[2],
        "subject_id": test[3],
        "subject_name": test[4],
        "created_at": test[5],
        "questions": question_list
    }

# --- Update Test ---

@router.put("/{test_id}")
async def update_test(
    test_id: str, 
    req: TestUpdateRequest
):
    conn = connect()
    cur = conn.cursor()
    
    try:
        # Verify this is a test
        cur.execute(
            "SELECT 1 FROM question_set WHERE id = %s ",
            (test_id,)
        )
        if cur.fetchone() is None:
            raise HTTPException(status_code=404, detail="Test not found")
            
        cur.execute(
            "UPDATE question_set SET name = %s, description = %s, subject_id = %s WHERE id = %s",
            (req.name, req.description, req.subject_id, test_id)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
        
    return {"message": "Test updated"}

# --- Delete Test ---

@router.delete("/{test_id}")
async def delete_test(test_id: str):
    conn = connect()
    cur = conn.cursor()
    
    try:
        # Verify this is a test
        cur.execute(
            "SELECT 1 FROM question_set WHERE id = %s ",
            (test_id,)
        )
        if cur.fetchone() is None:
            raise HTTPException(status_code=404, detail="Test not found")
            
        # First delete mappings (should cascade, but being explicit)
        cur.execute("DELETE FROM question_set_mapping WHERE question_set_id = %s", (test_id,))
        
        # Then delete the test
        cur.execute("DELETE FROM question_set WHERE id = %s", (test_id,))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
        
    return {"message": "Test deleted"}

# --- Add Question to Test (Single) ---

@router.post("/{test_id}/questions")
async def add_question_to_test(
    test_id: str, 
    req: TestAddQuestionRequest
):
    conn = connect()
    cur = conn.cursor()
    mapping_id = str(uuid.uuid4())
    
    try:
        # Check if test exists
        cur.execute(
            "SELECT 1 FROM question_set WHERE id = %s", 
            (test_id,)
        )
        if cur.fetchone() is None:
            raise HTTPException(status_code=404, detail="Test not found")
            
        # Check if question exists
        cur.execute("SELECT 1 FROM question WHERE id = %s", (req.question_id,))
        if cur.fetchone() is None:
            raise HTTPException(status_code=404, detail="Question not found")
            
        # Check if mapping already exists
        cur.execute(
            "SELECT 1 FROM question_set_mapping WHERE question_set_id = %s AND question_id = %s",
            (test_id, req.question_id)
        )
        
        if cur.fetchone() is not None:
            raise HTTPException(status_code=400, detail="Question already in test")
        
        # Add question to test
        cur.execute(
            "INSERT INTO question_set_mapping (id, question_set_id, question_id, question_order) VALUES (%s, %s, %s, %s)",
            (mapping_id, test_id, req.question_id, req.question_order)
        )
        conn.commit()
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
        
    return {"id": mapping_id, "message": "Question added to test"}

# --- Add Multiple Questions to Test ---

@router.post("/{test_id}/questions/batch")
async def add_questions_to_test(
    test_id: str, 
    req: TestAddMultipleQuestionsRequest
):
    conn = connect()
    cur = conn.cursor()
    added_count = 0
    
    try:
        # Check if test exists
        cur.execute(
            "SELECT 1 FROM question_set WHERE id = %s ", 
            (test_id,)
        )
        if cur.fetchone() is None:
            raise HTTPException(status_code=404, detail="Test not found")
        
        # Get the current highest order value
        cur.execute(
            "SELECT COALESCE(MAX(question_order), 0) FROM question_set_mapping WHERE question_set_id = %s", 
            (test_id,)
        )
        current_max_order = cur.fetchone()[0] or 0
        
        # Process each question ID
        for i, question_id in enumerate(req.question_ids):
            # Generate a unique ID for this mapping
            mapping_id = str(uuid.uuid4())
            
            # Check if question exists
            cur.execute("SELECT 1 FROM question WHERE id = %s", (question_id,))
            if cur.fetchone() is None:
                continue  # Skip non-existent questions
                
            # Check if mapping already exists
            cur.execute(
                "SELECT 1 FROM question_set_mapping WHERE question_set_id = %s AND question_id = %s",
                (test_id, question_id)
            )
            
            if cur.fetchone() is not None:
                continue  # Skip questions already in the test
            
            # Add question to test with incremented order
            question_order = current_max_order + i + 1
            cur.execute(
                "INSERT INTO question_set_mapping (id, question_set_id, question_id, question_order) VALUES (%s, %s, %s, %s)",
                (mapping_id, test_id, question_id, question_order)
            )
            added_count += 1
        
        conn.commit()
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
        
    return {"message": f"Added {added_count} questions to test"}

# --- Remove Question from Test ---

@router.delete("/{test_id}/questions/{question_id}")
async def remove_question_from_test(
    test_id: str,
    question_id: str
):
    conn = connect()
    cur = conn.cursor()
    
    try:
        # Verify this is a test
        cur.execute(
            "SELECT 1 FROM question_set WHERE id = %s ",
            (test_id,)
        )
        if cur.fetchone() is None:
            raise HTTPException(status_code=404, detail="Test not found")
            
        cur.execute(
            "DELETE FROM question_set_mapping WHERE question_set_id = %s AND question_id = %s",
            (test_id, question_id)
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Question not found in test")
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
        
    return {"message": "Question removed from test"}

# --- Publish Test (make it available to students) ---

@router.post("/{test_id}/publish")
async def publish_test(test_id: str):
    conn = connect()
    cur = conn.cursor()
    
    try:
        # Verify this is a test
        cur.execute(
            "SELECT 1 FROM question_set WHERE id = %s ",
            (test_id,)
        )
        if cur.fetchone() is None:
            raise HTTPException(status_code=404, detail="Test not found")
            
        cur.execute(
            "UPDATE question_set SET is_published = TRUE WHERE id = %s",
            (test_id,)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
        
    return {"message": "Test published"}

# --- Unpublish Test ---

@router.post("/{test_id}/unpublish")
async def unpublish_test(test_id: str):
    conn = connect()
    cur = conn.cursor()
    
    try:
        # Verify this is a test
        cur.execute(
            "SELECT 1 FROM question_set WHERE id = %s ",
            (test_id,)
        )
        if cur.fetchone() is None:
            raise HTTPException(status_code=404, detail="Test not found")
            
        cur.execute(
            "UPDATE question_set SET is_published = FALSE WHERE id = %s",
            (test_id,)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
        
    return {"message": "Test unpublished"}

# --- Assign Test to Students ---

@router.post("/{test_id}/assign")
async def assign_test_to_students(
    test_id: str,
    req: TestAssignRequest
):
    conn = connect()
    cur = conn.cursor()
    
    try:
        # Verify this is a test
        cur.execute(
            "SELECT 1 FROM question_set WHERE id = %s ",
            (test_id,)
        )
        if cur.fetchone() is None:
            raise HTTPException(status_code=404, detail="Test not found")
        
        # Process each student ID
        for student_id in req.student_ids:
            assignment_id = str(uuid.uuid4())
            
            # Check if student exists
            cur.execute("SELECT 1 FROM users WHERE id = %s", (student_id,))
            if cur.fetchone() is None:
                continue  # Skip non-existent students
                
            # Check if already assigned
            cur.execute(
                "SELECT 1 FROM test_assignment WHERE test_id = %s AND student_id = %s",
                (test_id, student_id)
            )
            
            if cur.fetchone() is not None:
                continue  # Skip students who already have this test assigned
            
            # Create assignment
            cur.execute(
                "INSERT INTO test_assignment (id, test_id, student_id) VALUES (%s, %s, %s)",
                (assignment_id, test_id, student_id)
            )
        
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
        
    return {"message": "Test assigned to students"}

# --- Get Assigned Tests for Current User ---

@router.get("/assigned")
async def get_assigned_tests(user_id: str):
    conn = connect()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            SELECT qs.id, qs.name, qs.description, qs.subject_id, s.name as subject_name, qs.created_at 
            FROM question_set qs
            JOIN subject s ON qs.subject_id = s.id
            JOIN test_assignment ta ON qs.id = ta.test_id
            WHERE ta.student_id = %s AND qs.is_test = TRUE
            ORDER BY qs.created_at DESC
            """,
            (user_id,)
        )
        rows = cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    result = []
    for r in rows:
        result.append({
            "id": r[0],
            "name": r[1],
            "description": r[2],
            "subject_id": r[3],
            "subject_name": r[4],
            "created_at": r[5]
        })
    return result