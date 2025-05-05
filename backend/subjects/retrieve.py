from fastapi import HTTPException, Depends, status
from database.db_connection import connect
import psycopg2
from typing import List, Dict, Any
# Comment out the auth import for testing
# from utils.auth import get_current_user

async def get_subjects():
    """
    Retrieve all subjects from the database
    """
    conn = None
    try:
        conn = connect()
        with conn.cursor() as cur:
            cur.execute("SELECT id, name, description, created_at FROM subject ORDER BY name")
            
            results = cur.fetchall()
            subjects = []
            
            for r in results:
                subjects.append({
                    "id": r[0],
                    "name": r[1],
                    "description": r[2],
                    "created_at": r[3].isoformat() if r[3] else None
                })
                
            return subjects
    except psycopg2.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        if conn:
            conn.close()

async def get_subject_by_id(subject_id: str):
    """
    Retrieve a specific subject by ID
    """
    conn = None
    try:
        conn = connect()
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, name, description, created_at FROM subject WHERE id = %s",
                (subject_id,)
            )
            
            result = cur.fetchone()
            if not result:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Subject with ID {subject_id} not found"
                )
                
            return {
                "id": result[0],
                "name": result[1],
                "description": result[2],
                "created_at": result[3].isoformat() if result[3] else None
            }
    except psycopg2.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        if conn:
            conn.close()