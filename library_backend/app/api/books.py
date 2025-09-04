from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.crud.book import BookCRUD
from app.schemas.book import BookPublic, BookDetail, BookCreate, BookUpdate
from app.dependencies import get_db
#from app.core.security import get_current_user, get_current_admin
from app.dependencies import get_current_user, get_current_admin


router = APIRouter()


# ----------------------
# Public Endpoints
# ----------------------

@router.get("/", response_model=List[BookPublic], tags=["Public Books"])
async def list_books(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    q: Optional[str] = Query(None, description="Search term"),
    db: AsyncSession = Depends(get_db)
):
    skip = (page - 1) * page_size
    books = await BookCRUD.get_books(db, skip=skip, limit=page_size, search=q)
    return books


@router.get("/{book_id}", response_model=BookDetail, tags=["Public Books"])
async def book_details(book_id: int, db: AsyncSession = Depends(get_db)):
    book = await BookCRUD.get_book(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


# ----------------------
# Admin Endpoints
# ----------------------

@router.get("/all", response_model=List[BookDetail], tags=["Admin Books"], dependencies=[Depends(get_current_admin)])
async def list_all_books(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    skip = (page - 1) * page_size
    books = await BookCRUD.get_books(db, skip=skip, limit=page_size)
    return books


@router.post("/all", response_model=BookDetail, status_code=201, tags=["Admin Books"], dependencies=[Depends(get_current_admin)])
async def create_book(book_in: BookCreate, db: AsyncSession = Depends(get_db)):
    book = await BookCRUD.create_book(db, book_in)
    return book


@router.patch("/{book_id}", response_model=BookDetail, tags=["Admin Books"], dependencies=[Depends(get_current_admin)])
async def update_book(book_id: int, book_in: BookUpdate, db: AsyncSession = Depends(get_db)):
    book = await BookCRUD.update_book(db, book_id, book_in)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.delete("/{book_id}", status_code=204, tags=["Admin Books"], dependencies=[Depends(get_current_admin)])
async def delete_book(book_id: int, db: AsyncSession = Depends(get_db)):
    success = await BookCRUD.delete_book(db, book_id)
    if not success:
        raise HTTPException(status_code=409, detail="Book cannot be deleted while borrowed")
    return
