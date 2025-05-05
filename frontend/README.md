# Frontend Overview

## Project Description
This is the React-based frontend for the unified exam system, built with Vite and Tailwind CSS. It provides a modular structure with separate pages for user interaction, question management, and recheck handling, integrated with a Python backend and Supabase database.

## Structure
- `src/pages/`: Contains folders for each page (e.g., `login`, `user-dashboard`, `rechecker-dashboard`, `question-rubric-setup`).
- `src/components/`: Holds global components (e.g., `Navbar`, `Footer`).
- `assets/`: Stores static assets.

## Planned Features
- **Login Page**: User authentication with Supabase or custom logic.
- **Register Page**: User registration with role assignment.
- **User Dashboard**: Browse questions, submit PDFs, view submission history, request rechecks.
- **Rechecker Dashboard**: Manage recheck requests, review submissions, respond to issues.
- **Question and Rubric Setup Dashboard**: Create, edit, and delete questions/rubrics with LaTeX support.

## Development Tasks
- Implement Supabase client for data fetching.
- Integrate Firebase for PDF uploads.
- Add LaTeX rendering (e.g., MathJax).
- Ensure responsive design with Tailwind CSS.

## Running the Demo
See the root README for instructions to run the frontend demo.

# Automated Script Checker - Frontend

## Frontend Handoff Guide

This document provides information about the frontend implementation and how it interacts with the backend API, particularly for PDF submissions.

### Overview of PDF Submission Flow

1. **User selects a question set** - The user browses available question sets in the user dashboard
2. **User uploads a PDF answer** - For each question in the set, the user can upload a PDF file with their solution
3. **Backend processes the PDF** - The file is uploaded to Firebase and text is extracted using Gemini API
4. **User views submission history** - The user can see their past submissions including evaluation results

### Frontend to Backend Integration

#### API Endpoints

Here are the main API endpoints for the submission functionality:

1. `POST /api/submissions` - Submit a PDF answer
   - Content-Type: `multipart/form-data`
   - Required fields:
     - `file`: The PDF file (binary)
     - `question_id`: ID of the question being answered
     - `question_set_id`: ID of the question set (optional)

2. `GET /api/submissions/user` - Get all submissions for the current user

3. `POST /api/submissions/recheck` - Request a recheck for a submission
   - Required fields:
     - `submission_id`: ID of the submission
     - `issue_detail`: Description of the issue

#### Example Code for Submission

```jsx
// This is implemented in /src/api/submissions.js
export const createSubmission = async (questionId, questionSetId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('question_id', questionId);
    formData.append('question_set_id', questionSetId);
    
    const response = await axios.post(`${API_URL}/submissions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating submission:', error);
    throw new Error('Failed to create submission');
  }
};
```

#### Components Overview

1. `QuestionBrowser.jsx` - Displays question sets and allows users to filter by subject
2. `SubmissionForm.jsx` - Handles file selection and uploading for a specific question
3. `SubmissionHistory.jsx` - Displays the user's submission history and allows recheck requests

### Backend Processing

After a PDF is submitted:

1. The file is temporarily stored on the server
2. The file is uploaded to Firebase Storage
3. The Gemini API extracts text from the PDF
4. The text and Firebase PDF URL are stored in the database
5. An asynchronous evaluation process is triggered (if implemented)

### Authentication

All submission endpoints require authentication. The frontend handles this by including the JWT token in the Authorization header.

### Testing the Submission Flow

1. Login as a student user
2. Navigate to the User Dashboard
3. Select a question set
4. Upload a PDF file for any question
5. Check the submission history tab to see if the submission was recorded

### Environment Configuration

Make sure your `.env` file includes the correct API URL:

```
VITE_API_URL=http://localhost:3030/api
```

For any questions or issues during the handoff, please contact the backend team.
