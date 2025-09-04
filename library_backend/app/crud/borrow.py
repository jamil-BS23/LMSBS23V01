from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import NoResultFound
from app.models.borrow import BorrowRecord
from app.models.book import Book
from app.models.user import User
from app.schemas.borrow import BorrowCreate, BorrowStatusUpdate
from fastapi import HTTPException, status
from datetime import date


class BorrowCRUD:

    @staticmethod
    async def get_borrow(db: AsyncSession, borrow_id: int) -> BorrowRecord:
        borrow = await db.get(BorrowRecord, borrow_id)
        if not borrow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="BORROW_RECORD_NOT_FOUND"
            )
        return borrow

    @staticmethod
    async def get_all_borrows(db: AsyncSession, skip: int = 0, limit: int = 20):
        result = await db.execute(
            select(BorrowRecord).offset(skip).limit(limit)
        )
        return result.scalars().all()

    @staticmethod
    async def create_borrow(db: AsyncSession, borrow: BorrowCreate, book: Book, user: User):
        # Validate book availability
        if not book.book_availability:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="BOOK_UNAVAILABLE"
            )

        # Validate borrow dates
        if borrow.borrow_date > borrow.return_date:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="INVALID_DATE_RANGE"
            )

        # Check active borrows of user
        result = await db.execute(
            select(BorrowRecord).where(
                BorrowRecord.user_id == user.user_id,
                BorrowRecord.borrow_status == "borrowed"
            )
        )
        active_borrows = result.scalars().all()

        # Uncomment and adjust when you add admin settings for max borrow limit
        # if len(active_borrows) >= borrow_max_limit:
        #     raise HTTPException(
        #         status_code=status.HTTP_409_CONFLICT,
        #         detail="BORROW_LIMIT_REACHED"
        #     )

        # Create borrow record
        db_borrow = BorrowRecord(
            user_id=user.user_id,
            book_id=book.book_id,
            borrow_date=borrow.borrow_date,
            return_date=borrow.return_date,
            borrow_status="borrowed",
            request_status="pending",  # auto-approved if book is available
        )
        db.add(db_borrow)

        # Update book availability to false
        book.book_availability = False
        db.add(book)

        await db.commit()
        await db.refresh(db_borrow)
        return db_borrow

    @staticmethod
    async def update_borrow_status(db: AsyncSession, db_borrow: BorrowRecord, status_update: BorrowStatusUpdate):
        if status_update.borrow_status:
            db_borrow.borrow_status = status_update.borrow_status

            # If returned, make book available again
            if status_update.borrow_status == "returned":
                book = await db.get(Book, db_borrow.book_id)
                if book:
                    book.book_availability = True
                    db.add(book)

        if status_update.request_status:
            db_borrow.request_status = status_update.request_status

        db.add(db_borrow)
        await db.commit()
        await db.refresh(db_borrow)
        return db_borrow

    @staticmethod
    async def delete_borrow(db: AsyncSession, db_borrow: BorrowRecord):
        # If deleting an active borrow, free the book
        if db_borrow.borrow_status == "borrowed":
            book = await db.get(Book, db_borrow.book_id)
            if book:
                book.book_availability = True
                db.add(book)

        await db.delete(db_borrow)
        await db.commit()
        return True
