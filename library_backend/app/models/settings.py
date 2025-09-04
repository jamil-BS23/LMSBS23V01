from sqlalchemy import Column, Integer, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class Settings(Base):
    __tablename__ = "settings"

    setting_id = Column(Integer, primary_key=True, autoincrement=True)
    borrow_day_limit = Column(Integer, nullable=False)
    borrow_day_extension_limit = Column(Integer, nullable=False)
    borrow_max_limit = Column(Integer, nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
