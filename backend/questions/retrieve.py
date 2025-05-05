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
                """
                SELECT q.id, q.subject_id, s.name as subject_name, q.question_text, q.question_rubric, q.marks 
                FROM question q
                JOIN subject s ON q.subject_id = s.id
                WHERE q.subject_id = %s
                """,
                (subject_id,)
            )
        else:
            cur.execute(
                """
                SELECT q.id, q.subject_id, s.name as subject_name, q.question_text, q.question_rubric, q.marks 
                FROM question q
                JOIN subject s ON q.subject_id = s.id
                """
            )
        rows = cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    result = []
    for r in rows:
        result.append({
            "id": r[0],
            "subject_id": r[1],
            "subject_name": r[2],
            "question_text": r[3],
            "question_rubric": r[4],
            "marks": r[5]
        })
    return result