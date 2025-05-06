"""
Tests module for handling test-related operations.
This module provides endpoints to manage test creation, retrieval, and management.
"""

from fastapi import APIRouter

router = APIRouter()

# Import routes to register them with the router
from .api import retrieve, manage

# Export the router to be used in the main app
__all__ = ["router"]