from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import bcrypt, jwt, os, datetime, logging, hashlib
from database.db_connection import connect
from utils.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

class LoginRequest(BaseModel):
    username: str  # This can be either username or email
    password: str

@router.post("/login")
async def login(req: LoginRequest):
    conn = connect()
    cur = conn.cursor()
    
    # Try to find user by username or email
    cur.execute('SELECT id, password_hash, role FROM "user" WHERE username = %s OR email = %s', 
                (req.username, req.username))
    
    row = cur.fetchone()
    if not row:
        logger.warning(f"Login failed: No user found with username/email: {req.username}")
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    user_id, password_hash, role = row
    
    # Try different password verification methods
    password_correct = False
    
    # Method 1: Try bcrypt verification (used by the register.py)
    try:
        if bcrypt.checkpw(req.password.encode('utf-8'), password_hash.encode('utf-8')):
            password_correct = True
    except Exception as e:
        # If bcrypt fails, it might be a different hash format
        logger.info(f"Bcrypt verification failed, trying alternative methods: {str(e)}")
    
    # Method 2: Try SHA-256 verification (used by seed_test_user.py)
    if not password_correct:
        sha256_hash = hashlib.sha256(req.password.encode()).hexdigest()
        if sha256_hash == password_hash:
            password_correct = True
            logger.info("Password verified using SHA-256 hash")
    
    # If all verification methods fail
    if not password_correct:
        logger.warning(f"Login failed: Invalid password for user: {req.username}")
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    # Generate JWT token
    secret = os.getenv('JWT_SECRET_KEY')
    if not secret:
        logger.error("JWT_SECRET_KEY not found in environment variables")
        raise HTTPException(status_code=500, detail="Server configuration error")
        
    alg = os.getenv('JWT_ALGORITHM', 'HS256')
    expire_minutes = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '30'))
    payload = {
        'user_id': str(user_id),
        'role': role,
        'username': req.username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=expire_minutes)
    }
    
    token = jwt.encode(payload, secret, algorithm=alg)
    logger.info(f"Login successful for user: {req.username}")
    
    return {"token": token, "user_id": user_id, "role": role}

@router.get("/me")
async def get_user_info(user = Depends(get_current_user)):
    """
    Get current user information based on JWT token
    """
    conn = connect()
    cur = conn.cursor()
    cur.execute(
        '''SELECT first_name, last_name, username, email, role FROM "user" WHERE id = %s''',
        (user['user_id'],)
    )
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    
    first_name, last_name, username, email, role = row
    
    return {
        "user_id": user['user_id'],
        "first_name": first_name,
        "last_name": last_name,
        "username": username,
        "email": email,
        "role": role
    }