"""
Module for retrieving tests from the database.
"""

import logging
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any

from database.db_connection import connect
# from utils.auth import verify_token # Uncomment when auth is enabled

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=Dict[str, Any])
async def get_all_tests(
    page: int = Query(1, description="Page number, starting from 1"),
    limit: int = Query(10, description="Number of tests per page"),
    subject_id: Optional[int] = Query(None, description="Filter by subject ID"),
    search: Optional[str] = Query(None, description="Search by test name")
):
    """
    Retrieve all tests with pagination and filtering options.
    """
    logger.info(f"Retrieving tests - page: {page}, limit: {limit}, subject_id: {subject_id}, search: {search}")
    
    conn = None
    try:
        conn = connect()
        cursor = conn.cursor()
        
        # Base query
        query = """
        SELECT t.id, t.name, t.description, t.created_at, t.updated_at, 
               t.created_by, t.subject_id, s.name as subject_name,
               COUNT(q.id) as question_count
        FROM question_sets t
        LEFT JOIN subjects s ON t.subject_id = s.id
        LEFT JOIN question_set_questions qsq ON t.id = qsq.question_set_id
        LEFT JOIN questions q ON qsq.question_id = q.id
        WHERE t.is_test = TRUE
        """
        
        # Add filters
        params = []
        if subject_id:
            query += " AND t.subject_id = %s"
            params.append(subject_id)
        
        if search:
            query += " AND (t.name ILIKE %s OR t.description ILIKE %s)"
            search_param = f"%{search}%"
            params.extend([search_param, search_param])
        
        # Add group by
        query += " GROUP BY t.id, t.name, t.description, t.created_at, t.updated_at, t.created_by, t.subject_id, s.name"
        
        # Get total count first
        count_query = f"SELECT COUNT(*) FROM ({query}) as count_query"
        cursor.execute(count_query, params)
        total_count = cursor.fetchone()[0]
        
        # Add pagination
        query += " ORDER BY t.created_at DESC LIMIT %s OFFSET %s"
        offset = (page - 1) * limit
        params.extend([limit, offset])
        
        # Execute the main query
        cursor.execute(query, params)
        tests = []
        for row in cursor.fetchall():
            tests.append({
                "id": row[0],
                "name": row[1],
                "description": row[2],
                "created_at": row[3].isoformat() if row[3] else None,
                "updated_at": row[4].isoformat() if row[4] else None,
                "created_by": row[5],
                "subject_id": row[6],
                "subject_name": row[7],
                "question_count": row[8]
            })
        
        # Calculate pagination info
        total_pages = (total_count + limit - 1) // limit  # Ceiling division
        
        logger.info(f"Retrieved {len(tests)} tests, total count: {total_count}")
        return {
            "tests": tests,
            "pagination": {
                "page": page,
                "limit": limit,
                "total_count": total_count,
                "total_pages": total_pages
            }
        }
        
    except Exception as e:
        logger.error(f"Error retrieving tests: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve tests: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.get("/{test_id}", response_model=Dict[str, Any])
async def get_test_by_id(test_id: int):
    """
    Retrieve a test by its ID along with its questions.
    """
    logger.info(f"Retrieving test with ID: {test_id}")
    
    conn = None
    try:
        conn = connect()
        cursor = conn.cursor()
        
        # First, get the test details
        cursor.execute("""
        SELECT t.id, t.name, t.description, t.created_at, t.updated_at, 
               t.created_by, t.subject_id, s.name as subject_name
        FROM question_sets t
        LEFT JOIN subjects s ON t.subject_id = s.id
        WHERE t.id = %s AND t.is_test = TRUE
        """, (test_id,))
        
        test_row = cursor.fetchone()
        if not test_row:
            logger.warning(f"Test not found with ID: {test_id}")
            raise HTTPException(status_code=404, detail=f"Test not found with ID: {test_id}")
        
        test = {
            "id": test_row[0],
            "name": test_row[1],
            "description": test_row[2],
            "created_at": test_row[3].isoformat() if test_row[3] else None,
            "updated_at": test_row[4].isoformat() if test_row[4] else None,
            "created_by": test_row[5],
            "subject_id": test_row[6],
            "subject_name": test_row[7],
            "questions": []
        }
        
        # Now, get all questions in this test
        cursor.execute("""
        SELECT q.id, q.question_text, q.answer_type, q.marks, q.difficulty_level, 
               q.topic, q.expected_answer, q.options, q.created_at, q.updated_at,
               qsq.position
        FROM questions q
        JOIN question_set_questions qsq ON q.id = qsq.question_id
        WHERE qsq.question_set_id = %s
        ORDER BY qsq.position
        """, (test_id,))
        
        for row in cursor.fetchall():
            question = {
                "id": row[0],
                "question_text": row[1],
                "answer_type": row[2],
                "marks": row[3],
                "difficulty_level": row[4],
                "topic": row[5],
                "expected_answer": row[6],
                "options": row[7],
                "created_at": row[8].isoformat() if row[8] else None,
                "updated_at": row[9].isoformat() if row[9] else None,
                "position": row[10]
            }
            test["questions"].append(question)
        
        logger.info(f"Retrieved test with ID {test_id} containing {len(test['questions'])} questions")
        return test
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving test: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve test: {str(e)}")
    finally:
        if conn:
            conn.close()