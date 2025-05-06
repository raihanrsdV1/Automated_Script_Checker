from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from database.db_connection import connect
import bcrypt
from uuid import UUID

router = APIRouter()

class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: str  # YYYY-MM-DD
    username: str
    email: EmailStr
    phone: str = None
    password: str
    role: str  # student, teacher, moderator
    # Role-specific fields
    current_class_id: UUID = None  # Required for students
    designation: str = None  # Required for teachers
    system_role: str = None  # Required for moderators

@router.post("/register")
async def register(req: RegisterRequest):
    conn = connect()
    cur = conn.cursor()
    password_hash = bcrypt.hashpw(req.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Validate role-specific required fields
    if req.role == 'student' and not req.current_class_id:
        raise HTTPException(status_code=400, detail="current_class_id is required for student role")
    elif req.role == 'teacher' and not req.designation:
        raise HTTPException(status_code=400, detail="designation is required for teacher role")
    elif req.role == 'moderator' and not req.system_role:
        raise HTTPException(status_code=400, detail="system_role is required for moderator role")
    
    try:
        # Start transaction
        conn.autocommit = False
        
        # Insert into user table
        cur.execute(
            '''INSERT INTO "user" (first_name, last_name, date_of_birth, username, email, phone, password_hash, role)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id''',
            (req.first_name, req.last_name, req.date_of_birth, req.username, req.email, req.phone, password_hash, req.role)
        )
        user_id = cur.fetchone()[0]
        
        # Create role-specific entry based on role
        if req.role == 'student':
            cur.execute(
                '''INSERT INTO student (user_id, current_class_id) VALUES (%s, %s)''',
                (user_id, req.current_class_id)
            )
        elif req.role == 'teacher':
            cur.execute(
                '''INSERT INTO teacher (user_id, designation) VALUES (%s, %s)''',
                (user_id, req.designation)
            )
        elif req.role == 'moderator':
            cur.execute(
                '''INSERT INTO moderator (user_id, system_role) VALUES (%s, %s)''',
                (user_id, req.system_role)
            )
        
        # Commit the transaction
        conn.commit()
        conn.autocommit = True
        
    except Exception as e:
        conn.rollback()
        conn.autocommit = True
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
    
    return {"id": user_id, "message": "User registered successfully"}