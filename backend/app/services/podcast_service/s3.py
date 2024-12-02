from typing import Protocol, Optional, Dict
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
import logging
from fastapi import HTTPException

from app.core.config import settings

logger = logging.getLogger(__name__)

class IS3Service(Protocol):
    async def upload_file(
        self,
        file_path: str,
        s3_key: str
    ) -> bool:
        pass
    
    async def get_presigned_url(
        self,
        s3_key: str,
        expiry_seconds: int = 3600,
        query_params: Optional[Dict[str, str]] = None
    ) -> str:
        pass
    
    async def delete_file(
        self,
        s3_key: str
    ) -> bool:
        pass
    
    async def check_file_exists(
        self,
        s3_key: str
    ) -> bool:
        pass
    
    async def copy_file(
        self,
        source_key: str,
        dest_key: str
    ) -> bool:
        pass

class S3Service:
    def __init__(self):
        self.config = Config(
            retries=dict(
                max_attempts=3
            )
        )
        
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
            config=self.config
        )
        
        self.bucket_name = settings.S3_BUCKET_NAME

    async def upload_file(
        self,
        file_path: str,
        s3_key: str
    ) -> bool:
        """Upload a file to S3"""
        
        try:
            extra_args = {}
            
            # Set content type based on file extension
            if s3_key.endswith('.txt'):
                extra_args['ContentType'] = 'text/plain'
            elif s3_key.endswith('.vtt'):
                extra_args['ContentType'] = 'text/vtt'
            elif s3_key.endswith(('.mp3', '.m4a', '.wav', '.ogg')):
                extra_args['ContentType'] = 'audio/mpeg'

            # Set additional headers
            extra_args.update({
                'CacheControl': 'max-age=31536000',  # 1 year
                'ACL': 'private'
            })

            # Upload file
            self.s3_client.upload_file(
                file_path,
                self.bucket_name,
                s3_key,
                ExtraArgs=extra_args
            )
            return True

        except ClientError as e:
            logger.error(f"Error uploading file to S3: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to upload file to storage"
            )

    async def get_presigned_url(
        self,
        s3_key: str,
        expiry_seconds: int = 3600,
        query_params: Optional[Dict[str, str]] = None
    ) -> str:
        """Generate a presigned URL for accessing an S3 object"""
        
        try:
            params = {
                'Bucket': self.bucket_name,
                'Key': s3_key
            }

            # Add query parameters if provided
            if query_params:
                params['QueryParameters'] = query_params

            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params=params,
                ExpiresIn=expiry_seconds
            )
            return url

        except ClientError as e:
            logger.error(f"Error generating presigned URL: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to generate access URL"
            )

    async def delete_file(self, s3_key: str) -> bool:
        """Delete a file from S3"""
        
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return True

        except ClientError as e:
            logger.error(f"Error deleting file from S3: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to delete file from storage"
            )

    async def check_file_exists(self, s3_key: str) -> bool:
        """Check if a file exists in S3"""
        
        try:
            self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return True

        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return False
            logger.error(f"Error checking file in S3: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to check file existence"
            )

    async def copy_file(
        self,
        source_key: str,
        dest_key: str
    ) -> bool:
        """Copy a file within S3"""
        
        try:
            copy_source = {
                'Bucket': self.bucket_name,
                'Key': source_key
            }
            
            self.s3_client.copy_object(
                CopySource=copy_source,
                Bucket=self.bucket_name,
                Key=dest_key
            )
            return True

        except ClientError as e:
            logger.error(f"Error copying file in S3: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to copy file"
            )