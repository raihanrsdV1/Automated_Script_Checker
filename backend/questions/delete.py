from fastapi import APIRouter, HTTPException
from database.db_connection import connect

router = APIRouter()

@router.delete("/{question_id}")
async def delete_question(question_id: str):
    conn = connect()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM question WHERE id = %s", (question_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Question not found")
        
        cur.execute("DELETE FROM question WHERE id = %s", (question_id,))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()
    
    return {"message": "Question deleted successfully"}
