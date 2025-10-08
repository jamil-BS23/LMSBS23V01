from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BookReviewCreate(BaseModel):
    book_id: int
    review_text: str

class BookReviewOut(BaseModel):
    review_id: int
    user_id: str
    book_id: int
    review_text: str
    created_at: datetime

    class Config:
        orm_mode = True
