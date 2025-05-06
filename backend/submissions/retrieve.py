from fastapi import APIRouter, HTTPException, Depends
from typing import List
from utils.auth import require_role
from database.db_connection import connect
import logging

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/all", response_model=List[dict])
async def retrieve_all_submissions(user=Depends(require_role(['teacher', 'moderator']))):
    """Get all submissions across all students (for teachers and moderators only)"""
    conn = connect()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            SELECT 
                *
            FROM 
                submission
            ORDER BY 
                created_at DESC
            """
        )
        
        columns = [desc[0] for desc in cur.description]
        submissions = []
        for row in cur.fetchall():
            submission = {}
            for i, column in enumerate(columns):
                submission[column] = row[i]
            submissions.append(submission)
            
        return submissions
        
    except Exception as e:
        logger.error(f"Failed to retrieve all submissions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve all submissions: {str(e)}")
    finally:
        cur.close()

@router.get("/{student_id}", response_model=List[dict])
async def retrieve_submissions(student_id: str, user=Depends(require_role(['student', 'teacher', 'moderator']))):
    # TODO: Add logic to ensure student can only access their own submissions
    # if user.get('role') == 'student' and user.get('user_id') != student_id:
    #     raise HTTPException(status_code=403, detail="Forbidden")

    conn = connect()
    cur = conn.cursor()
    try:
        # Join submission with evaluated_script to get results
        cur.execute(
            """
            SELECT
                s.id, s.question_id, s.pdf_link, s.solution_text, s.evaluation_id,
                es.result, es.detailed_result
            FROM submission s
            LEFT JOIN evaluated_script es ON s.evaluation_id = es.id
            WHERE s.student_id = %s
            ORDER BY s.id DESC -- Or some timestamp field
            """,
            (student_id,)
        )
        rows = cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()

    result = []
    for r in rows:
        result.append({
            "id": r[0],
            "question_id": r[1],
            "pdf_link": r[2],
            "solution_text": r[3],
            "evaluation_id": r[4],
            "result": r[5],
            "detailed_result": r[6]
        })
    return result
