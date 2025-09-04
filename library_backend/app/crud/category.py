from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.category import Category
from app.models.book import Book
from app.schemas.category import CategoryCreate, CategoryUpdate
from fastapi import HTTPException, status

class CategoryCRUD:

    @staticmethod
    async def get_category(db: AsyncSession, category_id: int):
        return await db.get(Category, category_id)

    @staticmethod
    async def get_categories(db: AsyncSession, skip: int = 0, limit: int = 20):
        result = await db.execute(select(Category).offset(skip).limit(limit))
        return result.scalars().all()

    @staticmethod
    async def create_category(db: AsyncSession, category: CategoryCreate):
        db_category = Category(**category.dict())
        db.add(db_category)
        await db.commit()
        await db.refresh(db_category)
        return db_category

    @staticmethod
    async def update_category(db: AsyncSession, db_category: Category, category_update: CategoryUpdate):
        update_data = category_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_category, key, value)
        db.add(db_category)
        await db.commit()
        await db.refresh(db_category)
        return db_category

    @staticmethod
    async def delete_category(db: AsyncSession, db_category: Category):
        # Check if any available books exist
        result = await db.execute(select(Book).where(Book.book_category_id == db_category.category_id, Book.book_availability == True))
        available_books = result.scalars().all()
        if available_books:
            raise HTTPException(status_code=409, detail="CATEGORY_IN_USE")
        await db.delete(db_category)
        await db.commit()
        return True
