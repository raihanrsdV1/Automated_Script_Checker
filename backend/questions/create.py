from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.db_connection import connect
import uuid

router = APIRouter()

class QuestionCreateRequest(BaseModel):
    subject_id: str
    question_text: str
    question_rubric: str
    marks: float

@router.post("")
async def create_question(req: QuestionCreateRequest):
    conn = connect()
    cur = conn.cursor()
    question_id = str(uuid.uuid4())
    try:
        cur.execute(
            "INSERT INTO question (id, subject_id, question_text, question_rubric, marks) VALUES (%s, %s, %s, %s, %s)",
            (question_id, req.subject_id, req.question_text, req.question_rubric, req.marks)
        )
        conn.commit()
        
        # Fetch the newly created question with subject name for frontend display
        cur.execute(
            """
            SELECT q.id, q.subject_id, s.name as subject_name, q.question_text, q.question_rubric, q.marks 
            FROM question q
            JOIN subject s ON q.subject_id = s.id
            WHERE q.id = %s
            """,
            (question_id,)
        )
        row = cur.fetchone()
        if row:
            return {
                "id": row[0],
                "subject_id": row[1],
                "subject_name": row[2],
                "question_text": row[3],
                "question_rubric": row[4],
                "marks": row[5]
            }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()
    
    return {"id": question_id, "message": "Question created"}