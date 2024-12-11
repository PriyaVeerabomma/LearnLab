from fastapi import APIRouter, Depends, UploadFile, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
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

logger = setup_logger(__name__)
router = APIRouter()
s3_service = S3Service()

@router.post("/upload", response_model=FileResponse)
async def upload_file(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a file to S3 and store its metadata in the database
    """
    start_time = time.time()
    logger.info(f"File upload initiated by user {current_user.id}: {file.filename}")
    
    try:
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
        # Log and re-raise HTTP exceptions
        log_error(logger, he, {
            'user_id': str(current_user.id),
            'filename': file.filename
        })
        raise
    except Exception as e:
        log_error(logger, e, {
            'user_id': str(current_user.id),
            'filename': file.filename
        })
        raise HTTPException(status_code=500, detail="Failed to process file upload")

@router.get("/files", response_model=List[FileResponse])
async def list_files(    
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100), 
    db: Session = Depends(get_db),    
):
    """
    List all files uploaded by the current user
    """
    logger.info(f"Listing files for user {current_user.id}. Skip: {skip}, Limit: {limit}")
    await notification_manager.send_notification(current_user.id, {
        "type": "notification",
        "title": "Process Complete",
        "message": "Your file has been processed",
        "variant": "success"
        })    


    try:
        files = db.query(FileModel).filter(
            FileModel.user_id == current_user.id,
            FileModel.is_deleted == False
        ).offset(skip).limit(limit).all()
        
        logger.debug(f"Found {len(files)} files")

        # Generate download URLs for each file
        responses = []
        for file in files:
            try:
                download_url = await s3_service.generate_presigned_url(file.s3_key)
                responses.append(
                    FileResponse(
                        id=file.id,
                        filename=file.filename,
                        file_size=file.file_size,
                        mime_type=file.mime_type,
                        created_at=file.created_at,
                        updated_at=file.updated_at,
                        download_url=download_url
                    )
                )
            except Exception as e:
                log_error(logger, e, {
                    'file_id': str(file.id),
                    'operation': 'generate_url'
                })
                # Continue with other files even if one fails
                continue        

        return responses

    except SQLAlchemyError as e:
        log_error(logger, e, {
            'user_id': str(current_user.id),
            'operation': 'list_files'
        })
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        log_error(logger, e, {
            'user_id': str(current_user.id),
            'operation': 'list_files'
        })
        raise HTTPException(status_code=500, detail="Failed to retrieve files")

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
    Delete a file (soft delete in database and remove from S3)
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
            # Delete from S3
            await s3_service.delete_file(file.s3_key)
            logger.debug(f"Deleted file {file_id} from S3")

            # Soft delete in database
            file.is_deleted = True
            db.commit()
            logger.info(f"Successfully deleted file {file_id}")

            return {"message": "File deleted successfully"}

        except Exception as e:
            # Rollback database changes if S3 deletion fails
            db.rollback()
            log_error(logger, e, {
                'file_id': str(file_id),
                'user_id': str(current_user.id),
                'operation': 'delete_file'
            })
            raise HTTPException(status_code=500, detail="Failed to delete file")

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        log_error(logger, e, {
            'file_id': str(file_id),
            'user_id': str(current_user.id),
            'operation': 'delete_file_db'
        })
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        log_error(logger, e, {
            'file_id': str(file_id),
            'user_id': str(current_user.id),
            'operation': 'delete_file'
        })
        raise HTTPException(status_code=500, detail="Failed to process delete request")