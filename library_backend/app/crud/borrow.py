from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import NoResultFound
from app.models.borrow import BorrowRecord
from app.models.book import Book
from app.models.user import User
from app.schemas.borrow import BorrowCreate, BorrowStatusUpdate, BorrowDetailResponse
from fastapi import HTTPException, status
from datetime import date, timedelta
from app.crud.settings import SettingsCRUD  
from sqlalchemy import func



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
    async def count_by_borrow_status(db: AsyncSession, status: str) -> int:
        """
        Count number of borrows by borrow_status.
        """
        result = await db.execute(
            select(func.count()).select_from(BorrowRecord).where(BorrowRecord.borrow_status == status)
        )
        return result.scalar_one()




    @staticmethod
    async def create_borrow(db: AsyncSession, borrow: BorrowCreate, user: User):
        # Get book
        book = await db.get(Book, borrow.book_id)
        if not book:
            raise HTTPException(status_code=404, detail="BOOK_NOT_FOUND")

        # Validate availability
        if not book.book_availability:
            raise HTTPException(status_code=409, detail="BOOK_UNAVAILABLE")

        borrow_day_limit = await SettingsCRUD.get_borrow_day_limit(db)
        borrow_day_limit = borrow_day_limit if borrow_day_limit is not None else 14

        # Borrow/Return dates auto-set
        borrow_date = date.today()
        return_date = borrow_date + timedelta(days=borrow_day_limit)

        # Create borrow record
        db_borrow = BorrowRecord(
            user_id=user.user_id,
            #user_name=user.user_name,   
            book_id=book.book_id,
            #book_title=book.book_title,      
            borrow_date=borrow_date,
            return_date=return_date,
            borrow_status="borrowed",
            request_status="pending",
        )

        print("all info: ", db_borrow)
      
        db.add(db_borrow)

# --- Update book availability based on count ---
# Decrease the count of available copies
        if book.book_count is not None and book.book_count > 0:
            book.book_count -= 1

# If no copies left, mark as unavailable
        if book.book_count == 0:
            book.book_availability = False
        else:
            book.book_availability = True  # remains available if count > 0

        db.add(book)

        await db.commit()
        await db.refresh(db_borrow)
        return db_borrow



    @staticmethod
    async def list_by_borrow_status(db: AsyncSession, status: str):
        """
        Get detailed list of borrows filtered by borrow_status.
        """
        result = await db.execute(
            select(BorrowRecord).where(BorrowRecord.borrow_status == status)
        )
        borrows = result.scalars().all()


        for borrow in borrows:
            book = await db.get(Book, borrow.book_id)
            borrow.book_title = book.book_title if book else None

            user = await db.get(User, borrow.user_id)
            borrow.user_name = user.user_name if user else None

        return borrows






    @staticmethod
    async def list_by_request_status(db: AsyncSession, status: str):
        """
        Get detailed list of borrows filtered by request_status.
        """
        result = await db.execute(
            select(BorrowRecord).where(BorrowRecord.request_status == status)
        )
        borrows = result.scalars().all()


        for borrow in borrows:
            book = await db.get(Book, borrow.book_id)
            borrow.book_title = book.book_title if book else None

            user = await db.get(User, borrow.user_id)
            borrow.user_name = user.user_name if user else None

        return borrows




    @staticmethod
    async def get_all_borrows_admin(db: AsyncSession):
        """
        Admin: Get all borrow records for all users with book & user details.
        """
        result = await db.execute(select(BorrowRecord))
        borrows = result.scalars().all()

        for borrow in borrows:
            book = await db.get(Book, borrow.book_id)
            borrow.book_title = book.book_title if book else None

            user = await db.get(User, borrow.user_id)
            borrow.user_name = user.user_name if user else None

        return borrows







    @staticmethod
    async def get_my_borrow(db: AsyncSession, user_id: str):
        """
        Get all borrow records for a specific user with book/user details.
        """
        result = await db.execute(
            select(BorrowRecord).where(BorrowRecord.user_id == user_id)
        )
        borrows = result.scalars().all()

        for borrow in borrows:
            book = await db.get(Book, borrow.book_id)
            borrow.book_title = book.book_title if book else None

            user = await db.get(User, borrow.user_id)
            borrow.user_name = user.user_name if user else None

        return borrows



    
    @staticmethod
    async def count_my_borrow_status(db: AsyncSession, user_id: str, status: str) -> int:
        """
        Count borrows for a specific user filtered by borrow_status.
        Async-safe ORM query using select().
        """
        result = await db.execute(
            select(func.count()).select_from(BorrowRecord).where(
                BorrowRecord.user_id == user_id,
                BorrowRecord.borrow_status == status
            )
        )
        return result.scalar_one()





    @staticmethod
    async def count_by_request_status(db: AsyncSession, status: str) -> int:
        """
        Count number of borrows by request_status.
        """
        result = await db.execute(
            select(func.count()).select_from(BorrowRecord).where(BorrowRecord.request_status == status)
        )
        return result.scalar_one()







    @staticmethod
    async def update_borrow_status(db: AsyncSession, borrow_id: int, status: str):


        db_borrow = await db.get(BorrowRecord, borrow_id)
        if not db_borrow:
            raise HTTPException(status_code=404, detail="BORROW_NOT_FOUND")

        # Update status
        db_borrow.borrow_status = status

        # If returned, make book available and increment count
        if status == "returned":
            book = await db.get(Book, db_borrow.book_id)
            if book:
                book.book_availability = True
                book.book_count = (book.book_count or 0) + 1
                db.add(book)

        db.add(db_borrow)
        await db.commit()
        await db.refresh(db_borrow)

    # Fetch related user and book for response
        user = await db.get(User, db_borrow.user_id)
        book = await db.get(Book, db_borrow.book_id)

        return BorrowDetailResponse(
            borrow_id=db_borrow.borrow_id,
            user_id=db_borrow.user_id,
            user_name=user.user_name if user else None,
            book_id=db_borrow.book_id,
            book_title=book.book_title if book else None,
            borrow_date=db_borrow.borrow_date,
            return_date=db_borrow.return_date,
            borrow_status=db_borrow.borrow_status,
            request_status=db_borrow.request_status,
        )
    





    @staticmethod
    async def update_borrow_request_status(db: AsyncSession, borrow_id: int, status: str):


        db_borrow = await db.get(BorrowRecord, borrow_id)
        if not db_borrow:
            raise HTTPException(status_code=404, detail="BORROW_NOT_FOUND")

        # Update status
        db_borrow.request_status = status

        # If returned, make book available and increment count
        if status == "accepted":
            book = await db.get(Book, db_borrow.book_id)
            if book:
                book.book_availability = True
                book.book_count = (book.book_count or 0) - 1
                db.add(book)

        db.add(db_borrow)
        await db.commit()
        await db.refresh(db_borrow)

    # Fetch related user and book for response
        user = await db.get(User, db_borrow.user_id)
        book = await db.get(Book, db_borrow.book_id)

        return BorrowDetailResponse(
            borrow_id=db_borrow.borrow_id,
            user_id=db_borrow.user_id,
            user_name=user.user_name if user else None,
            book_id=db_borrow.book_id,
            book_title=book.book_title if book else None,
            borrow_date=db_borrow.borrow_date,
            return_date=db_borrow.return_date,
            borrow_status=db_borrow.borrow_status,
            request_status=db_borrow.request_status,
        )








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


           
    @staticmethod
    async def list_my_borrow_status(db: AsyncSession, status: str, user_id: str = None):
    
        query = select(BorrowRecord).where(BorrowRecord.borrow_status == status)

        if user_id:
            query = query.where(BorrowRecord.user_id == user_id)

        result = await db.execute(query)
        borrows = result.scalars().all()

    # Add book_title and user_name
        for borrow in borrows:
            book = await db.get(Book, borrow.book_id)
            borrow.book_title = book.book_title if book else None

            user = await db.get(User, borrow.user_id)
            borrow.user_name = user.user_name if user else None

        return borrows



    @staticmethod
    async def count_my_request_status(db: AsyncSession, status: str, user_id: str = None) -> int:
  
        query = select(func.count()).select_from(BorrowRecord).where(BorrowRecord.request_status == status)

        if user_id:
            query = query.where(BorrowRecord.user_id == user_id)

        result = await db.execute(query)
        return result.scalar_one()



    @staticmethod
    async def list_my_request_status(db: AsyncSession, status: str, user_id: str = None):
    
        query = select(BorrowRecord).where(BorrowRecord.request_status == status)

        if user_id:
            query = query.where(BorrowRecord.user_id == user_id)

        result = await db.execute(query)
        borrows = result.scalars().all()

        for borrow in borrows:
            book = await db.get(Book, borrow.book_id)
            borrow.book_title = book.book_title if book else None

            user = await db.get(User, borrow.user_id)
            borrow.user_name = user.user_name if user else None

        return borrows
















