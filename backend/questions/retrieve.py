from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from database.db_connection import connect

router = APIRouter()

@router.get("", response_model=List[dict])
async def retrieve_questions(subject_id: Optional[str] = Query(None)):
    conn = connect()
    cur = conn.cursor()
    try:
        if subject_id:
            cur.execute(
                "SELECT id, subject_id, question_text, question_rubric FROM question WHERE subject_id = %s",
                (subject_id,)
            )
        else:
            cur.execute(
                "SELECT id, subject_id, question_text, question_rubric FROM question"
            )
        rows = cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    result = []
    for r in rows:
        result.append({
            "id": r[0],
            "subject_id": r[1],
            "question_text": r[2],
            "question_rubric": r[3]
        })
    return result