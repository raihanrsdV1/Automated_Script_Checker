from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.db_connection import connect

router = APIRouter()

class QuestionUpdateRequest(BaseModel):
    question_text: str
    question_rubric: str
    marks: float

@router.put("/{question_id}")
async def update_question(question_id: str, req: QuestionUpdateRequest):
    conn = connect()
    cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE question SET question_text = %s, question_rubric = %s, marks = %s WHERE id = %s",
            (req.question_text, req.question_rubric, req.marks, question_id)
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Question not found")
            
        # Fetch the updated question with subject name for frontend display
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
        conn.commit()
        
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
        
    return {"message": "Question updated"}