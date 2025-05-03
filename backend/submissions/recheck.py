from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Optional
from utils.auth import require_role
from database.db_connection import connect
import uuid

router = APIRouter()

# --- Request Recheck (Student) ---

class RecheckRequest(BaseModel):
    submission_id: str
    issue_detail: str

@router.post("/", status_code=201)
async def request_recheck(req: RecheckRequest, user=Depends(require_role(['student']))):
    conn = connect()
    cur = conn.cursor()
    recheck_id = str(uuid.uuid4())
    student_id = user.get('user_id') # Get student ID from token

    try:
        # Verify the submission belongs to the student requesting the recheck
        cur.execute("SELECT student_id FROM submission WHERE id = %s", (req.submission_id,))
        submission_owner = cur.fetchone()
        if not submission_owner or str(submission_owner[0]) != student_id:
             raise HTTPException(status_code=403, detail="Cannot request recheck for another student's submission")

        # Insert recheck request using quoted identifier
        cur.execute(
            'INSERT INTO "recheck" (id, submission_id, issue_detail) VALUES (%s, %s, %s)',
            (recheck_id, req.submission_id, req.issue_detail)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()

    return {"id": recheck_id, "message": "Recheck requested successfully"}

# --- Respond to Recheck (Teacher/Moderator) ---

class RecheckResponse(BaseModel):
    response_detail: str
    # Optional: Add fields if evaluation needs update during recheck
    # new_result: Optional[float] = None
    # new_detailed_result: Optional[str] = None

@router.put("/{recheck_id}", status_code=200)
async def respond_to_recheck(recheck_id: str, req: RecheckResponse, user=Depends(require_role(['teacher', 'moderator']))):
    conn = connect()
    cur = conn.cursor()
    responser_id = user.get('user_id') # Get teacher/moderator ID from token

    try:
        # Update recheck response using quoted identifier
        cur.execute(
            'UPDATE "recheck" SET response_detail = %s, responser_id = %s WHERE id = %s',
            (req.response_detail, responser_id, recheck_id)
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Recheck request not found")

        # TODO: Optional - Add logic to update the evaluation score if needed
        # if req.new_result is not None or req.new_detailed_result is not None:
        #    Fetch submission_id from recheck table
        #    Fetch evaluation_id from submission table
        #    Update evaluated_script table

        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()

    return {"message": "Recheck resolved successfully"}


# --- Get Pending Rechecks (Teacher/Moderator) ---

@router.get("/pending", response_model=List[dict])
async def get_pending_rechecks(user=Depends(require_role(['teacher', 'moderator']))):
    conn = connect()
    cur = conn.cursor()
    try:
        # Select rechecks without a response, joining to get student/submission info
        cur.execute(
            """
            SELECT r.id, r.submission_id, r.issue_detail, s.student_id
            FROM "recheck" r
            JOIN submission s ON r.submission_id = s.id
            WHERE r.response_detail IS NULL
            ORDER BY r.id DESC -- Or some timestamp
            """
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
            "submission_id": r[1],
            "issue_detail": r[2],
            "student_id": r[3]
            # TODO: Consider joining with user table to get student name/username
        })
    return result

