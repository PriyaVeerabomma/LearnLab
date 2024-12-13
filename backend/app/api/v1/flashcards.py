from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.flashcard import (
    DeckCreate, DeckUpdate, DeckInDB,
    FlashcardCreate, FlashcardUpdate, FlashcardInDB,
    ReviewRequest, ReviewResponse,
    UserStats, DeckProgress, DeckWithFile
)
from app.services.flashcard_service import FlashcardService
from agents.podcast_agent.learn_lab_assistant_agent import PodcastGenerator
from app.services.flashcard_service.deck_service import DeckService
from dotenv import load_dotenv


load_dotenv()

router = APIRouter()

# Initialize PodcastGenerator
podcast_generator = PodcastGenerator()

@router.post("/decks", response_model=DeckWithFile)
async def create_deck(
    deck_data: DeckCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new flashcard deck for a file with AI-generated content"""
    try:
        # Get service instances
        deck_service = DeckService(db)
        
        # Verify file access and get file info
        file = deck_service.verify_file_access(current_user.id, deck_data.file_id)
        
        # Generate flashcards using PodcastGenerator using description as query
        try:
            result = podcast_generator.generate_content(
                question=deck_data.description,  # Using description as the query
                pdf_title=file.filename,  # Using filename as pdf_title
                output_type="flashcards"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating flashcards: {str(e)}"
            )
            
        if not result.get('flashcards'):
            raise HTTPException(
                status_code=500,
                detail="No flashcards were generated"
            )
        
        # Use generated title if none provided
        if not deck_data.title or deck_data.title == "string":
            deck_data.title = result['flashcards']['title']
            
        # Create deck
        deck = deck_service.create_deck(current_user.id, deck_data)
        
        # Create flashcards in the deck
        flashcard_service = FlashcardService(db)
        for card in result['flashcards']['flashcards']:
            flashcard_data = FlashcardCreate(
                deck_id=deck.id,
                front_content=card['front'],  # Changed from front to front_content
                back_content=card['back'],    # Changed from back to back_content
                explanation=card.get('explanation', None)
            )
            try:
                flashcard_service.create_flashcard(deck.id, flashcard_data)
            except Exception as e:
                # If flashcard creation fails, delete the deck and raise error
                deck_service.delete_deck(deck.id)
                raise HTTPException(
                    status_code=500,
                    detail=f"Error creating flashcard: {str(e)}"
                )
            
        # Return deck with file information
        return DeckWithFile.from_orm(deck)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.get("/decks", response_model=List[DeckWithFile])
async def get_user_decks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all decks for the current user"""
    service = FlashcardService(db)
    return service.get_user_decks(current_user.id)

@router.get("/decks/{deck_id}", response_model=DeckWithFile)
async def get_deck(
    deck_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific deck with file information"""
    service = FlashcardService(db)
    deck = service.get_deck(deck_id)
    if not deck or deck.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Deck not found")
    return DeckWithFile.from_orm(deck)

@router.put("/decks/{deck_id}", response_model=DeckWithFile)
async def update_deck(
    deck_id: UUID,
    deck_data: DeckUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a deck"""
    service = FlashcardService(db)
    deck = service.get_deck(deck_id)
    if not deck or deck.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Deck not found")
    updated_deck = service.update_deck(deck_id, deck_data)
    return DeckWithFile.from_orm(updated_deck)

@router.delete("/decks/{deck_id}")
async def delete_deck(
    deck_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a deck"""
    service = FlashcardService(db)
    deck = service.get_deck(deck_id)
    if not deck or deck.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Deck not found")
    service.delete_deck(deck_id)
    return {"message": "Deck deleted successfully"}

@router.post("/decks/{deck_id}/cards", response_model=FlashcardInDB)
async def create_flashcard(
    deck_id: UUID,
    card_data: FlashcardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new flashcard in a deck"""
    service = FlashcardService(db)
    deck = service.get_deck(deck_id)
    if not deck or deck.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Deck not found")
    return service.create_flashcard(deck_id, card_data)

@router.put("/cards/{card_id}", response_model=FlashcardInDB)
async def update_flashcard(
    card_id: UUID,
    card_data: FlashcardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a flashcard"""
    service = FlashcardService(db)
    card = service.get_flashcard(card_id)
    if not card or card.deck.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Card not found")
    return service.update_flashcard(card_id, card_data)

@router.delete("/cards/{card_id}")
async def delete_flashcard(
    card_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a flashcard"""
    service = FlashcardService(db)
    card = service.get_flashcard(card_id)
    if not card or card.deck.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Card not found")
    service.delete_flashcard(card_id)
    return {"message": "Card deleted successfully"}

@router.get("/study", response_model=List[FlashcardInDB])
async def get_due_cards(
    deck_id: UUID = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all cards due for review, optionally filtered by deck"""
    service = FlashcardService(db)
    return service.get_due_cards(current_user.id, deck_id)

@router.get("/decks/{deck_id}/cards/page/{page_number}", response_model=List[FlashcardInDB])
async def get_cards_by_page(
    deck_id: UUID,
    page_number: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all flashcards for a specific page in a deck"""
    service = FlashcardService(db)
    deck = service.get_deck(deck_id)
    if not deck or deck.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Deck not found")
    return service.get_cards_by_page(deck_id, page_number)

@router.post("/cards/{card_id}/review", response_model=ReviewResponse)
async def review_card(
    card_id: UUID,
    review: ReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a card review"""
    service = FlashcardService(db)
    card = service.get_flashcard(card_id)
    if not card or card.deck.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Card not found")
    return service.record_review(current_user.id, card_id, review.quality)

@router.get("/stats", response_model=UserStats)
async def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's flashcard statistics"""
    service = FlashcardService(db)
    return service.get_user_stats(current_user.id)

@router.get("/decks/{deck_id}/progress", response_model=DeckProgress)
async def get_deck_progress(
    deck_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get progress statistics for a specific deck"""
    service = FlashcardService(db)
    deck = service.get_deck(deck_id)
    if not deck or deck.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Deck not found")
    return service.get_deck_progress(current_user.id, deck_id)

@router.get("/files/{file_id}/learning-status")
async def get_file_learning_status(
    file_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get learning status for a specific file"""
    service = FlashcardService(db)
    return service.get_file_learning_status(file_id, current_user.id)