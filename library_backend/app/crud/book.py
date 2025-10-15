from sqlalchemy import and_, extract, or_
from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy import update, delete
from app.models.book import Book
from app.models.category import Category
from app.schemas.book import BookCreate, BookUpdate
from app.models.user_rating import UserRating
from fastapi import HTTPException, status
from typing import Optional, List
from sqlalchemy import or_
from pydantic import HttpUrl
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy.exc import NoResultFound



class BookCRUD:


    # @staticmethod
    # async def get_books_by_rating(
    #     db: AsyncSession,
    #     skip: int = 0,
    #     limit: int = 20,
    #     min_rating: float = None,
    #     max_rating: float = None,
    #     created_month: int = None,
    #     created_year: int = None,
    #     search: Optional[str] = None
    # ):
    #     stmt = select(Book)

    #     # Rating filter
    #     if min_rating is not None:
    #         stmt = stmt.where(Book.book_rating >= min_rating)
    #     if max_rating is not None:
    #         stmt = stmt.where(Book.book_rating <= max_rating)

    #     # Created month filter
    #     if created_month is not None:
    #         stmt = stmt.where(extract("month", Book.created_at) == created_month)
    #     if created_year is not None:
    #         stmt = stmt.where(extract("year", Book.created_at) == created_year)

    #     # Search filter
    #     if search:
    #         search = search.strip()
    #         if search:
    #             pattern = f"%{search}%"
    #             stmt = stmt.where(
    #                 or_(
    #                     Book.book_title.ilike(pattern),
    #                     Book.book_author.ilike(pattern),
    #                     Book.book_details.ilike(pattern)
    #                 )
    #             )

    #     stmt = stmt.offset(skip).limit(limit)
    #     result = await db.execute(stmt)
    #     return result.scalars().all()

    # @staticmethod
    # async def get_books(
    #     db: AsyncSession,
    #     skip: int = 0,
    #     limit: int = 20,
    #     min_rating: float = None,
    #     max_rating: float = None,
    #     created_month: int = None,
    #     created_year: int = None,
    #     search: Optional[str] = None
    # ):
    #     stmt = select(Book)

    #     # Rating filter
    #     if min_rating is not None:
    #         stmt = stmt.where(Book.book_rating >= min_rating)
    #     if max_rating is not None:
    #         stmt = stmt.where(Book.book_rating <= max_rating)

    #     # Created month filter
    #     if created_month is not None:
    #         stmt = stmt.where(extract("month", Book.created_at) == created_month)
    #     if created_year is not None:
    #         stmt = stmt.where(extract("year", Book.created_at) == created_year)

    #     # Search filter
    #     if search:
    #         search = search.strip()
    #         if search:
    #             pattern = f"%{search}%"
    #             stmt = stmt.where(
    #                 or_(
    #                     Book.book_title.ilike(pattern),
    #                     Book.book_author.ilike(pattern),
    #                     Book.book_details.ilike(pattern)
    #                 )
    #             )

    #     stmt = stmt.offset(skip).limit(limit)
    #     result = await db.execute(stmt)
    #     return result.scalars().all()



    # @staticmethod
    # async def get_book(db: AsyncSession, book_id: int):
    #     result = await db.execute(select(Book).where(Book.book_id == book_id))
    #     return result.scalar_one_or_none()


    @staticmethod
    async def get_book(db: AsyncSession, book_id: int):
        result = await db.execute(
            select(Book, Category.category_title)
            .join(Category, Category.category_id == Book.book_category_id)
            .where(Book.book_id == book_id)
        )
        row = result.first()
        if not row:
            return None
        
        book, category_title = row
        # Attach category_title to the book object
        book.category_title = category_title
        return book




    @staticmethod
    async def get_books(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None
    ):
        """
        Return books with optional search. Each book will also include its category_title.
        Searches title, author, and details (case-insensitive).
        """
        stmt = (
            select(Book, Category.category_title)
            .join(Category, Category.category_id == Book.book_category_id)
        )

    # Normalize search: None if empty or only spaces
        if search is not None:
            search = search.strip()
            if search == "":
                search = None

    # Apply search condition
        if search:
            pattern = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Book.book_title.ilike(pattern),
                    Book.book_author.ilike(pattern),
                    Book.book_details.ilike(pattern),
                )
            )

    # Add pagination
        stmt = stmt.offset(skip).limit(limit)

    # Execute query
        result = await db.execute(stmt)
        rows = result.all()

    # Transform results: attach category_title to each book
        books = []
        for book, category_title in rows:
            book.category_title = category_title
            books.append(book)

        return books

        
    # @staticmethod
    # async def get_books(db: AsyncSession, skip: int = 0, limit: int = 20, search: Optional[str] = None):
    #     """
    #     Return books with optional search. Searches title, author and details (case-insensitive).
    #     """
    #     stmt = select(Book)

    #     # normalize search: None if empty/only-spaces
    #     if search is not None:
    #         search = search.strip()
    #         if search == "":
    #             search = None

    #     if search:
    #         pattern = f"%{search}%"
    #         stmt = stmt.where(
    #             or_(
    #                 Book.book_title.ilike(pattern),
    #                 Book.book_author.ilike(pattern),
    #                 Book.book_details.ilike(pattern)   
    #             )
    #         )

    #     stmt = stmt.offset(skip).limit(limit)
    #     result = await db.execute(stmt)
    #     return result.scalars().all()

             



    @staticmethod
    async def count_books(db: AsyncSession) -> int:
        """
        Return total number of books in the library.
        """
        result = await db.execute(select(func.count()).select_from(Book))
        return result.scalar_one()

   

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




    @staticmethod
    async def user_already_rated(db: AsyncSession, user_id: int, book_id: int) -> bool:
        query = select(UserRating).where(
            UserRating.user_id == user_id,
            UserRating.book_id == book_id
        )
        result = await db.execute(query)
        return result.scalars().first() is not None



    @staticmethod
    async def rate_book(db: AsyncSession, book_id: int, user_id: int, rating: float):
        # Fetch book
        db_book = await db.get(Book, book_id)
        if not db_book:
            return None

        # Add user rating record
        user_rating = UserRating(user_id=user_id, book_id=book_id, rating=rating)
        db.add(user_rating)
        await db.flush()

        # Recalculate average rating for that book
        avg_query = select(func.avg(UserRating.rating)).where(UserRating.book_id == book_id)
        avg_result = await db.execute(avg_query)
        avg_rating = avg_result.scalar() or 0.0

        db_book.book_rating = round(avg_rating, 1)
        db.add(db_book)
        await db.commit()
        await db.refresh(db_book)
        return db_book





    @staticmethod
    async def get_books_by_category(db: AsyncSession, category_id: int, skip: int = 0, limit: int = 20):
        result = await db.execute(
            select(Book, Category.category_title)
            .join(Category, Category.category_id == Book.book_category_id)
            .where(Book.book_category_id == category_id)
            .offset(skip)
            .limit(limit)
        )
        rows = result.all()
        books = []
        for book, category_title in rows:
            book.category_title = category_title
            books.append(book)
        return books





    @staticmethod
    async def get_featured_books(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None
    ) -> List[Book]:
        """
        Return featured books with optional search.
        """
        stmt = (
            select(Book, Category.category_title)
            .join(Category, Category.category_id == Book.book_category_id)
            .where(Book.featured == True)  # only featured books
        )

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
                    Book.book_details.ilike(pattern),
                )
            )

        stmt = stmt.offset(skip).limit(limit)

        
        result = await db.execute(stmt)
        rows = result.all()

        books = []
        for book, category_title in rows:
            book.category_title = category_title
            books.append(book)

        return books