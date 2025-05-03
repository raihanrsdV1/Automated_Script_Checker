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
