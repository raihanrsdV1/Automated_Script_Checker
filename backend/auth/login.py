from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import bcrypt, jwt, os, datetime
from database.db_connection import connect

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(req: LoginRequest):
    conn = connect()
    cur = conn.cursor()
    cur.execute('SELECT id, password_hash, role FROM "user" WHERE username = %s', (req.username,))
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=400, detail="Invalid username or password")
    user_id, password_hash, role = row
    if not bcrypt.checkpw(req.password.encode('utf-8'), password_hash.encode('utf-8')):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    # Generate JWT token
    secret = os.getenv('JWT_SECRET_KEY')
    alg = os.getenv('JWT_ALGORITHM', 'HS256')
    expire_minutes = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '30'))
    payload = {
        'user_id': str(user_id),
        'role': role,
        'username': req.username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=expire_minutes)
    }
    token = jwt.encode(payload, secret, algorithm=alg)
    return {"token": token, "user_id": user_id, "role": role}