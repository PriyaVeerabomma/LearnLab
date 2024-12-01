import logging
from fastapi import APIRouter, Depends, UploadFile, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from ...services.s3 import S3Service
from ...schemas.file import File, FileCreate, FileResponse
from ...models.file import File as FileModel
from ...models.user import User
from ...core.security import get_current_user
from uuid import UUID

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
    logging.info("Received request to upload a file:")
    logging.info(file.filename)
    try:
        # Upload to S3
        s3_key = await s3_service.upload_file(file, current_user.id)
        logging.info(s3_key)
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

        # Generate download URL
        download_url = await s3_service.generate_presigned_url(s3_key)

        return FileResponse(
            id=db_file.id,
            filename=db_file.filename,
            file_size=db_file.file_size,
            mime_type=db_file.mime_type,
            created_at=db_file.created_at,
            updated_at=db_file.updated_at,
            download_url=download_url
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/files", response_model=List[FileResponse])
async def list_files(
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    List all files uploaded by the current user
    """
    files = db.query(FileModel).filter(
        FileModel.user_id == current_user.id,
        FileModel.is_deleted == False
    ).offset(skip).limit(limit).all()

    # Generate download URLs for each file
    responses = []
    for file in files:
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

    return responses

@router.get("/files/{file_id}", response_model=FileResponse)
async def get_file(
    file_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific file's details and download URL
    """
    file = db.query(FileModel).filter(
        FileModel.id == file_id,
        FileModel.user_id == current_user.id,
        FileModel.is_deleted == False
    ).first()

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # Generate download URL
    download_url = await s3_service.generate_presigned_url(file.s3_key)

    return FileResponse(
        id=file.id,
        filename=file.filename,
        file_size=file.file_size,
        mime_type=file.mime_type,
        created_at=file.created_at,
        updated_at=file.updated_at,
        download_url=download_url
    )

@router.delete("/files/{file_id}")
async def delete_file(
    file_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a file (soft delete in database and remove from S3)
    """
    file = db.query(FileModel).filter(
        FileModel.id == file_id,
        FileModel.user_id == current_user.id,
        FileModel.is_deleted == False
    ).first()

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    try:
        # Delete from S3
        await s3_service.delete_file(file.s3_key)

        # Soft delete in database
        file.is_deleted = True
        db.commit()

        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
