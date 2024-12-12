from fastapi import APIRouter, Depends, UploadFile, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
import tempfile
import shutil
import os
from ...core.database import get_db
from ...core.logger import setup_logger, log_error
from ...services.s3 import S3Service
from ...services.notification_service import notification_manager
from ...schemas.file import File, FileCreate, FileResponse
from ...models.file import File as FileModel
from ...models.user import User
from ...core.security import get_current_user
from uuid import UUID
import time
import asyncio
from dotenv import load_dotenv
from agents.utils.pdf_processor import PDFProcessor

logger = setup_logger(__name__)
router = APIRouter()
s3_service = S3Service()

# Initialize PDFProcessor with necessary credentials
load_dotenv()
pdf_processor = PDFProcessor(
    openai_api_key=os.getenv("OPENAI_API_KEY"),
    pinecone_api_key=os.getenv("PINECONE_API_KEY")
)

# Create Pinecone index on startup
pdf_processor.create_index("file-embeddings-index")

# Create a dedicated directory for temporary files
TEMP_DIR = "/tmp/pdf_processing"
os.makedirs(TEMP_DIR, exist_ok=True)

async def process_pdf_embeddings(file_path: str, file_id: UUID, user_id: UUID):
    """
    Background task to process PDF and generate embeddings
    """
    try:
        logger.info(f"Starting PDF processing for file_id: {file_id}")
        
        # Verify file exists
        if not os.path.exists(file_path):
            logger.error(f"PDF file not found at path: {file_path}")
            await notification_manager.send_notification(
                user_id,
                {
                    "type": "error",
                    "message": "PDF processing failed: File not found",
                    "file_id": str(file_id)
                }
            )
            return
            
        # Process the document
        doc_info = pdf_processor.read_pdf(file_path)
        if not doc_info:
            logger.error(f"Failed to process PDF for file_id: {file_id}")
            await notification_manager.send_notification(
                user_id,
                {
                    "type": "error",
                    "message": "PDF processing failed: Could not read document",
                    "file_id": str(file_id)
                }
            )
            return

        # Add additional metadata
        doc_info["file_id"] = str(file_id)
        doc_info["user_id"] = str(user_id)
        
        # Send notification for successful embedding generation
        await notification_manager.send_notification(
            user_id,
            {
                "type": "success",
                "message": "PDF successfully converted to embeddings",
                "file_id": str(file_id),
                "status": "processing"
            }
        )
        
        # Index the document
        num_chunks, was_overwritten = pdf_processor.index_document(doc_info)
        logger.info(f"Successfully indexed {num_chunks} chunks for file_id: {file_id}")
        
        # Send notification for successful vector storage
        await notification_manager.send_notification(
            user_id,
            {
                "type": "success",
                "message": f"PDF successfully stored in vector database with {num_chunks} chunks",
                "file_id": str(file_id),
                "status": "completed",
                "chunks": num_chunks
            }
        )
        
    except Exception as e:
        error_msg = str(e)
        log_error(logger, e, {
            'file_id': str(file_id),
            'user_id': str(user_id),
            'operation': 'process_pdf_embeddings'
        })
        
        # Send error notification
        await notification_manager.send_notification(
            user_id,
            {
                "type": "error",
                "message": f"Error processing PDF: {error_msg}",
                "file_id": str(file_id)
            }
        )
        
    finally:
        # Clean up the temporary file
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.debug(f"Cleaned up temporary file: {file_path}")
        except Exception as e:
            logger.error(f"Failed to clean up temporary file {file_path}: {str(e)}")

# async def process_pdf_embeddings(file_path: str, file_id: UUID, user_id: UUID):
#     """
#     Background task to process PDF and generate embeddings
#     """
#     try:
#         logger.info(f"Starting PDF processing for file_id: {file_id}")
        
#         # Verify file exists
#         if not os.path.exists(file_path):
#             logger.error(f"PDF file not found at path: {file_path}")
#             return
            
#         # Process the document
#         doc_info = pdf_processor.read_pdf(file_path)
#         if not doc_info:
#             logger.error(f"Failed to process PDF for file_id: {file_id}")
#             return

#         # Add additional metadata
#         doc_info["file_id"] = str(file_id)
#         doc_info["user_id"] = str(user_id)
        
#         # Index the document
#         num_chunks, was_overwritten = pdf_processor.index_document(doc_info)
#         logger.info(f"Successfully indexed {num_chunks} chunks for file_id: {file_id}")
        
#     except Exception as e:
#         log_error(logger, e, {
#             'file_id': str(file_id),
#             'user_id': str(user_id),
#             'operation': 'process_pdf_embeddings'
#         })
#     finally:
#         # Clean up the temporary file
#         try:
#             if os.path.exists(file_path):
#                 os.remove(file_path)
#                 logger.debug(f"Cleaned up temporary file: {file_path}")
#         except Exception as e:
#             logger.error(f"Failed to clean up temporary file {file_path}: {str(e)}")



@router.post("/upload", response_model=FileResponse)
async def upload_file(
    file: UploadFile,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a file to S3, store its metadata in the database, and process it for semantic search
    """
    start_time = time.time()
    logger.info(f"File upload initiated by user {current_user.id}: {file.filename}")
    
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    temp_file_path = None
    
    try:
        # Create a unique temporary file in the dedicated directory
        temp_file_path = os.path.join(TEMP_DIR, f"upload_{time.time()}_{file.filename}")
        
        # Save uploaded file to temporary location
        with open(temp_file_path, "wb") as temp_file:
            content = await file.read()
            temp_file.write(content)
            
        # Reset file position for S3 upload
        await file.seek(0)
        
        # Upload to S3
        s3_key = await s3_service.upload_file(file, current_user.id)
        logger.debug(f"File uploaded to S3. Key: {s3_key}")

        try:
            # Create database record
            db_file = FileModel(
                filename=file.filename,
                s3_key=s3_key,
                file_size=file.size,
                mime_type=file.content_type,
                user_id=current_user.id
            )
            db.add(db_file)
            db.commit()
            db.refresh(db_file)
            logger.debug(f"Database record created for file: {db_file.id}")

            # Schedule PDF processing and embedding generation
            background_tasks.add_task(
                process_pdf_embeddings,
                temp_file_path,
                db_file.id,
                current_user.id
            )

        except SQLAlchemyError as e:
            # If database operation fails, attempt to cleanup S3
            logger.error("Database operation failed, attempting to cleanup S3")
            try:
                await s3_service.delete_file(s3_key)
            except Exception as cleanup_error:
                log_error(logger, cleanup_error, {'operation': 'S3 cleanup after DB failure'})
            
            log_error(logger, e, {'operation': 'database_insert'})
            raise HTTPException(status_code=500, detail="Failed to save file information")

        # Generate download URL
        download_url = await s3_service.generate_presigned_url(s3_key)
        
        elapsed_time = time.time() - start_time
        logger.info(f"File upload completed successfully. Time taken: {elapsed_time:.2f}s")

        return FileResponse(
            id=db_file.id,
            filename=db_file.filename,
            file_size=db_file.file_size,
            mime_type=db_file.mime_type,
            created_at=db_file.created_at,
            updated_at=db_file.updated_at,
            download_url=download_url
        )

    except HTTPException as he:
        # Clean up temporary file if it exists
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        # Log and re-raise HTTP exceptions
        log_error(logger, he, {
            'user_id': str(current_user.id),
            'filename': file.filename
        })
        raise
    except Exception as e:
        # Clean up temporary file if it exists
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        log_error(logger, e, {
            'user_id': str(current_user.id),
            'filename': file.filename
        })
        raise HTTPException(status_code=500, detail="Failed to process file upload")
    
@router.get("/files/{file_id}", response_model=FileResponse)
async def get_file(
    file_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific file's details and download URL
    """
    logger.info(f"Fetching file {file_id} for user {current_user.id}")

    try:
        file = db.query(FileModel).filter(
            FileModel.id == file_id,
            FileModel.user_id == current_user.id,
            FileModel.is_deleted == False
        ).first()

        if not file:
            logger.warning(f"File {file_id} not found for user {current_user.id}")
            raise HTTPException(status_code=404, detail="File not found")

        # Generate download URL
        download_url = await s3_service.generate_presigned_url(file.s3_key)
        logger.debug(f"Generated download URL for file {file_id}")

        return FileResponse(
            id=file.id,
            filename=file.filename,
            file_size=file.file_size,
            mime_type=file.mime_type,
            created_at=file.created_at,
            updated_at=file.updated_at,
            download_url=download_url
        )

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        log_error(logger, e, {
            'file_id': str(file_id),
            'user_id': str(current_user.id),
            'operation': 'get_file'
        })
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        log_error(logger, e, {
            'file_id': str(file_id),
            'user_id': str(current_user.id),
            'operation': 'get_file'
        })
        raise HTTPException(status_code=500, detail="Failed to retrieve file")


@router.delete("/files/{file_id}")
async def delete_file(
    file_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a file (soft delete in database, remove from S3, and remove from vector database if processed)
    """
    logger.info(f"Delete request for file {file_id} from user {current_user.id}")

    try:
        file = db.query(FileModel).filter(
            FileModel.id == file_id,
            FileModel.user_id == current_user.id,
            FileModel.is_deleted == False
        ).first()

        if not file:
            logger.warning(f"File {file_id} not found for user {current_user.id}")
            raise HTTPException(status_code=404, detail="File not found")

        try:
            # Send deletion started notification
            await notification_manager.send_notification_with_retry(
                current_user.id,
                {
                    "type": "info",
                    "message": "Starting file deletion process",
                    "file_id": str(file_id),
                    "status": "deleting"
                }
            )

            deletion_details = []
            
            # Delete from S3
            try:
                await s3_service.delete_file(file.s3_key)
                logger.debug(f"Deleted file {file_id} from S3")
                deletion_details.append("S3 storage")
            except Exception as s3_error:
                logger.error(f"Failed to delete from S3: {str(s3_error)}")
                raise

            # Attempt to delete from vector database
            try:
                vector_deletion_success = await pdf_processor.delete_document_by_file_id(str(file_id))
                if vector_deletion_success:
                    logger.debug(f"Deleted embeddings for file {file_id} from vector database")
                    deletion_details.append("vector database")
                else:
                    logger.warning(f"No embeddings found to delete for file {file_id} - file may not have been processed yet")
            except Exception as vector_error:
                logger.error(f"Error during vector deletion: {str(vector_error)}")
                # Continue with deletion even if vector deletion fails

            # Soft delete in database
            file.is_deleted = True
            db.commit()
            logger.info(f"Successfully deleted file {file_id}")
            deletion_details.append("database")

            # Prepare success message based on what was deleted
            deletion_locations = " and ".join(deletion_details)
            success_message = f"File successfully removed from {deletion_locations}"

            # Send success notification
            await notification_manager.send_notification_with_retry(
                current_user.id,
                {
                    "type": "success",
                    "message": success_message,
                    "file_id": str(file_id),
                    "status": "deleted",
                    "deletion_details": deletion_details
                }
            )

            return {
                "message": success_message,
                "deletion_details": deletion_details
            }

        except Exception as e:
            # Rollback database changes if deletion fails
            db.rollback()
            
            # Send error notification
            await notification_manager.send_notification_with_retry(
                current_user.id,
                {
                    "type": "error",
                    "message": f"Failed to delete file: {str(e)}",
                    "file_id": str(file_id),
                    "status": "error"
                }
            )
            
            log_error(logger, e, {
                'file_id': str(file_id),
                'user_id': str(current_user.id),
                'operation': 'delete_file'
            })
            raise HTTPException(status_code=500, detail="Failed to delete file")

    except HTTPException:
        raise
    except Exception as e:
        log_error(logger, e, {
            'file_id': str(file_id),
            'user_id': str(current_user.id),
            'operation': 'delete_file'
        })
        raise HTTPException(status_code=500, detail="Failed to process delete request")