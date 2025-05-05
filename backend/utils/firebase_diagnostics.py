from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from utils.firebase import test_firebase_connection, firebase_initialized, logger

router = APIRouter()

@router.get("/firebase-status")
async def test_firebase():
    """
    Test endpoint to verify Firebase connection status
    Returns detailed diagnostics about the Firebase configuration
    """
    # Get environment variables for diagnostics
    import os
    from dotenv import load_dotenv
    
    # Reload env vars to make sure we have the latest
    load_dotenv()
    
    # Check if Firebase is initialized
    is_initialized = firebase_initialized
    
    # Gather diagnostic info
    diagnostics = {
        "initialized": is_initialized,
        "credentials_path": os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY"),
        "credentials_file_exists": False,
        "bucket_name": os.getenv("FIREBASE_STORAGE_BUCKET"),
        "connection_test": None
    }
    
    # Check if credentials file exists
    cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
    if cred_path:
        diagnostics["credentials_file_exists"] = os.path.isfile(cred_path)
        if diagnostics["credentials_file_exists"]:
            diagnostics["credentials_file_size"] = os.path.getsize(cred_path)
    
    # Test connection if Firebase is initialized
    if is_initialized:
        connection_result = await test_firebase_connection()
        diagnostics["connection_test"] = connection_result
    
    # Log diagnostics for debugging
    logger.info(f"Firebase diagnostics: {diagnostics}")
    
    # Return detailed diagnostic info
    return diagnostics

# Mock upload endpoint for development
@router.post("/mock-upload")
async def mock_upload():
    """
    Development endpoint that simulates a successful file upload
    without actually connecting to Firebase
    """
    from utils.firebase import mock_firebase
    
    mock_url = await mock_firebase.upload_file_to_firebase(
        "mock_file.pdf", 
        "mock/path/file.pdf", 
        "application/pdf"
    )
    
    return {
        "success": True,
        "mock_url": mock_url,
        "message": "Mock upload successful. In production, this would upload to Firebase."
    }