from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class BookReview(Base):
    __tablename__ = "book_reviews"

    review_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False)
    review_text = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
