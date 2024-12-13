import os
import tempfile

import aiofiles
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from ....models import Podcast
from ....schemas.flashcard import DeckCreate, FlashcardCreate
from ....schemas.quiz import (
    QuizCreate, QuizUpdate, QuizInDB, 
    QuizWithDetails, QuizList
)
from urllib.parse import urlparse

from ....schemas.quiz import (
    QuestionCreate, QuestionUpdate, QuestionInDB,
    QuestionWithOptions, QuestionWithAnswer, MultipleChoiceOptionCreate
)
from app.core.deps import (
    get_db,
    get_current_user,
    get_audio_service,
    get_transcript_service
)
from app.core.logger import setup_logger, log_error
from app.models.user import User
from app.schemas.generate.models import GenerateRequest, GenerateResponse
from app.services.podcast_service import AudioService, TranscriptService
from app.services.quiz_service import QuizService, QuestionService
from app.services.flashcard_service import FlashcardService, DeckService, CardService
from agents.podcast_agent.learn_lab_assistant_agent import PodcastGenerator
from app.schemas.quiz.quiz import QuizCreate
# notification_manager
from app.services.notification_service import notification_manager
podcast_generator = PodcastGenerator()


logger = setup_logger(__name__)
router = APIRouter()


async def generate_podcast(
        file_id: UUID,
        query: str,
        db: Session,
        user_id: UUID,
        audio_service: AudioService,
        transcript_service: TranscriptService
):
    """Create a podcast from generated content"""
    temp_file_path = None

    try:
        # 1. Call podcast generator (this is handled before this function)
        logger.info(f"Starting podcast generation for file {file_id}, query: {query}")
        result = podcast_generator.generate_content(
            question=query,
            pdf_title="Help.pdf",  # TODO: Get actual filename
            output_type="podcast"
        )

        # 2. Extract S3 key from URL
        try:
            url_parts = urlparse(result["s3_url"])
            s3_audio_key = url_parts.path.lstrip('/')  # Remove leading slash
            logger.info(f"Extracted S3 key: {s3_audio_key}")
        except (KeyError, AttributeError) as e:
            logger.error(f"Failed to extract S3 key from generator result: {str(e)}")
            logger.error(f"Generator result: {result}")
            raise ValueError("Invalid generator output format") from e

        # 3. Create temporary file for transcript
        # try:
        #     with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as temp_file:
        #         temp_file.write(result["script"])
        #         temp_file_path = temp_file.name
        #         logger.info(f"Created temporary transcript file: {temp_file_path}")
        # except (IOError, KeyError) as e:
        #     logger.error(f"Failed to create temporary transcript file: {str(e)}")
        #     raise RuntimeError("Failed to create transcript file") from e

        try:
            # # 4. Process transcript
            # async with aiofiles.open(temp_file_path, mode='rb') as transcript_file:
            #     transcript_keys = await transcript_service.process_transcript(
            #         transcript_file,
            #         user_id
            #     )
            # logger.info(f"Processed transcript with keys: {transcript_keys}")

            # 5. Get audio duration
            # try:
            #     duration = await audio_service.get_audio_duration_from_s3(s3_audio_key)
            #     logger.info(f"Got audio duration: {duration}")
            # except Exception as e:
            #     logger.error(f"Failed to get audio duration: {str(e)}")
            #     raise RuntimeError("Failed to get audio duration") from e

            # 6. Create podcast record
            try:
                podcast = Podcast(
                    file_id=file_id,
                    user_id=user_id,
                    title=result["topic"],
                    description="Generated podcast from document query",
                    duration=5000,
                    s3_audio_key=s3_audio_key,
                    s3_transcript_txt_key=" ",
                    s3_transcript_vtt_key=" ",
                    transcript_status='txt_only'
                )

                db.add(podcast)
                db.commit()
                db.refresh(podcast)
                logger.info(f"Created podcast record with ID: {podcast.id}")
            except SQLAlchemyError as e:
                logger.error(f"Database error while creating podcast: {str(e)}")
                db.rollback()
                raise RuntimeError("Failed to create podcast record") from e

            # 7. Send success notification
            try:
                await notification_manager.send_notification(
                    user_id,
                    {
                        "type": "notification",
                        "title": "Podcast Generated",
                        "message": f"Your podcast '{result['topic']}' has been generated successfully",
                        "variant": "success",
                        "duration": 5000
                    }
                )
            except Exception as e:
                logger.error(f"Failed to send success notification: {str(e)}")
                # Don't raise here as the podcast was still created successfully

            return podcast

        except Exception as e:
            logger.error(f"Error during podcast generation process: {str(e)}")
            logger.error("Full traceback:", exc_info=True)
            raise

    except Exception as e:
        logger.error(f"Critical error in generate_podcast: {str(e)}")
        logger.error("Full traceback:", exc_info=True)

        # Attempt to send error notification
        try:
            await notification_manager.send_notification(
                user_id,
                {
                    "type": "notification",
                    "title": "Podcast Generation Failed",
                    "message": "Failed to generate podcast. Please try again.",
                    "variant": "destructive",
                    "duration": 5000
                }
            )
        except Exception as notify_error:
            logger.error(f"Failed to send error notification: {str(notify_error)}")

        raise

    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
                logger.info(f"Cleaned up temporary file: {temp_file_path}")
            except Exception as e:
                logger.error(f"Failed to clean up temporary file: {str(e)}")

async def generate_quiz(file_id: UUID, query: str, db: Session, user_id: UUID):
    try:
        logger.info(f"Starting quiz generation for file {file_id}")
        quiz_service = QuizService(db)
        question_service = QuestionService(db)

        # 1. Generate quiz content using PodcastGenerator
        result = podcast_generator.generate_content(
            question=query,
            pdf_title="Help.pdf",  # TODO: Get actual filename
            output_type="quiz"
        )

        # 2. Create quiz using QuizCreate schema
        quiz_data = QuizCreate(
            title=result['quiz']['title'],
            description=result['quiz']['description'],
            file_id=file_id
        )
        quiz = quiz_service.create_quiz(user_id, quiz_data)

        # 3. Create questions using QuestionCreate schema
        for q in result['quiz']['questions']:
            question_data = QuestionCreate(
                question_type="multiple_choice",
                content=q['question'],
                explanation=q['explanation'],
                concepts=[q['difficulty']],
                options=[
                    MultipleChoiceOptionCreate(
                        content=opt,
                        is_correct=(opt == q['answer'])
                    )
                    for opt in q['options']
                ]
            )
            await question_service.create_question(quiz.id, question_data)
            # notification_manager.send_notification(user_id, {)

        logger.info(f"Completed quiz generation for file {file_id}")
        await notification_manager.send_notification(
            user_id,
            {
                "type": "notification",
                "title": "Quiz Generated",
                "message": f"Your Quiz '{result['quiz']['title']}' has been generated successfully",
                "variant": "success",
                "duration": 5000
            }
        )
        
    except Exception as e:
        log_error(logger, e, {
            'operation': 'quiz_generation',
            'file_id': str(file_id),
            'user_id': str(user_id)
        })


async def generate_flashcards(
        file_id: UUID,
        query: str,
        db: Session,
        user_id: UUID
):
    """Background task for flashcard generation"""
    try:
        logger.info(f"Starting flashcard generation for file {file_id}")
        deck_service = DeckService(db)
        card_service = CardService(db)

        # 1. Generate flashcard content using PodcastGenerator
        try:
            result = podcast_generator.generate_content(
                question=query,
                pdf_title="Help.pdf",  # TODO: Get actual filename
                output_type="flashcards"
            )

            if not result.get('flashcards'):
                raise HTTPException(
                    status_code=500,
                    detail="No flashcards were generated"
                )

            logger.debug(f"Generated flashcard content for file {file_id}")

        except Exception as e:
            logger.error(f"Failed to generate flashcard content: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error generating flashcards: {str(e)}"
            )

        # 2. Create deck using DeckCreate schema
        try:
            deck_data = DeckCreate(
                title=result['flashcards']['title'],
                description=query,  # Using the query as description
                file_id=file_id
            )
            deck = deck_service.create_deck(user_id, deck_data)
            logger.debug(f"Created flashcard deck {deck.id} for file {file_id}")

        except Exception as e:
            logger.error(f"Failed to create deck: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error creating flashcard deck: {str(e)}"
            )

        # 3. Create flashcards using FlashcardCreate schema
        created_cards = 0
        for card in result['flashcards']['flashcards']:
            try:
                card_data = FlashcardCreate(
                    front_content=card['front'],
                    back_content=card['back'],
                    page_number=card.get('page_number'),  # Optional page number
                    concepts=card.get('concepts', [])  # Optional concepts
                )
                card_service.create_flashcard(deck.id, card_data)
                created_cards += 1

            except Exception as e:
                logger.error(f"Failed to create flashcard in deck {deck.id}: {str(e)}")
                # If some cards failed, continue with others but log the error
                continue

        if created_cards == 0:
            # If no cards were created, delete the deck and raise error
            logger.error(f"No flashcards were created for deck {deck.id}")
            deck_service.delete_deck(deck.id)
            raise HTTPException(
                status_code=500,
                detail="Failed to create any flashcards"
            )

        logger.info(f"Successfully created {created_cards} flashcards in deck {deck.id}")

        # 4. Optional: Send notification about completion
        try:
            notification_data = {
                "type": "notification",
                "title": "Flashcards Generated",
                "message": f"Created {created_cards} flashcards in deck '{deck_data.title}'",
                "variant": "success"
            }
            await notification_manager.send_notification(user_id, notification_data)

        except Exception as e:
            # Log notification error but don't fail the operation
            logger.error(f"Failed to send completion notification: {str(e)}")

        return deck

    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        # Log and wrap unexpected errors
        log_error(logger, e, {
            'operation': 'flashcard_generation',
            'file_id': str(file_id),
            'user_id': str(user_id)
        })
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred during flashcard generation: {str(e)}"
        )
@router.post("", response_model=GenerateResponse)
async def generate_learning_materials(
    request: GenerateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audio_service: AudioService = Depends(get_audio_service),
    transcript_service: TranscriptService = Depends(get_transcript_service)
):
    """
    Generate learning materials based on request parameters.
    Starts background tasks for selected generation types.
    """
    logger.info(f"Received generation request for file {request.file_id}")
    
    try:
        response = GenerateResponse()

        if request.podcast:
            background_tasks.add_task(
                generate_podcast,
                request.file_id,
                request.query,
                db,
                current_user.id,
                audio_service,
                transcript_service
            )
            response.is_podcast_generating = True
            logger.info(f"Added podcast generation task for file {request.file_id}")

        if request.quiz:
            background_tasks.add_task(
                generate_quiz,
                request.file_id,
                request.query,
                db,
                current_user.id
            )
            response.is_quiz_generating = True
            logger.info(f"Added quiz generation task for file {request.file_id}")

        if request.flashcards:
            background_tasks.add_task(
                generate_flashcards,
                request.file_id,
                request.query,
                db,
                current_user.id
            )
            response.is_flashcards_generating = True
            logger.info(f"Added flashcard generation task for file {request.file_id}")

        return response

    except Exception as e:
        log_error(logger, e, {
            'operation': 'generate_learning_materials',
            'file_id': str(request.file_id),
            'user_id': str(current_user.id),
            'request': request.dict()
        })
        raise