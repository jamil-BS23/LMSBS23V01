from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from app.dependencies import get_db, get_current_user, get_current_admin
from app.utils.minio_utils import upload_file
from app.crud.donation_book import DonationBookCRUD
from app.schemas.donation_book import DonationBookPublic, DonationBookResponse

router = APIRouter()



@router.get("/", response_model=List[DonationBookResponse])
async def get_all_donation_books(db: AsyncSession = Depends(get_db)):
    """
    Fetch all donation book requests for admin review.
    """
    return await DonationBookCRUD.get_all(db)

@router.put("/", response_model=DonationBookPublic)
async def create_donation_book(
    book_title: str = Form(...),
    category_id: int = Form(...),
    category_title: str = Form(...),
    book_author: str = Form(...),
    BS_mail: str = Form(...),
    BS_ID: str = Form(...),
    book_detail: Optional[str] = Form(None),
    book_count: int = Form(1),
    book_photo: UploadFile = File(...),      # keep same as book API (required)
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # ➤ 1. Upload to MinIO (same helper as Book API)
    photo_url = upload_file(book_photo, folder="books")

    # ➤ 2. Prepare DB payload
    payload = {
        "book_title": book_title,
        "category_id": category_id,
        "category_title": category_title,
        "book_author": book_author,
        "BS_mail": BS_mail,
        "BS_ID": BS_ID,           # Not linked to user_id
        "book_detail": book_detail,
        "book_photo": photo_url,  # stored MinIO URL
        "book_count": book_count,
    }

    # ➤ 3. Insert into donation_books table
    return await DonationBookCRUD.create_request(db, payload)



@router.get("/status", response_model=List[DonationBookResponse])
async def get_donation_books_by_status(
    book_approve: str = Query(..., description="Filter by status: pending | accepted | rejected"),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch donation books filtered by book_approve status.
    """
    book_approve = book_approve.lower()
    if book_approve not in {"pending", "approved", "rejected"}:
        raise HTTPException(status_code=400, detail="Invalid status. Must be pending, accepted, or rejected.")

    return await DonationBookCRUD.get_by_status(db, book_approve)




# ➤ PATCH: admin approves donation (moves to books table)
@router.patch("/{d_book_id}/approve", response_model=DonationBookPublic)
async def approve_donation_book(
    d_book_id: int,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    return await DonationBookCRUD.approve_request(db, d_book_id)





# ➤ PATCH: admin approves donation (moves to books table)
@router.patch("/{d_book_id}/reject", response_model=DonationBookPublic)
async def approve_donation_book(
    d_book_id: int,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    return await DonationBookCRUD.approve_request(db, d_book_id)
