from fastapi import APIRouter, HTTPException
from database.db_connection import connect

router = APIRouter()

@router.get("/")
async def get_classes():
    """
    Retrieve all available classes for student registration
    """
    conn = connect()
    cur = conn.cursor()
    try:
        cur.execute('SELECT id, name FROM class ORDER BY name')
        classes = [{"id": str(row[0]), "name": row[1]} for row in cur.fetchall()]
        
        # If no classes found, add a default class to ensure registration can proceed
        if not classes:
            cur.execute('INSERT INTO class (name) VALUES (%s) RETURNING id, name', ('Default Class',))
            default_class = cur.fetchone()
            conn.commit()
            classes = [{"id": str(default_class[0]), "name": default_class[1]}]
        
        return classes
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()