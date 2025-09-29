from pydantic import BaseModel, HttpUrl
from typing import Optional


class DonationBookBase(BaseModel):
    book_title: str
    category_id: int
    category_title: str
    book_author: str
    BS_mail: str
    BS_ID: str
    book_detail: Optional[str] = None
    book_photo: Optional[HttpUrl] = None
    book_count: int = 1

class DonationBookCreate(DonationBookBase):
    pass

class DonationBookPublic(DonationBookBase):
    d_book_id: int
    book_approve: str

    class Config:
        orm_mode = True



class DonationBookResponse(BaseModel):
    d_book_id: int
    book_title: str
    category_id: int
    category_title: str
    book_author: str
    BS_mail: str
    BS_ID: str
    book_detail: str
    book_photo: str
    book_count: int
    book_approve: str

    class Config:
        orm_mode = True