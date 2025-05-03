from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from utils.auth import require_role
from database.db_connection import connect

router = APIRouter()

class QuestionUpdateRequest(BaseModel):
    question_text: str
    question_rubric: str

@router.put("/{question_id}")
async def update_question(question_id: str, req: QuestionUpdateRequest, user=Depends(require_role(['teacher', 'moderator']))):
    conn = connect()
    cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE question SET question_text = %s, question_rubric = %s WHERE id = %s",
            (req.question_text, req.question_rubric, question_id)
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Question not found")
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Question updated"}