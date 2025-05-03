# Questions Module

## Overview
The Questions module manages the creation, retrieval, updating, and deletion of questions and rubrics.

## Planned Features
- **Create**: Add new questions with LaTeX content.
- **Retrieve**: Fetch questions (optionally filtered by `subject_id`).
- **Update**: Edit existing questions/rubrics.
- **Delete**: Remove questions with cascade.

## Files
- `create.py`: Handle POST `/api/questions`.
- `retrieve.py`: Handle GET `/api/questions`.
- `update.py`: Handle PUT `/api/questions/<id>`.
- `delete.py`: Handle DELETE `/api/questions/<id>`.

## Development Tasks
- Integrate with Supabase.
- Validate LaTeX input.
- Ensure teacher/moderator access.
