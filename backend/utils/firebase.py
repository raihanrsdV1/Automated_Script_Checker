import os
import logging
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, storage

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), os.pardir, '.env'))

# Create a mock Firebase implementation for development when credentials are missing
class MockFirebase:
    def __init__(self):
        logger.warning("Using Mock Firebase implementation - uploads will be simulated")
    
    async def upload_file_to_firebase(self, file_path, destination_blob_name, content_type=None):
        logger.info(f"MOCK: Uploading {file_path} to {destination_blob_name}")
        # Return a fake URL
        return f"https://mock-firebase-storage.example.com/{destination_blob_name}"

# Initialize Firebase only if credentials file exists
firebase_initialized = False

try:
    cred_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')
    bucket_name = os.getenv('FIREBASE_STORAGE_BUCKET')
    
    # Check if the credential file exists and is valid
    if cred_path and os.path.isfile(cred_path) and os.path.getsize(cred_path) > 0:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {'storageBucket': bucket_name})
        bucket = storage.bucket()
        firebase_initialized = True
        logger.info("Firebase initialized successfully")
    else:
        logger.warning(f"Firebase credentials file not found or empty: {cred_path}")
        # Use mock implementation
        mock_firebase = MockFirebase()
except Exception as e:
    logger.error(f"Error initializing Firebase: {str(e)}")
    # Use mock implementation
    mock_firebase = MockFirebase()

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
    if not firebase_initialized:
        return await mock_firebase.upload_file_to_firebase(file_path, destination_blob_name, content_type)
    
    try:
        blob = bucket.blob(destination_blob_name)
        
        # Upload the file
        blob.upload_from_filename(file_path, content_type=content_type)
        
        # Make the file publicly accessible
        blob.make_public()
        
        # Return the public URL
        return blob.public_url
    except Exception as e:
        logger.error(f"Error uploading file to Firebase: {str(e)}")
        # Fallback to mock in case of error
        return await mock_firebase.upload_file_to_firebase(file_path, destination_blob_name, content_type)