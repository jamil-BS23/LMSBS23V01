from sqlalchemy import Column, Integer, ForeignKey, DECIMAL, UniqueConstraint, String
from sqlalchemy.orm import relationship
from app.database import Base

class UserRating(Base):
    __tablename__ = "user_rating"

    rating_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False)
    rating = Column(DECIMAL(2,1), nullable=False)

    __table_args__ = (
        UniqueConstraint('user_id', 'book_id', name='uix_user_book'),  # prevents multiple ratings per user/book
    )
