from sqlalchemy import Column, Integer, String
from app.database import Base

class Category(Base):
    __tablename__ = "categories"
    category_id = Column(Integer, primary_key=True, autoincrement=True)
    category_title = Column(String(100), nullable=False, unique=True)
