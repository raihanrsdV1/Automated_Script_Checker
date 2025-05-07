# Question Set Creator API Documentation

This document provides detailed information about the Question Set Creator API, a Flask-based backend for creating, managing, and viewing question sets for educational purposes. The API supports LaTeX-based question and rubric generation, PDF compilation, user authentication, and submission evaluation. Below, you'll find the API endpoints, their descriptions, request/response formats, and sample examples.

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Question Endpoints](#question-endpoints)
  - [Question Set Endpoints](#question-set-endpoints)
  - [Subject Endpoints](#subject-endpoints)
  - [Submission Endpoints](#submission-endpoints)
  - [LLM Evaluation Endpoints](#llm-evaluation-endpoints)
  - [Class Endpoints](#class-endpoints)
  - [Diagnostic Endpoints](#diagnostic-endpoints)
- [Sample Requests and Responses](#sample-requests-and-responses)
- [Database Schema](#database-schema)
- [Dependencies](#dependencies)
- [Setup Instructions](#setup-instructions)

## Overview
The Question Set Creator API is designed to facilitate the creation and management of educational question sets. It allows users to:
- Authenticate and manage user accounts.
- Create and manage subjects, questions, and question sets.
- Upload student submissions and evaluate them using an LLM service.
- Generate and view LaTeX-compiled PDFs for questions and rubrics.
- Filter and edit question sets interactively.

The API is built with Flask, uses SQLite for data storage, and integrates with pdflatex for PDF generation. Authentication is handled via JWT tokens, and file uploads are supported for submission handling.

## Authentication
Most endpoints require authentication via a Bearer JWT token, included in the `Authorization` header. Obtain a token by logging in through the `/api/auth/login` endpoint. Some endpoints (e.g., `/api/auth/register`, `/api/subjects`) are publicly accessible.

**Security Scheme**:
- **HTTPBearer**: Bearer token in the `Authorization` header (e.g., `Authorization: Bearer <token>`).

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/login
Log in a user and return a JWT token.

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Responses**:
- **200**: Successful login with JWT token.
- **422**: Validation error (e.g., missing fields).

#### GET /api/auth/me
Retrieve information about the authenticated user.

**Responses**:
- **200**: User information.
- **401**: Unauthorized if no valid token.

**Security**: Requires `HTTPBearer`.

#### POST /api/auth/register
Register a new user.

**Request Body**:
```json
{
  "first_name": "string",
  "last_name": "string",
  "date_of_birth": "string",
  "username": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "role": "string",
  "current_class_id": "string",
  "designation": "string",
  "system_role": "string"
}
```

**Responses**:
- **200**: User created successfully.
- **422**: Validation error.

### Question Endpoints

#### POST /api/questions
Create a new question.

**Request Body**:
```json
{
  "subject_id": "string",
  "teacher_id": "string",
  "question_text": "string",
  "rubrics": [
    {
      "rubric_text": "string",
      "marks": 0,
      "serial_number": 0
    }
  ]
}
```

**Responses**:
- **200**: Question created.
- **422**: Validation error.

#### GET /api/questions
Retrieve questions, optionally filtered by subject.

**Query Parameters**:
- `subject_id` (optional): Filter by subject ID.

**Responses**:
- **200**: List of questions.
- **422**: Validation error.

#### GET /api/questions/{question_id}
Retrieve a specific question by ID.

**Path Parameters**:
- `question_id`: Question UUID.

**Responses**:
- **200**: Question details.
- **422**: Validation error.

#### PUT /api/questions/{question_id}
Update a question.

**Path Parameters**:
- `question_id`: Question UUID.

**Request Body**:
```json
{
  "question_text": "string",
  "rubrics": [
    {
      "id": "string",
      "rubric_text": "string",
      "marks": 0,
      "serial_number": 0
    }
  ]
}
```

**Responses**:
- **200**: Question updated.
- **422**: Validation error.

#### DELETE /api/questions/{question_id}
Delete a question.

**Path Parameters**:
- `question_id`: Question UUID.

**Responses**:
- **200**: Question deleted.
- **422**: Validation error.

### Question Set Endpoints

#### POST /api/questions/sets
Create a new question set.

**Request Body**:
```json
{
  "name": "string",
  "description": "string",
  "subject_id": "string",
  "teacher_id": "string"
}
```

**Responses**:
- **200**: Question set created.
- **422**: Validation error.

#### GET /api/questions/sets
Retrieve question sets, optionally filtered by subject.

**Query Parameters**:
- `subject_id` (optional): Filter by subject ID.

**Responses**:
- **200**: List of question sets.
- **422**: Validation error.

#### GET /api/questions/sets/{question_set_id}
Retrieve a specific question set.

**Path Parameters**:
- `question_set_id`: Question set UUID.

**Responses**:
- **200**: Question set details.
- **422**: Validation error.

#### PUT /api/questions/sets/{question_set_id}
Update a question set.

**Path Parameters**:
- `question_set_id`: Question set UUID.

**Request Body**:
```json
{
  "name": "string",
  "description": "string",
  "subject_id": "string",
  "teacher_id": "string"
}
```

**Responses**:
- **200**: Question set updated.
- **422**: Validation error.

#### DELETE /api/questions/sets/{question_set_id}
Delete a question set.

**Path Parameters**:
- `question_set_id`: Question set UUID.

**Responses**:
- **200**: Question set deleted.
- **422**: Validation error.

#### POST /api/questions/sets/{question_set_id}/question
Add a question to a set.

**Path Parameters**:
- `question_set_id`: Question set UUID.

**Request Body**:
```json
{
  "question_id": "string",
  "question_order": 0
}
```

**Responses**:
- **200**: Question added.
- **422**: Validation error.

#### POST /api/questions/sets/{question_set_id}/questions
Add multiple questions to a set.

**Path Parameters**:
- `question_set_id`: Question set UUID.

**Request Body**:
```json
{
  "question_ids": ["string"]
}
```

**Responses**:
- **200**: Questions added.
- **422**: Validation error.

#### DELETE /api/questions/sets/{question_set_id}/questions/{question_id}
Remove a question from a set.

**Path Parameters**:
- `question_set_id`: Question set UUID.
- `question_id`: Question UUID.

**Responses**:
- **200**: Question removed.
- **422**: Validation error.

### Subject Endpoints

#### GET /api/subjects
Retrieve all subjects.

**Responses**:
- **200**: List of subjects.

#### POST /api/subjects
Create a new subject.

**Request Body**:
```json
{
  "name": "string",
  "description": "string"
}
```

**Responses**:
- **200**: Subject created.
- **422**: Validation error.

#### GET /api/subjects/{subject_id}
Retrieve a specific subject.

**Path Parameters**:
- `subject_id`: Subject UUID.

**Responses**:
- **200**: Subject details.
- **422**: Validation error.

#### PUT /api/subjects/{subject_id}
Update a subject.

**Path Parameters**:
- `subject_id`: Subject UUID.

**Request Body**:
```json
{
  "name": "string",
  "description": "string"
}
```

**Responses**:
- **200**: Subject updated.
- **422**: Validation error.

#### DELETE /api/subjects/{subject_id}
Delete a subject.

**Path Parameters**:
- `subject_id`: Subject UUID.

**Responses**:
- **200**: Subject deleted.
- **422**: Validation error.

### Submission Endpoints

#### POST /api/submissions
Submit an answer for a question.

**Request Body** (multipart/form-data):
- `question_id`: Question UUID.
- `question_set_id` (optional): Question set UUID.
- `file`: Answer file (e.g., PDF).

**Responses**:
- **200**: Submission created.
- **422**: Validation error.

**Security**: Requires `HTTPBearer`.

#### POST /api/submissions/batch
Submit multiple answers.

**Request Body** (multipart/form-data):
- `batch_data`: JSON string with question IDs and file keys.
- `question_set_id` (optional): Question set UUID.
- `files`: List of answer files.

**Responses**:
- **200**: Batch submission created.
- **422**: Validation error.

**Security**: Requires `HTTPBearer`.

#### GET /api/submissions/user
Retrieve submissions for the authenticated user.

**Responses**:
- **200**: List of user submissions.
- **401**: Unauthorized.

**Security**: Requires `HTTPBearer`.

#### GET /api/submissions/all
Retrieve all submissions (for teachers/moderators).

**Responses**:
- **200**: List of all submissions.
- **401**: Unauthorized.

**Security**: Requires `HTTPBearer`.

#### GET /api/submissions/{student_id}
Retrieve submissions for a specific student.

**Path Parameters**:
- `student_id`: Student UUID.

**Responses**:
- **200**: List of student submissions.
- **422**: Validation error.

**Security**: Requires `HTTPBearer`.

#### POST /api/submissions/
Request a recheck for a submission.

**Request Body**:
```json
{
  "submission_id": "string",
  "issue_detail": "string"
}
```

**Responses**:
- **201**: Recheck requested.
- **422**: Validation error.

**Security**: Requires `HTTPBearer`.

#### PUT /api/submissions/{recheck_id}
Respond to a recheck request.

**Path Parameters**:
- `recheck_id`: Recheck UUID.

**Request Body**:
```json
{
  "response_detail": "string"
}
```

**Responses**:
- **200**: Recheck response recorded.
- **422**: Validation error.

**Security**: Requires `HTTPBearer`.

#### GET /api/submissions/pending
Retrieve pending recheck requests.

**Responses**:
- **200**: List of pending rechecks.
- **401**: Unauthorized.

**Security**: Requires `HTTPBearer`.

### LLM Evaluation Endpoints

#### POST /api/llm/evaluate/{evaluation_id}
Evaluate a submission using the LLM service.

**Path Parameters**:
- `evaluation_id`: Evaluation UUID.

**Responses**:
- **200**: Evaluation results.
- **422**: Validation error.

#### POST /api/llm/evaluate/batch
Evaluate multiple submissions.

**Request Body**:
```json
{
  "evaluation_ids": ["string"]
}
```

**Responses**:
- **200**: Batch evaluation results.
- **422**: Validation error.

**Security**: Requires `HTTPBearer`.

### Class Endpoints

#### GET /api/classes/
Retrieve all classes.

**Responses**:
- **200**: List of classes.

### Diagnostic Endpoints

#### GET /api/diagnostics/firebase-status
Test Firebase connection status.

**Responses**:
- **200**: Firebase diagnostics.

#### POST /api/diagnostics/mock-upload
Simulate a file upload.

**Responses**:
- **200**: Mock upload response.

## Sample Requests and Responses

### 1. Register a User
**Request**:
```bash
curl -X POST "http://localhost:5000/api/auth/register" \
-H "Content-Type: application/json" \
-d '{
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "2000-01-01",
  "username": "johndoe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "securepassword",
  "role": "teacher",
  "current_class_id": null,
  "designation": "Professor",
  "system_role": null
}'
```

**Response**:
```json
{
  "message": "User registered successfully",
  "user_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

### 2. Create a Question Set
**Request**:
```bash
curl -X POST "http://localhost:5000/api/questions/sets" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <token>" \
-d '{
  "name": "Math Exam",
  "description": "Midterm exam for Algebra",
  "subject_id": "123e4567-e89b-12d3-a456-426614174001",
  "teacher_id": "123e4567-e89b-12d3-a456-426614174000"
}'
```

**Response**:
```json
{
  "message": "Question set created",
  "question_set_id": "a10a36a7-f825-49f2-af07-e4d434c911af"
}
```

### 3. Add a Question to a Set
**Request**:
```bash
curl -X POST "http://localhost:5000/api/questions/sets/a10a36a7-f825-49f2-af07-e4d434c911af/question" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <token>" \
-d '{
  "question_id": "123e4567-e89b-12d3-a456-426614174002",
  "question_order": 1
}'
```

**Response**:
```json
{
  "message": "Question added to set"
}
```

### 4. Submit an Answer
**Request**:
```bash
curl -X POST "http://localhost:5000/api/submissions" \
-H "Authorization: Bearer <token>" \
-F "question_id=123e4567-e89b-12d3-a456-426614174002" \
-F "question_set_id=a10a36a7-f825-49f2-af07-e4d434c911af" \
-F "file=@answer.pdf"
```

**Response**:
```json
{
  "message": "Submission created",
  "submission_id": "123e4567-e89b-12d3-a456-426614174003"
}
```

### 5. Evaluate a Submission
**Request**:
```bash
curl -X POST "http://localhost:5000/api/llm/evaluate/123e4567-e89b-12d3-a456-426614174003" \
-H "Authorization: Bearer <token>"
```

**Response**:
```json
{
  "evaluation_id": "123e4567-e89b-12d3-a456-426614174003",
  "message": "Evaluation completed",
  "result": 8.5,
  "detailed_result": "The answer correctly solves the equation but misses one step in the explanation."
}
```

## Database Schema
The API uses an SQLite database (`question_sets.db`) with the following key tables:

- **user**: Stores user information (id, role, username, email, password_hash).
- **subject**: Stores subjects (id, name, description).
- **class**: Stores classes (id, name).
- **student**, **teacher**, **moderator**: Role-specific user details.
- **question**: Stores questions (id, subject_id, teacher_id, question_text).
- **rubric**: Stores rubrics (id, question_id, rubric_text, marks, serial_number).
- **question_set**: Stores question sets (id, name, subject_id, teacher_id).
- **question_set_mapping**: Maps questions to sets (id, question_set_id, question_id, question_order).
- **evaluation**: Stores submission evaluations (id, student_id, question_id, answer_pdf_url).
- **evaluation_detail**: Stores detailed evaluation results (id, evaluation_id, rubric_id, obtained_marks).
- **recheck**: Stores recheck requests (id, evaluation_id, issue_detail).

Refer to the provided SQL schema for detailed table definitions.

## Dependencies
- **Python Libraries**: flask, sqlite3, os, shutil, subprocess, uuid, datetime.
- **External Tools**: pdflatex (for LaTeX compilation).
- **CDNs**:
  - Bootstrap: `https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css`
  - pdf.js: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.min.js`

## Setup Instructions
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/<your-repo>/question-set-creator.git
   cd question-set-creator
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Install pdflatex**:
   - On Ubuntu: `sudo apt-get install texlive-full`
   - On macOS: `brew install texlive`

4. **Set Up the Database**:
   - Run the SQL script to create tables and insert sample data:
     ```bash
     sqlite3 question_sets.db < schema.sql
     ```

5. **Run the Application**:
   ```bash
   python app.py
   ```

6. **Access the API**:
   - The API will be available at `http://localhost:5000`.
   - Use tools like Postman or curl to test endpoints.

7. **Environment Variables**:
   - Set `FLASK_ENV=development` for development mode.
   - Configure Firebase credentials for file uploads (if applicable).

For detailed setup and deployment instructions, refer to the GitHub repository README.