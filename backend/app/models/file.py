from sqlalchemy import Column, String, DateTime, BigInteger, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from ..core.database import Base
from datetime import datetime

class File(Base):
    __tablename__ = "files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'))
    filename = Column(String)
    s3_key = Column(String)
    file_size = Column(BigInteger)
    mime_type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)