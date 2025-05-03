# Running the Application

This document provides instructions on how to set up and run the backend and frontend components of the Unified Exam System.

## Prerequisites

*   **Python**: Version 3.10 or higher.
*   **pip**: Python package installer.
*   **Node.js**: Version 18 or higher.
*   **npm**: Node package manager (usually comes with Node.js).
*   **PostgreSQL Database**: A running PostgreSQL instance (e.g., local installation or a cloud service like Supabase).
*   **Git**: For cloning the repository.

## Backend Setup

1.  **Navigate to Backend Directory**:
    ```bash
    cd backend
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure Environment Variables**:
    *   Create a `.env` file in the `backend/` directory (you can copy `.env.example` if it exists).
    *   Fill in the required values, especially:
        *   `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Your PostgreSQL database credentials.
        *   `FIREBASE_SERVICE_ACCOUNT_KEY`: Path to your Firebase key file (default: `credentials/firebase-service-account-key.json`).
        *   `FIREBASE_STORAGE_BUCKET`: Your Firebase Storage bucket name.
        *   `JWT_SECRET_KEY`: A strong, random secret key (generate one using `openssl rand -hex 32`).

4.  **Place Firebase Credentials**:
    *   Obtain your Firebase service account key JSON file from the Firebase console.
    *   Place it in the `backend/credentials/` directory and ensure the filename matches the `FIREBASE_SERVICE_ACCOUNT_KEY` value in your `.env` file.
    *   **Important**: Make sure `credentials/` and `.env` are listed in `backend/.gitignore`.

5.  **Initialize the Database**:
    *   Ensure your PostgreSQL server is running and accessible with the credentials provided in `.env`.
    *   Run the initialization script from the `backend/` directory. This will create the necessary tables based on `backend/database/init.sql`.
        ```bash
        python database/init_db.py
        ```
    *   You should see a message like "Database initialized successfully."

6.  **Run the Backend Server**:
    *   Start the FastAPI server using Uvicorn. It's configured to run on port 3000 by default (see `backend/app.py`).
        ```bash
        uvicorn app:app --reload --host 0.0.0.0 --port 3000
        ```
    *   The backend API should now be running at `http://localhost:3000`.
    *   You can access the API documentation (Swagger UI) at `http://localhost:3000/docs`.

## Frontend Setup

1.  **Navigate to Frontend Directory**:
    ```bash
    cd frontend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Address Port Conflict (Important!)**:
    *   The backend is configured to run on port `3000`.
    *   The frontend development server (`vite.config.js`) is also configured for port `3000`.
    *   **You must change one of them to avoid a conflict.**
    *   **Recommendation**: Modify `frontend/vite.config.js`. Change `port: 3000` to a different port, for example, `port: 5173` (Vite's default) or remove the `server` block entirely to use the default.
        ```js
        // Example change in frontend/vite.config.js
        export default defineConfig({
          plugins: [react()],
          server: {
            port: 5173 // Changed from 3000
          }
        })
        ```

4.  **Run the Frontend Development Server**:
    ```bash
    npm run dev
    ```
    *   The frontend application should now be running, typically at `http://localhost:5173` (or the port you configured).

## Testing the Connection

1.  Ensure both the backend and frontend servers are running.
2.  Open your web browser and navigate to the frontend URL (e.g., `http://localhost:5173`).
3.  Go to the `/test` path (e.g., `http://localhost:5173/test`).
4.  You should see a message indicating that the API and database connected successfully, along with the test value fetched from the `test_table`.
