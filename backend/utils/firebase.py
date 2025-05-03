import os
import firebase_admin
from firebase_admin import credentials, storage
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), os.pardir, '.env'))

# Initialize Firebase app
cred_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred, {'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET')})

# Get storage bucket
bucket = storage.bucket()