from typing import Protocol, Tuple, Optional
from fastapi import UploadFile, HTTPException
from uuid import UUID
import aiofiles
import subprocess
from pydub import AudioSegment
import os
import logging
from datetime import timedelta

from app.core.config import settings
from .s3 import S3Service

logger = logging.getLogger(__name__)

class IAudioService(Protocol):
    async def upload_podcast(
        self, 
        file: UploadFile, 
        user_id: UUID,
        validate_duration: bool = True
    ) -> Tuple[str, int]:
        pass
    
    async def get_streaming_url(
        self, 
        s3_key: str, 
        start_position: int = 0
    ) -> str:
        pass
    
    async def validate_audio_format(
        self, 
        file: UploadFile
    ) -> bool:
        pass
    
    async def get_audio_duration(
        self, 
        file: UploadFile
    ) -> int:
        pass
    
    async def process_chunk(
        self,
        file: UploadFile,
        chunk_start: int,
        chunk_size: int
    ) -> bytes:
        pass
class AudioService:
    def __init__(self, s3_service: S3Service):
        self.s3_service = s3_service
        self.ALLOWED_FORMATS = ["mp3", "wav", "m4a", "ogg"]
        self.MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB

    async def upload_podcast(
        self, 
        file: UploadFile, 
        user_id: UUID,
        validate_duration: bool = True
    ) -> Tuple[str, int]:
        """Upload a podcast file to S3 and return its key and duration"""
        
        if not await self.validate_audio_format(file):
            raise HTTPException(
                status_code=400,
                detail="Invalid audio format. Supported formats: " + ", ".join(self.ALLOWED_FORMATS)
            )

        # Create temporary file
        temp_file_path = f"/tmp/{file.filename}"
        try:
            async with aiofiles.open(temp_file_path, 'wb') as out_file:
                content = await file.read()
                if len(content) > self.MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=400,
                        detail=f"File size exceeds maximum limit of {self.MAX_FILE_SIZE/1024/1024}MB"
                    )
                await out_file.write(content)

            duration = 0
            if validate_duration:
                duration = await self.get_audio_duration(file)

            # Generate S3 key
            s3_key = f"podcasts/{user_id}/{file.filename}"
            
            # Upload to S3
            await self.s3_service.upload_file(temp_file_path, s3_key)
            
            return s3_key, duration

        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)

    async def get_streaming_url(
        self,
        s3_key: str,
        start_position: int = 0
    ) -> str:
        """Get a presigned URL for streaming with range support"""
        
        # Calculate expiry based on audio duration to ensure complete playback
        url = await self.s3_service.get_presigned_url(
            s3_key,
            expiry_seconds=3600,  # 1 hour
            query_params={"start": start_position} if start_position > 0 else None
        )
        return url

    async def validate_audio_format(self, file: UploadFile) -> bool:
        """Validate if the uploaded file is in an acceptable audio format"""
        
        if not file.filename:
            return False
            
        file_ext = file.filename.split('.')[-1].lower()
        return file_ext in self.ALLOWED_FORMATS

    async def get_audio_duration(self, file: UploadFile) -> int:
        """Get the duration of an audio file in seconds"""
        
        temp_file_path = f"/tmp/{file.filename}"
        try:
            async with aiofiles.open(temp_file_path, 'wb') as out_file:
                content = await file.read()
                await out_file.write(content)

            # Reset file position for future reads
            await file.seek(0)

            # Get duration using ffmpeg
            result = subprocess.run([
                'ffprobe', 
                '-v', 'error', 
                '-show_entries', 'format=duration', 
                '-of', 'default=noprint_wrappers=1:nokey=1', 
                temp_file_path
            ], capture_output=True, text=True)

            duration = float(result.stdout.strip())
            return int(duration)

        except Exception as e:
            logger.error(f"Error getting audio duration: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail="Unable to process audio file. Please ensure it's a valid audio file."
            )
        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)

    async def process_chunk(
        self, 
        file: UploadFile, 
        chunk_start: int, 
        chunk_size: int
    ) -> bytes:
        """Process an audio chunk for streaming"""
        
        temp_file_path = f"/tmp/{file.filename}"
        try:
            async with aiofiles.open(temp_file_path, 'wb') as out_file:
                content = await file.read()
                await out_file.write(content)

            audio = AudioSegment.from_file(temp_file_path)
            chunk = audio[chunk_start:chunk_start + chunk_size]
            
            return chunk.raw_data

        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)