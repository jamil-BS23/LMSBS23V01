from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.models.book import Book
from app.crud.book import BookCRUD
from app.schemas.book import BookPublic, BookDetail, BookCreate, BookUpdate, RateBook, BookDetail2, UpdateFeatured
from app.dependencies import get_db
#from app.core.security import get_current_user, get_current_admin
from app.dependencies import get_current_user, get_current_admin
from app.models.user_rating import UserRating
from app.crud.book_review import BookReviewCRUD
from app.schemas.book_review import BookReviewCreate, BookReviewOut

from app.utils.minio_utils import upload_file
from typing import Dict
from sqlalchemy import select, and_, extract
from datetime import datetime
from app.models.user import User





router = APIRouter()




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


@router.get("/count", tags=["Public Books"])
async def count_books(db: AsyncSession = Depends(get_db)) -> Dict[str, int]:
    """
    Returns the total number of books in the library.
    Example response: {"total_books": 123}
    """
    total = await BookCRUD.count_books(db)
    return {"count": total}


@router.get("/all", response_model=List[BookDetail2], tags=["Admin Books"], dependencies=[Depends(get_current_user)])
async def list_all_books(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    skip = (page - 1) * page_size
    books = await BookCRUD.get_books(db, skip=skip, limit=page_size)
    return books




@router.post(
    "/all", 
    response_model=BookDetail, 
    status_code=201, 
    tags=["Admin Books"], 
    dependencies=[Depends(get_current_admin)]
)
async def create_book(
    book_title: str = Form(...),
    book_author: str = Form(...),
    book_category_id: int = Form(...),
    book_rating: float = Form(0.0),
    book_details: Optional[str] = Form(None),
    book_availability: bool = Form(True),
    book_count: int = Form(1),
    book_photo: UploadFile = File(...),
    book_pdf: UploadFile = File(None),
    book_audio: UploadFile = File(None),
    db: AsyncSession = Depends(get_db)
):
    photo_url = upload_file(book_photo, folder="books")
    pdf_url = upload_file(book_pdf, folder="book_pdfs") if book_pdf else None
    audio_url = upload_file(book_audio, folder="book_audios") if book_audio else None

    book_in = {
        "book_title": book_title,
        "book_author": book_author,
        "book_category_id": book_category_id,
        "book_rating": book_rating,
        "book_details": book_details,
        "book_availability": book_availability,
        "book_count": book_count,
        "book_photo": photo_url,
        "book_pdf": pdf_url,
        "book_audio": audio_url,
    }

    book = await BookCRUD.create_book(db, book_in)
    print(book)
    return book





@router.get("/recommended", response_model=List[BookDetail], tags=["Books"])
async def get_recommended_books(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    skip = (page - 1) * page_size
    stmt = (
        select(Book)
        .where(Book.book_rating.between(2.0, 3.0))
        .offset(skip)
        .limit(page_size)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/popular", response_model=List[BookDetail], tags=["Books"])
async def get_popular_books(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    skip = (page - 1) * page_size
    stmt = (
        select(Book)
        .where(Book.book_rating.between(4.0, 5.0))
        .offset(skip)
        .limit(page_size)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/new", response_model=List[BookDetail], tags=["Books"])
async def get_new_books(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    skip = (page - 1) * page_size
    current_month = datetime.utcnow().month
    current_year = datetime.utcnow().year

    stmt = (
        select(Book)
        .where(
            and_(
                extract("month", Book.created_at) == current_month,
                extract("year", Book.created_at) == current_year
            )
        )
        .offset(skip)
        .limit(page_size)
    )
    result = await db.execute(stmt)
    return result.scalars().all()




@router.get("/featured", response_model=List[BookDetail2], tags=["Books"], dependencies=[Depends(get_current_user)])
async def list_featured_books(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by title, author, or details")
):
    skip = (page - 1) * page_size
    books = await BookCRUD.get_featured_books(db, skip=skip, limit=page_size, search=search)
    return books




@router.patch("/{book_id}/featured", response_model=BookDetail, tags=["Books"])
async def update_book_featured(
    book_id: int,
    data: UpdateFeatured,  # expects JSON body like {"featured": true}
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    # ✅ Allow only admins to update featured status
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    # ✅ Fetch the book
    book = await db.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # ✅ Update featured column (true/false)
    book.featured = data.featured

    db.add(book)
    await db.commit()
    await db.refresh(book)

    return book




@router.get("/books/{category_id}", response_model=List[BookDetail], tags=["Public Books"])
async def list_books_by_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    """
    Fetch all books by a specific category ID.
    Supports pagination and returns category title.
    """
    skip = (page - 1) * page_size
    books = await BookCRUD.get_books_by_category(db, category_id, skip=skip, limit=page_size)
    return books






@router.get("/{book_id}", response_model=BookDetail2, tags=["Public Books"])
async def book_details(book_id: int, db: AsyncSession = Depends(get_db)):
    book = await BookCRUD.get_book(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
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




@router.patch("/{book_id}/rate", response_model=BookDetail, tags=["Books"])
async def rate_book(
    book_id: int,
    data: RateBook,  # <- Expect JSON body
    db: AsyncSession = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    book = await db.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    existing_rating = await db.execute(
        select(UserRating).where(
            UserRating.user_id == current_user.user_id,
            UserRating.book_id == book_id
        )
    )
    existing_rating = existing_rating.scalar_one_or_none()
    if existing_rating:
        raise HTTPException(status_code=400, detail="You have already rated this book")

    new_rating = UserRating(user_id=current_user.user_id, book_id=book_id, rating=data.rating)
    db.add(new_rating)

    all_ratings = await db.execute(
        select(UserRating.rating).where(UserRating.book_id == book_id)
    )
    all_ratings = [float(r[0]) for r in all_ratings.fetchall()] + [float(data.rating)]
    book.book_rating = round(sum(all_ratings) / len(all_ratings), 1)

    db.add(book)
    await db.commit()
    await db.refresh(book)

    return book



@router.post("/books/{book_id}/review", response_model=BookReviewOut)
async def add_review(
    book_id: int,
    review: BookReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await BookReviewCRUD.create_review(db, current_user.user_id, book_id, review.review_text)




@router.get("/books/{book_id}/reviews", response_model=list[BookReviewOut])
async def get_book_reviews(
    book_id: int,
    db: AsyncSession = Depends(get_db)
):
    return await BookReviewCRUD.get_reviews(db, book_id)