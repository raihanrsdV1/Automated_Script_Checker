# Submissions Module

## Overview
The Submissions module handles answer submissions, rechecks, and related operations, integrating with Firebase and OCR.

## Planned Features
- **Submit**: Upload PDFs to Firebase, extract text with OCR, and link to evaluations.
- **Retrieve**: Fetch submissions with evaluation details.
- **Recheck**: Manage recheck requests and responses.

## Files
- `submit.py`: Handle POST `/api/submissions`.
- `retrieve.py`: Handle GET `/api/submissions/<student_id>`.
- `recheck.py`: Handle POST `/api/rechecks` and PUT `/api/rechecks/<id>`.

## Development Tasks
- Integrate Firebase for PDF uploads.
- Implement OCR with Google Cloud Document AI.
- Add recheck request/response logic.
