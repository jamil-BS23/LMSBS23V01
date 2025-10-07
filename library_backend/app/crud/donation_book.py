from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from app.models.donation_book import DonationBook
from app.models.book import Book
from app.models.category import Category

class DonationBookCRUD:


    @staticmethod
    async def get_all(db: AsyncSession):
        result = await db.execute(select(DonationBook))
        return result.scalars().all()



    @staticmethod
    async def create_request(db: AsyncSession, data: dict):
        # ensure category exists
        category = await db.get(Category, data["category_id"])
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        db_obj = DonationBook(**data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj


    @staticmethod
    async def get_by_status(db: AsyncSession, status: str):
        result = await db.execute(select(DonationBook).where(DonationBook.book_approve == status))
        return result.scalars().all()

    @staticmethod
    async def approve_request(db: AsyncSession, d_book_id: int):
        result = await db.execute(select(DonationBook).where(DonationBook.d_book_id == d_book_id))
        donation = result.scalar_one_or_none()
        if not donation:
            raise HTTPException(status_code=404, detail="Donation request not found")

        if donation.book_approve == "approved":
            raise HTTPException(status_code=400, detail="Already approved")

        donation.book_approve = "approved"

        # Insert into books table
        new_book = Book(
            book_title=donation.book_title,
            book_author=donation.book_author,
            book_category_id=donation.category_id,
            book_photo=donation.book_photo,
            book_pdf=donation.book_pdf,
            book_audio=donation.book_audio,
            book_details=donation.book_detail,
            book_count=donation.book_count,
        )
        db.add(new_book)
        await db.commit()
        await db.refresh(donation)
        return donation




    @staticmethod
    async def reject_request(db: AsyncSession, d_book_id: int):
        result = await db.execute(select(DonationBook).where(DonationBook.d_book_id == d_book_id))
        donation = result.scalar_one_or_none()
        if not donation:
            raise HTTPException(status_code=404, detail="Donation request not found")

        if donation.book_approve == "rejected":
            raise HTTPException(status_code=400, detail="Already rejected")

        donation.book_approve = "rejected"

        # Insert into books table
        new_book = Book(
            book_title=donation.book_title,
            book_author=donation.book_author,
            book_category_id=donation.category_id,
            book_photo=donation.book_photo,
            book_pdf=donation.book_pdf,
            book_audio=donation.book_audio,
            book_details=donation.book_detail,
            book_count=donation.book_count,
        )
        db.add(new_book)
        await db.commit()
        await db.refresh(donation)
        return donation

