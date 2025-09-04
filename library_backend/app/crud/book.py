from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete
from app.models.book import Book
from app.models.category import Category
from app.schemas.book import BookCreate, BookUpdate
from fastapi import HTTPException, status

class BookCRUD:

    @staticmethod
    async def get_book(db: AsyncSession, book_id: int):
        result = await db.execute(select(Book).where(Book.book_id == book_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_books(db: AsyncSession, skip: int = 0, limit: int = 20):
        result = await db.execute(select(Book).offset(skip).limit(limit))
        return result.scalars().all()

    @staticmethod
    async def create_book(db: AsyncSession, book: BookCreate):
        # Ensure category exists
        category = await db.get(Category, book.book_category_id)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        db_book = Book(**book.dict())
        db.add(db_book)
        await db.commit()
        await db.refresh(db_book)
        return db_book

    @staticmethod
    async def update_book(db: AsyncSession, db_book: Book, book_update: BookUpdate):
        update_data = book_update.dict(exclude_unset=True)
        if "book_id" in update_data:
            del update_data["book_id"]  # book_id immutable
        for key, value in update_data.items():
            setattr(db_book, key, value)
        db.add(db_book)
        await db.commit()
        await db.refresh(db_book)
        return db_book

    @staticmethod
    async def delete_book(db: AsyncSession, db_book: Book):
        # Optionally, check if the book is borrowed
        await db.delete(db_book)
        await db.commit()
        return True
