

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from passlib.context import CryptContext
from fastapi import HTTPException, status

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCRUD:

    
    @staticmethod
    async def get(db: AsyncSession, user_id: int):
        return await db.get(User, user_id)

        
    @staticmethod
    async def count_users(db: AsyncSession) -> int:
        """
        Return total number of users (members) in the system.
        """
        result = await db.execute(select(func.count()).select_from(User))
        return result.scalar_one()


    @staticmethod
    async def get_user_by_name(db, user_name: str):
        result = await db.execute(select(User).where(User.user_name == user_name))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: int):
        result = await db.execute(select(User).where(User.user_id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str):
        result = await db.execute(select(User).where(User.user_email == email))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all_users(db: AsyncSession, skip: int = 0, limit: int = 20):
        result = await db.execute(select(User).offset(skip).limit(limit))
        return result.scalars().all()

    @staticmethod
    async def create_user(db: AsyncSession, user: UserCreate):
        hashed_password = pwd_context.hash(user.password)
        db_user = User(
            user_name=user.user_name,
            user_email=user.user_email,
            password=hashed_password,
            role=user.role,
            user_photo=user.user_photo
        )
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user

    @staticmethod
    async def update_user(db: AsyncSession, db_user: User, user_update: UserUpdate):
        update_data = user_update.dict(exclude_unset=True)
        if "password" in update_data:
            update_data["password"] = pwd_context.hash(update_data["password"])
        for key, value in update_data.items():
            setattr(db_user, key, value)
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user

    @staticmethod
    async def delete_user(db: AsyncSession, db_user: User):
        await db.delete(db_user)
        await db.commit()
        return True
