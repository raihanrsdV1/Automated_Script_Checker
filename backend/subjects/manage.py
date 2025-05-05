from fastapi import HTTPException, Depends, status
from pydantic import BaseModel
from database.db_connection import connect
import psycopg2
import uuid
from typing import Optional, Dict, Any
# Comment out the auth import for testing
# from utils.auth import get_current_user

class SubjectCreate(BaseModel):
    """Request model for creating a subject"""
    name: str
    description: Optional[str] = None

class SubjectUpdate(BaseModel):
    """Request model for updating a subject"""
    name: Optional[str] = None
    description: Optional[str] = None

# Remove the current_user dependency for testing
async def create_subject(req: SubjectCreate):
    """Create a new subject"""
    # Authentication checks disabled for testing
    # if current_user.get('role') != "admin":
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Not authorized to create subjects"
    #     )
    
    conn = None
    try:
        subject_id = str(uuid.uuid4())
        conn = connect()
        
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO subject (id, name, description) VALUES (%s, %s, %s) RETURNING id, name, description, created_at",
                (subject_id, req.name, req.description)
            )
            conn.commit()
            
            # Fetch the created subject
            result = cur.fetchone()
            
            return {
                "id": result[0],
                "name": result[1],
                "description": result[2],
                "created_at": result[3].isoformat() if result[3] else None
            }
    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        if conn:
            conn.close()

# Remove the current_user dependency for testing
async def update_subject(subject_id: str, req: SubjectUpdate):
    """Update an existing subject"""
    # Authentication checks disabled for testing
    # if current_user.get('role') != "admin":
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Not authorized to update subjects"
    #     )
    
    try:
        conn = connect()
        updates = []
        values = []
        
        if req.name is not None:
            updates.append("name = %s")
            values.append(req.name)
            
        if req.description is not None:
            updates.append("description = %s")
            values.append(req.description)
            
        if not updates:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
            
        with conn.cursor() as cur:
            # Check if subject exists
            cur.execute("SELECT id FROM subject WHERE id = %s", (subject_id,))
            if not cur.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Subject with ID {subject_id} not found"
                )
            
            # Update the subject
            query = f"UPDATE subject SET {', '.join(updates)} WHERE id = %s RETURNING id, name, description, created_at"
            values.append(subject_id)
            
            cur.execute(query, values)
            conn.commit()
            
            # Fetch the updated subject
            result = cur.fetchone()
            
            return {
                "id": result[0],
                "name": result[1],
                "description": result[2],
                "created_at": result[3].isoformat() if result[3] else None
            }
    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        if conn:
            conn.close()

# Remove the current_user dependency for testing
async def delete_subject(subject_id: str):
    """Delete a subject"""
    # Authentication checks disabled for testing
    # if current_user.get('role') != "admin":
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Not authorized to delete subjects"
    #     )
    
    try:
        conn = connect()
        
        with conn.cursor() as cur:
            # Check if subject exists
            cur.execute("SELECT id FROM subject WHERE id = %s", (subject_id,))
            if not cur.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Subject with ID {subject_id} not found"
                )
                
            # Check if subject is referenced by questions or question sets
            cur.execute("SELECT COUNT(*) FROM question WHERE subject_id = %s", (subject_id,))
            question_count = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM question_set WHERE subject_id = %s", (subject_id,))
            question_set_count = cur.fetchone()[0]
            
            if question_count > 0 or question_set_count > 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot delete subject with ID {subject_id} because it is referenced by questions or question sets"
                )
            
            # Delete the subject
            cur.execute("DELETE FROM subject WHERE id = %s", (subject_id,))
            conn.commit()
            
            return {"message": f"Subject with ID {subject_id} successfully deleted"}
    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        if conn:
            conn.close()