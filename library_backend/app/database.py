


from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "postgresql+asyncpg://postgres:123456@localhost:5432/postgres"

engine = create_async_engine(DATABASE_URL, echo=True)

async_session = sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

# Dependency
async def get_db():
    async with async_session() as session:
        yield session





# from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
# from sqlalchemy.orm import sessionmaker, declarative_base
# from app.config import settings

# DATABASE_URL = settings.DATABASE_URL

# # Create async engine
# engine = create_async_engine(DATABASE_URL, echo=True, future=True)

# # Create async session factory
# async_session = sessionmaker(
#     bind=engine,
#     expire_on_commit=False,
#     class_=AsyncSession
# )

# # Base class for models
# Base = declarative_base()

# # Dependency to get DB session
# async def get_db():
#     async with async_session() as session:
#         yield session




# from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
# from sqlalchemy.orm import sessionmaker, declarative_base
# from app.config import settings

# DATABASE_URL = settings.DATABASE_URL

# engine = create_async_engine(DATABASE_URL, echo=True, future=True)

# async_session = sessionmaker(
#     bind=engine, expire_on_commit=False, class_=AsyncSession
# )

# Base = declarative_base()
