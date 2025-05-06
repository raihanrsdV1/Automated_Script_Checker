from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from database.db_connection import connect

router = APIRouter()

@router.get("", response_model=List[dict])
async def retrieve_questions(subject_id: Optional[str] = Query(None)):
    conn = connect()
    cur = conn.cursor()
    try:
        # First, get all questions
        if subject_id:
            cur.execute(
                """
                SELECT q.id, q.subject_id, s.name as subject_name, q.question_text, q.teacher_id 
                FROM question q
                JOIN subject s ON q.subject_id = s.id
                WHERE q.subject_id = %s
                """,
                (subject_id,)
            )
        else:
            cur.execute(
                """
                SELECT q.id, q.subject_id, s.name as subject_name, q.question_text, q.teacher_id 
                FROM question q
                JOIN subject s ON q.subject_id = s.id
                """
            )
        question_rows = cur.fetchall()
        
        # Prepare the result list
        result = []
        
        # For each question, get its rubrics and build the complete data structure
        for q_row in question_rows:
            question_id = q_row[0]
            
            # Query rubrics for this question
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
            
            # Create the rubrics list
            rubrics = []
            total_marks = 0
            
            for r_row in rubric_rows:
                rubric = {
                    "id": r_row[0],
                    "rubric_text": r_row[1],
                    "marks": r_row[2],
                    "serial_number": r_row[3]
                }
                rubrics.append(rubric)
                total_marks += float(r_row[2])
            
            # Assemble the complete question data
            question_data = {
                "id": q_row[0],
                "subject_id": q_row[1],
                "subject_name": q_row[2],
                "question_text": q_row[3],
                "teacher_id": q_row[4],
                "rubrics": rubrics,
                "total_marks": total_marks
            }
            
            result.append(question_data)
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()
        
    return result

@router.get("/{question_id}", response_model=dict)
async def retrieve_question_by_id(question_id: str):
    conn = connect()
    cur = conn.cursor()
    try:
        # Get question details
        cur.execute(
            """
            SELECT q.id, q.subject_id, s.name as subject_name, q.question_text, q.teacher_id 
            FROM question q
            JOIN subject s ON q.subject_id = s.id
            WHERE q.id = %s
            """,
            (question_id,)
        )
        q_row = cur.fetchone()
        
        if not q_row:
            raise HTTPException(status_code=404, detail="Question not found")
        
        # Query rubrics for this question
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
        
        # Create the rubrics list
        rubrics = []
        total_marks = 0
        
        for r_row in rubric_rows:
            rubric = {
                "id": r_row[0],
                "rubric_text": r_row[1],
                "marks": r_row[2],
                "serial_number": r_row[3]
            }
            rubrics.append(rubric)
            total_marks += float(r_row[2])
        
        # Assemble the complete question data
        question_data = {
            "id": q_row[0],
            "subject_id": q_row[1],
            "subject_name": q_row[2],
            "question_text": q_row[3],
            "teacher_id": q_row[4],
            "rubrics": rubrics,
            "total_marks": total_marks
        }
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()
        
    return question_data