# Subjects module
from fastapi import APIRouter
from .retrieve import get_subjects, get_subject_by_id
from .manage import create_subject, update_subject, delete_subject

subjects_router = APIRouter()

# GET endpoints
subjects_router.add_api_route("/subjects", get_subjects, methods=["GET"])
subjects_router.add_api_route("/subjects/{subject_id}", get_subject_by_id, methods=["GET"])

# POST endpoint for creating a new subject
subjects_router.add_api_route("/subjects", create_subject, methods=["POST"])

# PUT endpoint for updating a subject
subjects_router.add_api_route("/subjects/{subject_id}", update_subject, methods=["PUT"])

# DELETE endpoint for deleting a subject
subjects_router.add_api_route("/subjects/{subject_id}", delete_subject, methods=["DELETE"])