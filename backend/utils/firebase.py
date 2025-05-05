import os
import logging
import shutil
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, storage

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), os.pardir, '.env'))

# Get temp storage settings
TEMP_STORAGE_DIR = os.getenv('TEMP_STORAGE_DIR', 'temp_storage')
TEMP_STORAGE_BASE_URL = os.getenv('TEMP_STORAGE_BASE_URL', 'http://localhost:8000/static')

# Ensure temp storage directory exists
os.makedirs(os.path.join(os.path.dirname(__file__), os.pardir, TEMP_STORAGE_DIR), exist_ok=True)

# Create a mock Firebase implementation for development when credentials are missing
class MockFirebase:
    def __init__(self):
        logger.warning("Using Mock Firebase implementation - uploads will be simulated")
    
    async def upload_file_to_firebase(self, file_path, destination_blob_name, content_type=None):
        logger.info(f"MOCK: Uploading {file_path} to {destination_blob_name}")
        # Return a fake URL
        return f"https://mock-firebase-storage.example.com/{destination_blob_name}"

# Initialize global mock instance so it's available for fallback
mock_firebase = MockFirebase()

# Initialize Firebase only if credentials file exists
firebase_initialized = False
bucket = None

try:
    cred_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')
    bucket_name = os.getenv('FIREBASE_STORAGE_BUCKET')
    
    logger.info(f"Attempting to initialize Firebase with credentials: {cred_path}")
    logger.info(f"Bucket name: {bucket_name}")
    
    # Check if the credential file exists and is valid
    if cred_path and os.path.isfile(cred_path) and os.path.getsize(cred_path) > 0:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {'storageBucket': bucket_name})
        bucket = storage.bucket()
        firebase_initialized = True
        logger.info("Firebase initialized successfully")
    else:
        logger.warning(f"Firebase credentials file not found or empty: {cred_path}")
except Exception as e:
    logger.error(f"Error initializing Firebase: {str(e)}")

async def test_firebase_connection():
    """Test if Firebase connection is working by trying to list files"""
    if not firebase_initialized or bucket is None:
        logger.error("Firebase not initialized, cannot test connection")
        return False
    
    try:
        # Try to list blobs to check connection
        blobs = list(bucket.list_blobs(max_results=1))
        logger.info(f"Firebase connection successful. Found {len(blobs)} files")
        return True
    except Exception as e:
        logger.error(f"Firebase connection test failed: {str(e)}")
        return False

async def upload_to_local_storage(file_path, destination_blob_name, content_type=None):
    """
    Uploads a file to local temporary storage as fallback when Firebase fails.
    
    Args:
        file_path: Local path to the file to upload
        destination_blob_name: Path where the file should be stored
        content_type: Optional content type of the file
        
    Returns:
        The URL of the locally stored file
    """
    try:
        # Create directory structure if it doesn't exist
        local_dir = os.path.join(os.path.dirname(__file__), os.pardir, TEMP_STORAGE_DIR)
        os.makedirs(os.path.dirname(os.path.join(local_dir, destination_blob_name)), exist_ok=True)
        
        # Copy the file to local storage
        local_path = os.path.join(local_dir, destination_blob_name)
        shutil.copy2(file_path, local_path)
        
        # Generate a URL for accessing the file
        url_path = os.path.join(TEMP_STORAGE_BASE_URL, destination_blob_name)
        logger.info(f"File stored locally at: {local_path}")
        logger.info(f"File accessible at: {url_path}")
        
        return url_path
    except Exception as e:
        logger.error(f"Error storing file locally: {str(e)}")
        # Return a mock URL as last resort
        return f"https://mock-firebase-storage.example.com/{destination_blob_name}"

async def upload_file_to_firebase(file_path, destination_blob_name, content_type=None):
    """
    Uploads a file to Firebase Storage.
    
    Args:
        file_path: Local path to the file to upload
        destination_blob_name: Path where the file should be stored in Firebase
        content_type: Optional content type of the file
        
    Returns:
        The public URL of the uploaded file
    """
    # Verify file exists and is readable
    if not os.path.exists(file_path):
        logger.error(f"File not found: {file_path}")
        return await mock_firebase.upload_file_to_firebase(file_path, destination_blob_name, content_type)
    
    # Try Firebase upload if initialized
    if firebase_initialized and bucket is not None:
        try:
            # Create a blob reference
            blob = bucket.blob(destination_blob_name)
            logger.info(f"Uploading {file_path} to {destination_blob_name}")
            
            # Upload the file
            blob.upload_from_filename(file_path, content_type=content_type)
            
            # Make the file publicly accessible
            blob.make_public()
            
            # Return the public URL
            logger.info(f"File uploaded successfully to {blob.public_url}")
            return blob.public_url
        except Exception as e:
            logger.error(f"Error uploading file to Firebase: {str(e)}")
            # Fall back to local storage instead of mock
            logger.info("Falling back to local storage")
            return await upload_to_local_storage(file_path, destination_blob_name, content_type)
    else:
        # Firebase not initialized, use local storage
        logger.warning("Firebase not initialized, using local storage")
        return await upload_to_local_storage(file_path, destination_blob_name, content_type)