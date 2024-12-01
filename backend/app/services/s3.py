import logging
import boto3
from fastapi import UploadFile, HTTPException
from ..core.config import settings
from typing import Optional
import uuid
from tkinter.constants import E

class S3Service:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.AWS_BUCKET_NAME

    async def upload_file(self, file: UploadFile, user_id: uuid.UUID) -> str:
        """
        Uploads a file to S3 and returns the S3 key.
        Files are stored in a user-specific directory.
        """
        try:
            # Generate a unique filename to avoid collisions
            file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
            s3_key = f"users/{user_id}/{uuid.uuid4()}.{file_extension}"
            logging.info(self)
            # Upload the file
            await self.s3_client.upload_fileobj(
                file.file,
                self.bucket_name,
                s3_key,
                ExtraArgs={
                    'ContentType': file.content_type
                }
            )
            return s3_key
        except Exception as e:
            logging.error(e)
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload file to S3: {str(e)}"
            )

    async def generate_presigned_url(self, s3_key: str, expires_in: int = 3600) -> str:
        """
        Generates a presigned URL for downloading a file.
        URL expires after the specified time (default 1 hour).
        """
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': s3_key
                },
                ExpiresIn=expires_in
            )
            return url
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate download URL: {str(e)}"
            )

    async def delete_file(self, s3_key: str) -> bool:
        """
        Deletes a file from S3.
        Returns True if successful, raises HTTPException otherwise.
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return True
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete file from S3: {str(e)}"
            )
