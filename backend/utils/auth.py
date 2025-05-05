import os
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Development mode flag - set to False to enforce authentication
DEV_MODE = False

security = HTTPBearer(auto_error=True)  # Always auto-error when token is missing

def development_user():
    """Return a default user for development"""
    return {
        'user_id': '9b069ca0-bbcb-4989-9fa1-06a9a02e9d20',  # Use the specific ID you provided
        'role': 'student'
    }

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Decode JWT token and return user payload"""
    # In development mode, return a dummy user without token validation
    if DEV_MODE:
        logger.info("DEV MODE: Authentication bypassed")
        return development_user()
    
    # Normal JWT validation for production
    token = credentials.credentials
    secret = os.getenv('JWT_SECRET_KEY')
    alg = os.getenv('JWT_ALGORITHM', 'HS256')
    try:
        payload = jwt.decode(token, secret, algorithms=[alg])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail='Invalid or expired token')


def require_role(allowed_roles: list):
    """Dependency to enforce role-based access"""
    def role_checker(request: Request = None, user = Depends(get_current_user)):
        # In development mode, always grant access
        if DEV_MODE:
            logger.info(f"DEV MODE: Role check bypassed for {allowed_roles}")
            return development_user()
        
        # Normal role checking for production
        if user.get('role') not in allowed_roles:
            raise HTTPException(status_code=403, detail='Insufficient permissions')
        return user
    return role_checker