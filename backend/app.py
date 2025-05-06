import os
import logging # Add logging import
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# Import routers and utilities
from auth import login, register
from questions import create as create_q, retrieve as retrieve_q, update as update_q, delete as delete_q, question_set as question_set_q  # Import the new question set router
from submissions import submit as submit_s, retrieve as retrieve_s, recheck as recheck_s
from subjects import subjects_router  # Import the new subjects router
from tests import router as tests_router  # Import the new tests router
from classes import retrieve as retrieve_c  # Import the new classes router
from llm import evaluate as evaluate_llm  # Import the LLM evaluation router
from llm import batch_evaluate as batch_evaluate_llm  # Import the LLM batch evaluation router
from database.db_connection import connect # Fix import to use connect instead of get_db_connection
# from utils.auth import verify_token # Commented out as auth is disabled for now
from utils.error_handler import http_exception_handler
from utils.logging_middleware import LoggingMiddleware # Import the new middleware
from utils import firebase_diagnostics # Import Firebase diagnostics module

# Load environment variables
load_dotenv()

# Configure basic logging (can be more sophisticated)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware first
origins = [
    "http://localhost",
    "http://localhost:5173", # Default Vite port
    "http://localhost:3031", # Add the actual frontend origin from the error message
    "http://localhost:3030", # Allow backend itself (if needed)
    # Add your deployed frontend URL here if applicable
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Logging middleware *after* CORS but before routes
app.add_middleware(LoggingMiddleware)

# Add custom exception handler
app.add_exception_handler(HTTPException, http_exception_handler)

# Mount static files directory for serving locally stored files
temp_storage_dir = os.getenv('TEMP_STORAGE_DIR', 'temp_storage')
temp_storage_path = os.path.join(os.path.dirname(__file__), temp_storage_dir)
os.makedirs(temp_storage_path, exist_ok=True)
app.mount("/static", StaticFiles(directory=temp_storage_path), name="static")

# --- API Routes --- #

# Authentication Routes
app.include_router(login.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(register.router, prefix="/api/auth", tags=["Authentication"])

# Question Management Routes (Protected - Auth Disabled)
app.include_router(question_set_q.router, prefix="/api/questions", tags=["Questions"]) #, dependencies=[Depends(verify_token)])
app.include_router(create_q.router, prefix="/api/questions", tags=["Questions"]) #, dependencies=[Depends(verify_token)])
app.include_router(retrieve_q.router, prefix="/api/questions", tags=["Questions"]) #, dependencies=[Depends(verify_token)])
app.include_router(update_q.router, prefix="/api/questions", tags=["Questions"]) #, dependencies=[Depends(verify_token)])
app.include_router(delete_q.router, prefix="/api/questions", tags=["Questions"]) #, dependencies=[Depends(verify_token)])


# Subject Management Routes
app.include_router(subjects_router, prefix="/api", tags=["Subjects"]) #, dependencies=[Depends(verify_token)])

# Test Management Routes
app.include_router(tests_router, prefix="/api/tests", tags=["Tests"]) #, dependencies=[Depends(verify_token)])

# Class Management Routes
app.include_router(retrieve_c.router, prefix="/api/classes", tags=["Classes"]) #, dependencies=[Depends(verify_token)])

# LLM Evaluation Routes 
app.include_router(evaluate_llm.router, prefix="/api/llm/evaluate", tags=["LLM"]) #, dependencies=[Depends(verify_token)])
app.include_router(batch_evaluate_llm.router, prefix="/api/llm/evaluate", tags=["LLM"]) #, dependencies=[Depends(verify_token)])

# Submission Management Routes (Protected - Auth Disabled)
app.include_router(submit_s.router, prefix="/api/submissions", tags=["Submissions"]) #, dependencies=[Depends(verify_token)])
app.include_router(retrieve_s.router, prefix="/api/submissions", tags=["Submissions"]) #, dependencies=[Depends(verify_token)])
app.include_router(recheck_s.router, prefix="/api/submissions", tags=["Submissions"]) #, dependencies=[Depends(verify_token)])

# Firebase Diagnostics Routes
app.include_router(firebase_diagnostics.router, prefix="/api/diagnostics", tags=["Diagnostics"])

# --- Simple Test Route --- #
@app.get("/api/test")
async def get_test_values():
    logger.info("Executing GET /api/test endpoint") # Example specific log
    conn = None
    try:
        conn = connect()
        cursor = conn.cursor()
        cursor.execute("SELECT id, value FROM test_table ORDER BY id")
        values = cursor.fetchall()
        cursor.close()
        logger.info(f"Retrieved {len(values)} test values from DB.")
        return {"test_values": [{"id": row[0], "value": row[1]} for row in values]}
    except Exception as e:
        logger.error(f"Error fetching test values: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        if conn:
            conn.close()

@app.post("/api/test/add")
async def add_test_value(request: Request):
    logger.info("Executing POST /api/test/add endpoint") # Example specific log
    conn = None
    try:
        data = await request.json()
        value = data.get('value')
        if not value:
            logger.warning("Attempted to add empty value.")
            raise HTTPException(status_code=400, detail="Value cannot be empty")

        conn = connect()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO test_table (value) VALUES (%s) RETURNING id, value", (value,))
        new_record = cursor.fetchone()
        conn.commit()
        cursor.close()
        logger.info(f"Added new test value: ID={new_record[0]}, Value='{new_record[1]}'")
        return {"id": new_record[0], "value": new_record[1]}
    except Exception as e:
        if conn:
            conn.rollback() # Rollback on error
        logger.error(f"Error adding test value: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Database error or invalid request: {e}")
    finally:
        if conn:
            conn.close()

# --- Root Endpoint --- #
@app.get("/")
async def read_root():
    logger.info("Root endpoint accessed.")
    return {"message": "Welcome to the AI Hackathon System API"}

# --- Run Server (for local development) --- #
if __name__ == "__main__":
    import uvicorn
    import argparse # Import argparse
    import os
    import logging

    logger = logging.getLogger(__name__)

    # Set up argument parser
    parser = argparse.ArgumentParser(description="Run the FastAPI application.")
    # Default port from environment variable PORT, then 3000
    default_port = int(os.getenv("PORT", 3000))
    # Default host from environment variable HOST, then 0.0.0.0
    default_host = os.getenv("HOST", "0.0.0.0")

    parser.add_argument("--port", type=int, default=default_port, help=f"Port to run the server on (default: {default_port})")
    parser.add_argument("--host", type=str, default=default_host, help=f"Host to run the server on (default: {default_host})")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload for development.")

    args = parser.parse_args()

    logger.info(f"Starting Uvicorn server on {args.host}:{args.port}...")
    # Use "app:app" string to enable reload correctly when running the script directly
    uvicorn.run("app:app", host=args.host, port=args.port, reload=args.reload)
