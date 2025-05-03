from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from utils.auth import require_role
from database.db_connection import connect
import uuid

router = APIRouter()

class QuestionCreateRequest(BaseModel):
    subject_id: str
    question_text: str
    question_rubric: str

@router.post("")
async def create_question(req: QuestionCreateRequest, user=Depends(require_role(['teacher', 'moderator']))):
    conn = connect()
    cur = conn.cursor()
    question_id = str(uuid.uuid4())
    try:
        cur.execute(
            "INSERT INTO question (id, subject_id, question_text, question_rubric) VALUES (%s, %s, %s, %s)",
            (question_id, req.subject_id, req.question_text, req.question_rubric)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return {"id": question_id, "message": "Question created"}