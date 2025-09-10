from sqlalchemy import Column, Integer, ForeignKey, Date, String
from app.database import Base

class BorrowRecord(Base):
    __tablename__ = "borrow_records"

    borrow_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), ForeignKey("users.user_id", ondelete="CASCADE"))
    book_id = Column(Integer, ForeignKey("books.book_id", ondelete="CASCADE"))
    borrow_date = Column(Date)
    return_date = Column(Date)
    borrow_status = Column(String(50), default="borrowed")    # borrowed / returned / overdue
    request_status = Column(String(50), default="pending")    # pending / accepted / rejected





