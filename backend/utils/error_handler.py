\
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom handler for FastAPI HTTPExceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

async def general_exception_handler(request: Request, exc: Exception):
    """Custom handler for unexpected server errors."""
    # Log the exception details here for debugging
    print(f"Unhandled exception: {exc}") # Replace with proper logging
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."},
    )

# Add more specific error handlers if needed

