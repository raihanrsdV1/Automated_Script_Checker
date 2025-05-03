# Backend Overview

## Project Description
This is the Python-based backend for the unified exam system, built with FastAPI to support a React frontend, Supabase database, and Firebase Cloud Storage. It provides modular APIs for authentication, question management, submissions, and LLM evaluations.

## Structure
- `auth/`: Handles user registration and login.
- `questions/`: Manages question creation, retrieval, updates, and deletion.
- `llm/`: Handles LLM calls for evaluations.
- `submissions/`: Processes submissions, rechecks, and Firebase uploads.
- `database/`: Contains database connection and initialization logic.
- `utils/`: Utility functions for error handling and file processing.
- `credentials/`: Stores Firebase service account key.

## Planned Features
- **Authentication**: Register/login with role-based access.
- **Question Management**: CRUD operations for questions/rubrics.
- **Submission Handling**: PDF uploads to Firebase, OCR extraction, and evaluation linking.
- **LLM Evaluation**: Automated scoring and feedback using an LLM.
- **Recheck Management**: Handle recheck requests and responses.
- **Database Initialization**: Script to set up Supabase tables.

## Development Tasks
- Implement API endpoints with FastAPI.
- Integrate Supabase with `.env` credentials.
- Set up Firebase for PDF storage.
- Add OCR and LLM integration.
- Ensure modular design with separate files.

## Running the Demo
See the root README for instructions to run the backend demo.

## Setup Instructions

1.  **Prerequisites**:
    *   Python 3.10+
    *   pip (Python package installer)
    *   PostgreSQL database (e.g., running locally or via Supabase)

2.  **Clone the Repository** (if not already done):
    ```bash
    git clone <repository_url>
    cd <repository_name>/backend
    ```

3.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables**:
    *   Copy the `.env.example` file (if provided) or create a `.env` file in the `backend/` directory.
    *   Fill in the required values:
        *   `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Your PostgreSQL database credentials.
        *   `FIREBASE_SERVICE_ACCOUNT_KEY`: Path to your Firebase service account JSON key file (e.g., `credentials/firebase-service-account-key.json`).
        *   `FIREBASE_STORAGE_BUCKET`: Your Firebase Storage bucket name.
        *   `JWT_SECRET_KEY`: A strong, random secret key for JWT generation. Generate one using `openssl rand -hex 32`.
        *   `JWT_ALGORITHM` (default: `HS256`)
        *   `ACCESS_TOKEN_EXPIRE_MINUTES` (default: `30`)
        *   (Optional) `GOOGLE_API_KEY`, `DOCAI_PROJECT_ID`, etc., if using Google Cloud services.

5.  **Place Firebase Credentials**:
    *   Obtain your Firebase service account key JSON file from the Firebase console.
    *   Place it in the `backend/credentials/` directory (or the path specified in `FIREBASE_SERVICE_ACCOUNT_KEY` in your `.env`).
    *   **Important**: Ensure `credentials/` and `.env` are added to your `.gitignore` file to avoid committing secrets.

6.  **Initialize the Database**:
    *   Make sure your PostgreSQL server is running and accessible with the credentials in `.env`.
    *   Run the initialization script from the `backend/` directory:
        ```bash
        python database/init_db.py
        ```
    *   This will execute the `database/init.sql` schema against your database.

7.  **Run the Server**:
    *   Start the FastAPI server using Uvicorn:
        ```bash
        uvicorn app:app --reload --port 8000
        ```
    *   The `--reload` flag enables auto-reloading on code changes (useful for development).
    *   The API will be available at `http://localhost:8000`.

8.  **API Documentation**:
    *   Once the server is running, access the interactive API documentation (Swagger UI) at `http://localhost:8000/docs`.
    *   Alternatively, access ReDoc documentation at `http://localhost:8000/redoc`.

## Testing

*   Use tools like Postman, Insomnia, or `curl` to test the API endpoints.
*   Refer to the `/docs` endpoint for details on request/response formats.
*   (Optional) Implement unit/integration tests using `pytest`.

