import os
from dotenv import load_dotenv
import psycopg2

# Load environment variables from .env file in the parent directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), os.pardir, '.env'))

def connect():
    """
    Establishes and returns a new database connection using environment variables.
    The caller is responsible for closing the connection.
    """
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST'),
            port=os.getenv('DB_PORT'),
            database=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD')
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        raise # Re-raise the exception to be handled by the caller