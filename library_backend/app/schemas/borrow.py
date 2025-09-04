from pydantic import BaseModel, Field, validator
from datetime import date
from typing import Optional, List

# Enums for validation
BORROW_STATUS = {"borrowed", "returned", "overdue"}
REQUEST_STATUS = {"accept", "pending", "reject"}


# Borrow record for responses
class BorrowRecord(BaseModel):
    borrow_id: int
    user_id: int
    user_name: Optional[str]
    book_id: int
    book_title: Optional[str]
    borrow_date: date
    return_date: date
    borrow_status: str
    request_status: str

    class Config:
        orm_mode = True


# Borrow create schema (for user requests)
class BorrowCreate(BaseModel):
    user_id: int
    borrow_date: date
    return_date: date

    @validator("return_date")
    def check_date_range(cls, v, values):
        borrow_date = values.get("borrow_date")
        if borrow_date and v < borrow_date:
            raise ValueError("return_date cannot be before borrow_date")
        return v


# Borrow status update schema (admin)
class BorrowStatusUpdate(BaseModel):
    borrow_status: Optional[str] = None  # borrowed / returned / overdue
    request_status: Optional[str] = None  # accept / pending / reject

    @validator("borrow_status")
    def validate_borrow_status(cls, v):
        if v and v not in BORROW_STATUS:
            raise ValueError(f"Invalid borrow_status, must be one of {BORROW_STATUS}")
        return v

    @validator("request_status")
    def validate_request_status(cls, v):
        if v and v not in REQUEST_STATUS:
            raise ValueError(f"Invalid request_status, must be one of {REQUEST_STATUS}")
        return v


# Schema for list response wrapper with pagination meta
class BorrowListResponse(BaseModel):
    data: List[BorrowRecord]
    meta: dict = Field(..., example={"total": 100, "page": 1, "page_size": 20})


# Schema for returning only counts
class BorrowCountResponse(BaseModel):
    count: int
