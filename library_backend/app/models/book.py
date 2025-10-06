from sqlalchemy import Column, Integer, String, DECIMAL, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class Book(Base):
    __tablename__ = "books"

    book_id = Column(Integer, primary_key=True, autoincrement=True)
    book_title = Column(String(200), nullable=False)
    book_author = Column(String(150), nullable=False)
    book_category_id = Column(Integer, ForeignKey("categories.category_id", ondelete="CASCADE"))
    book_rating = Column(DECIMAL(2,1), default=0)
    book_photo = Column(String, nullable=True)
    book_pdf = Column(String, nullable=True)
    book_audio = Column(String, nullable=True)
    book_details = Column(String, nullable=True)
    book_availability = Column(Boolean, default=True)
    book_count = Column(Integer, default=1)
    created_at = Column(TIMESTAMP, server_default=func.now())
