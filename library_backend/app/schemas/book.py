from pydantic import BaseModel, Field, HttpUrl
from typing import Optional


class BookPublic(BaseModel):
    book_id: int
    book_title: str
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
    book_details: Optional[str]
    book_availability: bool = Field(..., alias="book_availability")
    book_count: int

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class BookCreate(BaseModel):
    book_title: str
    book_author: str
    book_category_id: int
    book_rating: float = 0.0
    book_photo: Optional[HttpUrl]
    book_details: Optional[str]
    book_availability: bool = True
    book_count: int = 1


class BookUpdate(BaseModel):
    book_title: Optional[str]
    book_author: Optional[str]
    book_category_id: Optional[int]
    book_rating: Optional[float]
    book_photo: Optional[HttpUrl]
    book_details: Optional[str]
    book_availability: Optional[bool]
    book_count: Optional[int]
