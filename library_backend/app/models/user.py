from sqlalchemy import Column, Integer, String, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base
import uuid



class User(Base):
    __tablename__ = "users"

    # Admin-defined user_id as primary key
    user_id = Column(String(50), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_name = Column(String(100), nullable=False)
    user_email = Column(String(150), unique=True, nullable=False, index=True)
    user_photo = Column(String, nullable=True)
    password = Column(String(255), nullable=False)
    role = Column(String(50), default="user")
    created_at = Column(TIMESTAMP, server_default=func.now())




##-- hashed "Admin@123"