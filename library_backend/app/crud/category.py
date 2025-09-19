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
    async def update_category(db: AsyncSession, category_id: int, category_update: CategoryUpdate):

        print("CategoryUpdate :" ,CategoryUpdate)
        # Fetch category object first
        result = await db.execute(select(Category).where(Category.category_id == category_id))
        db_category = result.scalar_one_or_none()
        if not db_category:
            return None

        update_data = category_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_category, key, value)

        db.add(db_category)
        await db.commit()
        await db.refresh(db_category)
        print(db_category)
        return db_category

    @staticmethod
    async def delete_category(db: AsyncSession, category_id: int):
        # Fetch category object first
        result = await db.execute(select(Category).where(Category.category_id == category_id))
        db_category = result.scalar_one_or_none()
        if not db_category:
            return False

        # Check if any available books exist
        result_books = await db.execute(
            select(Book).where(Book.book_category_id == category_id, Book.book_availability == True)
        )
        available_books = result_books.scalars().all()
        if available_books:
            raise HTTPException(status_code=409, detail="CATEGORY_IN_USE")

        await db.delete(db_category)
        await db.commit()
        return True