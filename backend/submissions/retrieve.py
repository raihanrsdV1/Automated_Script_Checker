from fastapi import APIRouter, HTTPException, Depends
from typing import List
from utils.auth import require_role
from database.db_connection import connect
import logging

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Important: Specific routes must come before parameterized routes
@router.get("/user")
async def get_user_submissions(user=Depends(require_role(['student']))):
    """Get all submissions for the current authenticated user, organized by question sets"""
    student_id = user.get('user_id')
    
    conn = connect()
    cur = conn.cursor()
    
    try:
        # First, get all question sets this student has attempted
        cur.execute(
            """
            SELECT DISTINCT
                qs.id, qs.name, qs.description,
                MIN(e.created_at) as first_attempt_date
            FROM 
                evaluation e
            JOIN 
                question_set qs ON e.question_set_id = qs.id
            WHERE 
                e.student_id = %s
            GROUP BY
                qs.id, qs.name, qs.description
            ORDER BY 
                first_attempt_date DESC
            """,
            (student_id,)
        )
        
        question_sets = {}
        for row in cur.fetchall():
            question_sets[row[0]] = {
                "id": row[0],
                "name": row[1],
                "description": row[2],
                "first_attempt_date": row[3],
                "questions": []  # Will hold the list of questions attempted in this set
            }
        
        # If we have no question sets, try to get individual evaluations (without question set)
        if not question_sets:
            cur.execute(
                """
                SELECT DISTINCT
                    e.question_id
                FROM 
                    evaluation e
                WHERE 
                    e.student_id = %s AND e.question_set_id IS NULL
                """,
                (student_id,)
            )
            
            if cur.fetchone():
                # Create a virtual "Individual Questions" set
                question_sets["individual"] = {
                    "id": "individual",
                    "name": "Individual Questions",
                    "description": "Questions answered outside of a formal test",
                    "first_attempt_date": None,
                    "questions": []
                }
        
        # Now get all evaluations (questions) for each question set
        for question_set_id in question_sets:
            if question_set_id == "individual":
                where_clause = "e.student_id = %s AND e.question_set_id IS NULL"
                params = (student_id,)
            else:
                where_clause = "e.student_id = %s AND e.question_set_id = %s"
                params = (student_id, question_set_id)
                
            cur.execute(
                f"""
                SELECT
                    e.id, e.question_id, e.answer_pdf_url, 
                    e.answer_text, e.evaluation_status, e.created_at,
                    q.question_text
                FROM 
                    evaluation e
                JOIN 
                    question q ON e.question_id = q.id
                WHERE 
                    {where_clause}
                ORDER BY 
                    e.created_at DESC
                """,
                params
            )
            
            questions_map = {}  # To avoid duplicates, using question_id as key
            for row in cur.fetchall():
                evaluation_id = row[0]
                question_id = row[1]
                
                # If this is a new question (not already in our map)
                if question_id not in questions_map:
                    questions_map[question_id] = {
                        "id": evaluation_id,
                        "question_id": question_id,
                        "solution_pdf_url": row[2],
                        "extracted_text": row[3],
                        "status": row[4],
                        "submitted_at": row[5],
                        "question_text": row[6],
                        "evaluation_details": [],  # Will hold the rubric evaluations
                        "result": 0,
                        "total_marks": 0,
                        "evaluated": row[4] == 'completed',
                        "recheck_requested": False
                    }
                    
                    # Get evaluation details (rubric evaluations) for this evaluation
                    cur.execute(
                        """
                        SELECT 
                            ed.id, ed.obtained_marks, ed.detailed_result, ed.serial_number,
                            r.rubric_text, r.marks
                        FROM 
                            evaluation_detail ed
                        JOIN 
                            rubric r ON ed.rubric_id = r.id
                        WHERE 
                            ed.evaluation_id = %s
                        ORDER BY 
                            ed.serial_number
                        """,
                        (evaluation_id,)
                    )
                    
                    evaluation_details = []
                    total_obtained = 0
                    total_possible = 0
                    
                    for detail in cur.fetchall():
                        obtained_marks = detail[1]
                        total_marks = detail[5]
                        
                        evaluation_details.append({
                            "id": detail[0],
                            "obtained_marks": obtained_marks,
                            "explanation": detail[2],
                            "serial_number": detail[3],
                            "rubric_text": detail[4],
                            "total_marks": total_marks
                        })
                        
                        total_obtained += obtained_marks
                        total_possible += total_marks
                    
                    # Update the question with its evaluation details and totals
                    questions_map[question_id]["evaluation_details"] = evaluation_details
                    questions_map[question_id]["result"] = total_obtained
                    questions_map[question_id]["total_marks"] = total_possible
                    
                    # Check if recheck was requested
                    cur.execute(
                        "SELECT 1 FROM recheck WHERE evaluation_id = %s LIMIT 1",
                        (evaluation_id,)
                    )
                    if cur.fetchone():
                        questions_map[question_id]["recheck_requested"] = True
            
            # Add all questions to this question set
            question_sets[question_set_id]["questions"] = list(questions_map.values())
        
        # Convert the dict to a list for return
        result = list(question_sets.values())
        
        # If we have no results, return an empty array to avoid null
        if not result:
            return []
            
        return result
        
    except Exception as e:
        logger.error(f"Failed to retrieve submissions for student {student_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve submissions: {str(e)}")
    finally:
        cur.close()

@router.get("/all", response_model=List[dict])
async def retrieve_all_submissions(user=Depends(require_role(['teacher', 'moderator']))):
    """Get all submissions across all students (for teachers and moderators only)"""
    conn = connect()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            SELECT 
                e.id, e.student_id, e.question_id, e.question_set_id, 
                e.answer_pdf_url, e.answer_text, e.evaluation_status, e.created_at,
                q.question_text, 
                u.first_name, u.last_name,
                qs.name as question_set_name,
                COALESCE(SUM(ed.obtained_marks), 0) as total_obtained_marks,
                COALESCE(SUM(r.marks), 0) as total_possible_marks,
                EXISTS (SELECT 1 FROM recheck rec WHERE rec.evaluation_id = e.id) as recheck_requested
            FROM 
                evaluation e
            JOIN 
                question q ON e.question_id = q.id
            JOIN 
                "user" u ON e.student_id = u.id
            LEFT JOIN 
                question_set qs ON e.question_set_id = qs.id
            LEFT JOIN
                evaluation_detail ed ON e.id = ed.evaluation_id
            LEFT JOIN
                rubric r ON q.id = r.question_id
            GROUP BY
                e.id, e.student_id, e.question_id, e.question_set_id, 
                e.answer_pdf_url, e.answer_text, e.evaluation_status, e.created_at,
                q.question_text, u.first_name, u.last_name, qs.name
            ORDER BY 
                e.created_at DESC
            """
        )
        
        submissions = []
        for row in cur.fetchall():
            submissions.append({
                "id": row[0],
                "student_id": row[1],
                "question_id": row[2],
                "question_set_id": row[3],
                "solution_pdf_url": row[4],
                "extracted_text": row[5],
                "status": row[6],
                "submitted_at": row[7],
                "question_text": row[8],
                "student_name": f"{row[9]} {row[10]}",
                "question_set_name": row[11],
                "result": row[12],
                "total_marks": row[13],
                "recheck_requested": row[14],
                "evaluated": row[6] == 'completed'
            })
            
        return submissions
        
    except Exception as e:
        logger.error(f"Failed to retrieve all submissions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve all submissions: {str(e)}")
    finally:
        cur.close()

@router.get("/{student_id}", response_model=List[dict])
async def retrieve_submissions(student_id: str, user=Depends(require_role(['student', 'teacher', 'moderator']))):
    # Ensure student can only access their own submissions
    if user.get('role') == 'student' and user.get('user_id') != student_id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only access your own submissions")

    conn = connect()
    cur = conn.cursor()
    try:
        # Join evaluation with evaluation_detail to get results
        cur.execute(
            """
            SELECT
                e.id, e.question_id, e.question_set_id, e.answer_pdf_url, 
                e.answer_text, e.evaluation_status, e.created_at,
                q.question_text,
                qs.name as question_set_name,
                COALESCE(SUM(ed.obtained_marks), 0) as total_obtained_marks,
                COALESCE(SUM(r.marks), 0) as total_possible_marks,
                STRING_AGG(ed.detailed_result, E'\n\n') as feedback,
                EXISTS (SELECT 1 FROM recheck rec WHERE rec.evaluation_id = e.id) as recheck_requested
            FROM 
                evaluation e
            JOIN 
                question q ON e.question_id = q.id
            LEFT JOIN 
                question_set qs ON e.question_set_id = qs.id
            LEFT JOIN
                evaluation_detail ed ON e.id = ed.evaluation_id
            LEFT JOIN
                rubric r ON q.id = r.question_id
            WHERE 
                e.student_id = %s
            GROUP BY
                e.id, e.question_id, e.question_set_id, e.answer_pdf_url, 
                e.answer_text, e.evaluation_status, e.created_at,
                q.question_text, qs.name
            ORDER BY 
                e.created_at DESC
            """,
            (student_id,)
        )
        rows = cur.fetchall()
        
        # Also get all evaluation details for better display
        submissions = []
        for row in rows:  # Fixed: was using cur.fetchall() again, which would be empty
            submission = {
                "id": row[0],
                "question_id": row[1],
                "question_set_id": row[2],
                "solution_pdf_url": row[3],
                "extracted_text": row[4], 
                "status": row[5],
                "submitted_at": row[6],
                "question_text": row[7],
                "question_set_name": row[8],
                "result": row[9],
                "total_marks": row[10],
                "feedback": row[11],
                "recheck_requested": row[12],
                "evaluated": row[5] == 'completed'
            }
            submissions.append(submission)
        
        # Get evaluation details as a separate query for detailed view
        if len(submissions) > 0:
            for submission in submissions:
                cur.execute(
                    """
                    SELECT 
                        ed.id, ed.obtained_marks, ed.detailed_result, ed.serial_number,
                        r.rubric_text, r.marks
                    FROM 
                        evaluation_detail ed
                    JOIN 
                        rubric r ON ed.rubric_id = r.id
                    WHERE 
                        ed.evaluation_id = %s
                    ORDER BY 
                        ed.serial_number
                    """,
                    (submission["id"],)
                )
                details = []
                for detail in cur.fetchall():
                    details.append({
                        "id": detail[0],
                        "obtained_marks": detail[1],
                        "explanation": detail[2],
                        "serial_number": detail[3],
                        "rubric_text": detail[4],
                        "total_marks": detail[5]
                    })
                submission["details"] = details
            
        return submissions
        
    except Exception as e:
        logger.error(f"Failed to retrieve submissions for student {student_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve submissions: {str(e)}")
    finally:
        cur.close()
