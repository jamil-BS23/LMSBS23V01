from operator import or_
from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete
from app.models.book import Book
from app.models.category import Category
from app.schemas.book import BookCreate, BookUpdate
from fastapi import HTTPException, status
from typing import Optional
from sqlalchemy import or_
from pydantic import HttpUrl
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy.exc import NoResultFound



class BookCRUD:

    @staticmethod
    async def get_book(db: AsyncSession, book_id: int):
        result = await db.execute(select(Book).where(Book.book_id == book_id))
        return result.scalar_one_or_none()


        
    @staticmethod
    async def get_books(db: AsyncSession, skip: int = 0, limit: int = 20, search: Optional[str] = None):
        """
        Return books with optional search. Searches title, author and details (case-insensitive).
        """
        stmt = select(Book)

        # normalize search: None if empty/only-spaces
        if search is not None:
            search = search.strip()
            if search == "":
                search = None

        if search:
            pattern = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Book.book_title.ilike(pattern),
                    Book.book_author.ilike(pattern),
                    Book.book_details.ilike(pattern)   
                )
            )

        stmt = stmt.offset(skip).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()

   

    @staticmethod
    async def create_book(db: AsyncSession, book_data: dict):
        # Ensure category exists
        category = await db.get(Category, book_data["book_category_id"])
        print("*******************************")
        print(category)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        db_book = Book(**book_data)
        db.add(db_book)
        await db.commit()
        await db.refresh(db_book)
        return db_book



    @staticmethod
    async def update_book(db: AsyncSession, book_id: int, book_update: BookUpdate) -> Book:
        # Fetch the existing book
        db_book = await db.get(Book, book_id)
        if not db_book:
            return None

        # Prepare update data
        update_data = book_update.dict(exclude_unset=True)
        if "book_id" in update_data:
            del update_data["book_id"]  # book_id is immutable

        # Set attributes safely
        for key, value in update_data.items():
            if value is not None:
                # Convert HttpUrl to str before saving to DB
                if hasattr(value, "scheme") and hasattr(value, "host"):
                    setattr(db_book, key, str(value))
                else:
                    setattr(db_book, key, value)

        # Commit changes
        db.add(db_book)
        await db.commit()
        await db.refresh(db_book)
        return db_book


    # @staticmethod
    # async def update_book(db: AsyncSession, book_id: int, book_update: BookUpdate):
    #     result = await db.execute(select(Book).where(Book.book_id == book_id))
    #     db_book = result.scalar_one_or_none()
    #     if not db_book:
    #         return None  # handle 404 in endpoint

    #     update_data = book_update.dict(exclude_unset=True)
    #     if "book_id" in update_data:
    #         del update_data["book_id"]

    #     for key, value in update_data.items():
    #         setattr(db_book, key, value)

    #     db.add(db_book)
    #     await db.commit()
    #     await db.refresh(db_book)
    #     return db_book


    # @staticmethod
    # async def delete_book(db: AsyncSession, db_book: Book):
    #     await db.delete(db_book)
    #     await db.commit()
    #     return True


    @staticmethod
    async def delete_book(db: AsyncSession, book_id: int) -> bool:
        result = await db.execute(select(Book).where(Book.book_id == book_id))
        db_book = result.scalars().first()

        if not db_book:
            return False

    
        await db.delete(db_book)
        await db.commit()
        return True
