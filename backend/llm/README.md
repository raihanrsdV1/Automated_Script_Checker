# LLM Module

## Overview
The LLM module handles automated evaluation of submissions using a language model (e.g., Vertex AI).

## Planned Features
- **Evaluate**: Process submissions with LLM to generate scores and feedback.
- **Integration**: Call an external LLM service (e.g., Google Generative AI).

## Files
- `evaluate.py`: Handle POST `/api/evaluate/<submission_id>`.
- `client.py`: LLM client configuration.

## Development Tasks
- Set up Google Generative AI client.
- Implement evaluation logic.
- Store results in `evaluated_script`.
