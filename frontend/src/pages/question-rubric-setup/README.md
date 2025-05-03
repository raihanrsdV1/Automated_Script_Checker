# Question and Rubric Setup Dashboard

## Overview
The Question and Rubric Setup Dashboard allows teachers to manage exam questions and rubrics in LaTeX format.

## Features

### 1. Create Questions and Rubrics
- Form to input `question_text` and `question_rubric` with `subject_id`.
- Save to `question` table.

### 2. Edit Questions and Rubrics
- Fetch and edit existing questions.
- Update `question` table and recompile if needed.

### 3. Delete Questions and Rubrics
- Delete questions with cascade to `submission`.

### 4. Preview LaTeX Content
- Render LaTeX in real-time with MathJax.

## Components
- `QuestionForm.jsx`: Handle question creation/editing.
- `RubricForm.jsx`: Handle rubric creation/editing.

## Technical Notes
- Use Supabase for data.
- Render LaTeX with MathJax.
- Validate LaTeX syntax.

## Development Tasks
- Implement Supabase CRUD operations.
- Add LaTeX rendering.
- Style with Tailwind CSS.
