from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from uuid import UUID
from fastapi import HTTPException

from app.models.flashcard import Flashcard, LearningProgress, FlashcardDeck
from .base_service import BaseService
from .card_service import CardService

class ReviewService(BaseService):
    def __init__(self, db):
        super().__init__(db)
        self.card_service = CardService(db)

    def calculate_next_review(self, quality: int, learning_progress: LearningProgress) -> Tuple[int, float, datetime]:
        """Implements SuperMemo SM-2 algorithm"""
        if quality < 3:
            learning_progress.repetitions = 0
            learning_progress.interval = 1
        else:
            if learning_progress.repetitions == 0:
                learning_progress.interval = 1
            elif learning_progress.repetitions == 1:
                learning_progress.interval = 6
            else:
                learning_progress.interval = round(learning_progress.interval * learning_progress.ease_factor)

            learning_progress.repetitions += 1
        if learning_progress.ease_factor is None:
            learning_progress.ease_factor = 2.5
        learning_progress.ease_factor += (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        learning_progress.ease_factor = max(1.3, learning_progress.ease_factor)

        next_review = datetime.utcnow() + timedelta(days=learning_progress.interval)
        
        return learning_progress.interval, learning_progress.ease_factor, next_review

    def get_due_cards(self, user_id: UUID, deck_id: Optional[UUID] = None) -> List[Flashcard]:
        query = self.db.query(Flashcard)\
            .join(LearningProgress)\
            .join(FlashcardDeck)\
            .filter(
                LearningProgress.user_id == user_id,
                LearningProgress.next_review <= datetime.utcnow(),
                Flashcard.is_active == True,
                FlashcardDeck.is_active == True
            )
        
        if deck_id:
            query = query.filter(FlashcardDeck.id == deck_id)
            
        return query.all()

    def record_review(self, user_id: UUID, card_id: UUID, quality: int) -> LearningProgress:
        card = self.card_service.get_flashcard(card_id)
        if not card:
            raise HTTPException(status_code=404, detail="Card not found")

        progress = self.db.query(LearningProgress)\
            .filter_by(user_id=user_id, flashcard_id=card_id)\
            .first()
        
        if not progress:
            progress = LearningProgress(user_id=user_id, flashcard_id=card_id)
            self.db.add(progress)

        interval, ease_factor, next_review = self.calculate_next_review(quality, progress)
        
        progress.interval = interval
        progress.ease_factor = ease_factor
        progress.last_reviewed = datetime.utcnow()
        progress.next_review = next_review
        
        self.db.commit()
        self.db.refresh(progress)
        return progress