# Rechecker Dashboard

## Overview
The Rechecker Dashboard is for teachers and moderators to handle recheck requests submitted by students. It allows viewing pending requests, reviewing submissions, and providing responses.

## Features
### 1. View Pending Recheck Requests
- List recheck requests from `recheck` table (where `response_detail` is NULL).
- Show `submission_id`, student name, question text, and `issue_detail`.
- Link to Firebase PDF and evaluation details.

### 2. Review Submissions and Evaluations
- Display PDF (via Firebase), extracted text, and evaluation results.
- Show question and rubric for context.

### 3. Respond to Recheck Requests
- Form to input `response_detail` and set `responser_id`.
- Update `recheck` table and notify students.

## Components
- `RecheckList.jsx`: Display recheck requests.
- `RecheckResponseForm.jsx`: Handle responses.

## Technical Notes
- Use Supabase for data.
- Access Firebase PDFs.
- Render LaTeX with MathJax.

## Development Tasks
- Fetch recheck data from Supabase.
- Implement response form.
- Add notification logic.
