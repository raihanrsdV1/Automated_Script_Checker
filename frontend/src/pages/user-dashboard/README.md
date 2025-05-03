# User Dashboard

## Overview
The User Dashboard is the primary interface for students to interact with the exam system. It allows students to browse questions, submit answers, view their submission history, check evaluation results, and request rechecks if they disagree with an evaluation.

## Features
### 1. Browse Questions
- Display a list of available questions from the `question` table in Supabase.
- Filter by subject and class (e.g., Mathematics, Class 10).
- Render question text in LaTeX using MathJax.

### 2. Submit Answer
- Form to upload a PDF file to Firebase Cloud Storage.
- Extract text via backend OCR and save to `submission.solution_text`.
- Link to `student_id` and `question_id`.

### 3. View Submission History
- Fetch submissions from `submission` table.
- Display PDF links, extracted text, and evaluation results (`evaluated_script`).
- Option to request a recheck.

### 4. Request Recheck
- Form to submit a recheck request with `issue_detail`.
- Save to `recheck` table and notify teachers.

## Components
- `QuestionBrowser.jsx`: Fetch and display questions.
- `SubmissionForm.jsx`: Handle PDF uploads.
- `SubmissionHistory.jsx`: Show submission history.

## Technical Notes
- Use Supabase client for data.
- Integrate Firebase for uploads.
- Render LaTeX with MathJax.

## Development Tasks
- Set up Supabase queries.
- Implement PDF upload with Firebase.
- Add recheck request logic.
