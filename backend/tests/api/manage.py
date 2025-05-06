"""
Module for managing tests (create, update, delete).
"""

import logging
from fastapi import APIRouter, HTTPException, Depends, Path, Body
from typing import Dict, Any, Optional, List
import uuid
from datetime import datetime

from database.db_connection import connect
# from utils.auth import verify_token, get_user_id # Uncomment when auth is enabled

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=Dict[str, Any])
async def create_test(
    test_data: Dict[str, Any] = Body(...)
    # user_id: str = Depends(get_user_id) # Uncomment when auth is enabled
):
    """
    Create a new test.
    Test data should include:
    - name: str
    - description: str
    - subject_id: int
    - questions: List[int] (optional list of question IDs to add initially)
    """
    user_id = "test_user"  # Remove this line when auth is enabled
    logger.info(f"Creating new test by user {user_id}")
    
    # Extract required fields
    name = test_data.get("name")
    description = test_data.get("description")
    subject_id = test_data.get("subject_id")
    questions = test_data.get("questions", [])
    
    # Validate required fields
    if not name or not subject_id:
        raise HTTPException(status_code=400, detail="Name and subject_id are required")
    
    conn = None
    try:
        conn = connect()
        cursor = conn.cursor()
        
        # First verify the subject exists
        cursor.execute("SELECT id FROM subjects WHERE id = %s", (subject_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Subject with ID {subject_id} not found")
        
        # Insert the test (which is a question_set with is_test=TRUE)
        cursor.execute(
            """
            INSERT INTO question_sets (name, description, subject_id, created_by, is_test)
            VALUES (%s, %s, %s, %s, TRUE)
            RETURNING id, created_at, updated_at
            """,
            (name, description, subject_id, user_id)
        )
        
        result = cursor.fetchone()
        test_id = result[0]
        created_at = result[1]
        updated_at = result[2]
        
        # Add questions to the test if provided
        if questions:
            for q_id in questions:
                cursor.execute(
                    """
                    INSERT INTO question_set_questions (question_set_id, question_id)
                    VALUES (%s, %s)
                    """,
                    (test_id, q_id)
                )
        
        conn.commit()
        
        return {
            "id": test_id,
            "name": name,
            "description": description,
            "subject_id": subject_id,
            "created_by": user_id,
            "created_at": created_at,
            "updated_at": updated_at,
            "is_test": True,
            "questions_added": len(questions)
        }
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error creating test: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create test: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.put("/{test_id}", response_model=Dict[str, Any])
async def update_test(
    test_id: int = Path(..., description="The ID of the test to update"),
    test_data: Dict[str, Any] = Body(...),
    # user_id: str = Depends(get_user_id) # Uncomment when auth is enabled
):
    """
    Update an existing test.
    Test data may include:
    - name: str
    - description: str
    - subject_id: int
    """
    user_id = "test_user"  # Remove this line when auth is enabled
    logger.info(f"Updating test {test_id} by user {user_id}")
    
    # Extract fields that can be updated
    updates = {}
    if "name" in test_data:
        updates["name"] = test_data["name"]
    if "description" in test_data:
        updates["description"] = test_data["description"]
    if "subject_id" in test_data:
        updates["subject_id"] = test_data["subject_id"]
    
    if not updates:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    conn = None
    try:
        conn = connect()
        cursor = conn.cursor()
        
        # Check if test exists and is a test (not a question set)
        cursor.execute(
            "SELECT id FROM question_sets WHERE id = %s ",
            (test_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Test with ID {test_id} not found")
        
        # If subject_id is being updated, verify it exists
        if "subject_id" in updates:
            cursor.execute("SELECT id FROM subjects WHERE id = %s", (updates["subject_id"],))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail=f"Subject with ID {updates['subject_id']} not found")
        
        # Build the update query dynamically
        set_clause = ", ".join([f"{key} = %s" for key in updates])
        set_clause += ", updated_at = NOW()"
        values = list(updates.values())
        values.append(test_id)
        
        cursor.execute(
            f"""
            UPDATE question_sets
            SET {set_clause}
            WHERE id = %s
            RETURNING id, name, description, subject_id, created_at, updated_at, created_by
            """,
            values
        )
        
        updated = cursor.fetchone()
        if not updated:
            raise HTTPException(status_code=404, detail=f"Test with ID {test_id} not found")
        
        conn.commit()
        
        return {
            "id": updated[0],
            "name": updated[1],
            "description": updated[2],
            "subject_id": updated[3],
            "created_at": updated[4],
            "updated_at": updated[5],
            "created_by": updated[6],
            "is_test": True
        }
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error updating test: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update test: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{test_id}", response_model=Dict[str, Any])
async def delete_test(
    test_id: int = Path(..., description="The ID of the test to delete"),
    # user_id: str = Depends(get_user_id) # Uncomment when auth is enabled
):
    """
    Delete a test.
    """
    user_id = "test_user"  # Remove this line when auth is enabled
    logger.info(f"Deleting test {test_id} by user {user_id}")
    
    conn = None
    try:
        conn = connect()
        cursor = conn.cursor()
        
        # Check if test exists and is a test (not a question set)
        cursor.execute(
            "SELECT id FROM question_sets WHERE id = %s ",
            (test_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Test with ID {test_id} not found")
        
        # Delete the related entries in question_set_questions first
        cursor.execute(
            "DELETE FROM question_set_questions WHERE question_set_id = %s",
            (test_id,)
        )
        
        # Delete the test
        cursor.execute(
            "DELETE FROM question_sets WHERE id = %s RETURNING id",
            (test_id,)
        )
        
        conn.commit()
        
        return {"message": f"Test {test_id} successfully deleted"}
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error deleting test: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete test: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.post("/{test_id}/questions", response_model=Dict[str, Any])
async def add_questions_to_test(
    test_id: int = Path(..., description="The ID of the test"),
    question_data: Dict[str, Any] = Body(...),
    # user_id: str = Depends(get_user_id) # Uncomment when auth is enabled
):
    """
    Add questions to a test.
    Requires:
    - question_ids: List[int] - List of question IDs to add
    """
    user_id = "test_user"  # Remove this line when auth is enabled
    question_ids = question_data.get("question_ids", [])
    
    if not question_ids:
        raise HTTPException(status_code=400, detail="No question IDs provided")
    
    logger.info(f"Adding {len(question_ids)} questions to test {test_id} by user {user_id}")
    
    conn = None
    try:
        conn = connect()
        cursor = conn.cursor()
        
        # Check if test exists and is a test (not a question set)
        cursor.execute(
            "SELECT id FROM question_sets WHERE id = %s ",
            (test_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Test with ID {test_id} not found")
        
        # Verify all questions exist
        question_ids_str = ','.join([str(q_id) for q_id in question_ids])
        cursor.execute(
            f"SELECT id FROM questions WHERE id IN ({question_ids_str})"
        )
        found_questions = cursor.fetchall()
        if len(found_questions) != len(question_ids):
            raise HTTPException(status_code=400, detail="One or more question IDs do not exist")
        
        # Add questions to the test
        added_count = 0
        for q_id in question_ids:
            # Check if question is already in the test
            cursor.execute(
                """
                SELECT 1 FROM question_set_questions 
                WHERE question_set_id = %s AND question_id = %s
                """,
                (test_id, q_id)
            )
            if cursor.fetchone():
                continue  # Skip if already added
                
            cursor.execute(
                """
                INSERT INTO question_set_questions (question_set_id, question_id)
                VALUES (%s, %s)
                """,
                (test_id, q_id)
            )
            added_count += 1
        
        # Update the updated_at timestamp for the test
        cursor.execute(
            "UPDATE question_sets SET updated_at = NOW() WHERE id = %s",
            (test_id,)
        )
        
        conn.commit()
        
        return {
            "test_id": test_id,
            "questions_added": added_count,
            "message": f"{added_count} questions successfully added to test"
        }
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error adding questions to test: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add questions to test: {str(e)}")
    finally:
        if conn:
            conn.close()

@router.delete("/{test_id}/questions", response_model=Dict[str, Any])
async def remove_questions_from_test(
    test_id: int = Path(..., description="The ID of the test"),
    question_data: Dict[str, Any] = Body(...),
    # user_id: str = Depends(get_user_id) # Uncomment when auth is enabled
):
    """
    Remove questions from a test.
    Requires:
    - question_ids: List[int] - List of question IDs to remove
    """
    user_id = "test_user"  # Remove this line when auth is enabled
    question_ids = question_data.get("question_ids", [])
    
    if not question_ids:
        raise HTTPException(status_code=400, detail="No question IDs provided")
    
    logger.info(f"Removing {len(question_ids)} questions from test {test_id} by user {user_id}")
    
    conn = None
    try:
        conn = connect()
        cursor = conn.cursor()
        
        # Check if test exists and is a test (not a question set)
        cursor.execute(
            "SELECT id FROM question_sets WHERE id = %s ",
            (test_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Test with ID {test_id} not found")
        
        # Remove questions from the test
        question_ids_str = ','.join([str(q_id) for q_id in question_ids])
        cursor.execute(
            f"""
            DELETE FROM question_set_questions 
            WHERE question_set_id = %s AND question_id IN ({question_ids_str})
            """,
            (test_id,)
        )
        removed_count = cursor.rowcount
        
        # Update the updated_at timestamp for the test
        cursor.execute(
            "UPDATE question_sets SET updated_at = NOW() WHERE id = %s",
            (test_id,)
        )
        
        conn.commit()
        
        return {
            "test_id": test_id,
            "questions_removed": removed_count,
            "message": f"{removed_count} questions successfully removed from test"
        }
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error removing questions from test: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to remove questions from test: {str(e)}")
    finally:
        if conn:
            conn.close()