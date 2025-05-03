\
from fastapi import APIRouter, HTTPException, Depends
from utils.auth import require_role
from database.db_connection import connect

router = APIRouter()

@router.delete("/{question_id}")
async def delete_question(question_id: str, user=Depends(require_role(['teacher', 'moderator']))):
    conn = connect()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM question WHERE id = %s", (question_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Question not found")
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Question deleted"}
