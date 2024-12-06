"""
Version 1 of the LearnLab API
"""

from fastapi import APIRouter
from .auth import router as auth_router
from .files import router as files_router
from .flashcards import router as flashcards_router
from .quiz import router as quiz_router
from .podcast import router as podcast_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(files_router, prefix="/files", tags=["files"])
api_router.include_router(flashcards_router, prefix="/flashcards", tags=["flashcards"])
api_router.include_router(quiz_router, prefix="/quiz", tags=["quizzes"])
api_router.include_router(podcast_router, prefix="/podcasts", tags=["podcasts"])

__all__ = ["api_router"]