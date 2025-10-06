from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from datetime import datetime



class BookPublic(BaseModel):
    book_id: int
    book_title: str
    book_category_id: int
    book_photo: Optional[HttpUrl]
    book_availability: bool = Field(..., alias="book_availability")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class BookDetail(BaseModel):
    book_id: int
    book_title: str
    book_author: str
    book_category_id: int
    book_rating: float
    book_photo: Optional[HttpUrl]
    book_pdf: Optional[HttpUrl]
    book_audio: Optional[HttpUrl]
    book_details: Optional[str]
    book_availability: bool = Field(..., alias="book_availability")
    book_count: int
    created_at: datetime

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class BookCreate(BaseModel):
    book_title: str
    book_author: str
    book_category_id: int
    book_rating: float = 0.0
    book_photo: Optional[HttpUrl]
    book_pdf: Optional[HttpUrl]
    book_audio: Optional[HttpUrl]
    book_details: Optional[str]
    book_availability: bool = True
    book_count: int = 1

class BookUpdate(BaseModel):
    book_title: Optional[str] = None
    book_author: Optional[str] = None
    book_category_id: Optional[int] = None
    book_rating: Optional[float] = None
    book_photo: Optional[HttpUrl] = None
    book_pdf: Optional[HttpUrl] = None
    book_audio: Optional[HttpUrl] = None
    book_details: Optional[str] = None
    book_availability: Optional[bool] = None
    book_count: Optional[int] = None

