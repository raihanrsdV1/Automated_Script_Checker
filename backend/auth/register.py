from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from database.db_connection import connect
import bcrypt

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

@router.post("/register")
async def register(req: RegisterRequest):
    conn = connect()
    cur = conn.cursor()
    password_hash = bcrypt.hashpw(req.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    try:
        cur.execute(
            '''INSERT INTO "user" (first_name, last_name, date_of_birth, username, email, phone, password_hash, role)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id''',
            (req.first_name, req.last_name, req.date_of_birth, req.username, req.email, req.phone, password_hash, req.role)
        )
        user_id = cur.fetchone()[0]
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return {"id": user_id, "message": "User registered successfully"}