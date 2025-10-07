from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class DonationBook(Base):
    __tablename__ = "donation_books"

    d_book_id = Column(Integer, primary_key=True, autoincrement=True)
    book_title = Column(String(200), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.category_id", ondelete="CASCADE"))
    category_title = Column(String(200), nullable=False)
    book_author = Column(String(150), nullable=False)
    BS_mail = Column(String(150), nullable=False)
    BS_ID = Column(String(100), nullable=False)   # <-- just a normal String now
    book_detail = Column(String)
    book_photo = Column(String)
    book_pdf = Column(String)
    book_audio = Column(String)
    book_count = Column(Integer)
    book_approve = Column(String(100), default="pending")
    created_at = Column(TIMESTAMP, server_default=func.now())
