import os
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Decode JWT token and return user payload"""
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
    def role_checker(user = Depends(get_current_user)):
        if user.get('role') not in allowed_roles:
            raise HTTPException(status_code=403, detail='Insufficient permissions')
        return user
    return role_checker