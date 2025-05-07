# Automated Script Checker

A comprehensive system for automated evaluation of student answer scripts using OCR technology and large language models (LLMs).

## Project Overview

The Automated Script Checker is designed to help educators automatically grade and provide feedback on student submissions. The system:

- Extracts text from submitted PDFs using OCR technology
- Evaluates answers against predefined rubrics using LLM technology
- Provides detailed feedback and scoring for each submission
- Supports multiple languages (including English and Bengali)
- Allows for recheck requests and teacher intervention

## Repository Structure

- **`/backend`**: FastAPI server providing all API endpoints
- **`/frontend`**: React-based user interface for students and teachers
- **`/model`**: LLM evaluation model and testing documentation
- **`/documentation`**: Technical documentation and guides

## Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Configure your .env file (see backend/README.md)
uvicorn app:app --reload --host 0.0.0.0 --port 3000
```

See [Backend README](/backend/README.md) for detailed configuration instructions, including PostgreSQL database setup.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

See [Frontend README](/frontend/README.md) for more details.

### Model Testing
See [Model Test Documentation](/model/model_test.md) for instructions on testing the LLM evaluator.

## Documentation

- [Backend API Documentation](/backend/API_Documentation.md): Complete API reference
- [Technical Documentation](/documentation/Technical_Documentation.pdf): Detailed system architecture
- [Backend Documentation](/documentation/backend.md): Backend implementation details
- [Frontend Documentation](/documentation/frontend.md): Frontend implementation details

## Features

- User role-based access (students, teachers, moderators)
- Question and rubric creation with LaTeX support
- Batch upload of student submissions
- Automatic evaluation of submissions
- Detailed feedback for each rubric item
- Recheck request system
- Test and question set management
- Subject and class organization

## Technologies

- **Backend**: FastAPI, PostgreSQL, JWT authentication
- **Frontend**: React, Vite
- **File Storage**: Firebase Storage
- **AI/ML**: Large Language Models for evaluation, OCR for text extraction
