



from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import async_session
from app.crud.user import UserCRUD

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


def hash_password(password: str) -> str:
    """Hash a plaintext password."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against the hashed password."""
    return pwd_context.verify(plain_password.strip(), hashed_password.strip())


def create_access_token(user_id: str, role: str) -> str:
    """Create a JWT token for a user."""
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    payload = {"sub": user_id, "role": role, "exp": expire}
    # Use SECRET_KEY and ALGORITHM from config
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str):
    """Decode a JWT token and return the payload."""
    try:
        # Use SECRET_KEY and ALGORITHM from config
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None


async def get_db():
    """Yield an async SQLAlchemy session."""
    async with async_session() as session:
        yield session


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    """Get the current logged-in user from JWT token."""
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="INVALID_TOKEN")

    user_id = payload.get("sub")
    role = payload.get("role")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="INVALID_TOKEN")

    user = await UserCRUD.get(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="USER_NOT_FOUND")
    return user


async def get_current_admin(user=Depends(get_current_user)):
    """Ensure the current user is an admin."""
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="FORBIDDEN")
    return user





# from passlib.context import CryptContext
# from datetime import datetime, timedelta
# import jwt

# from fastapi import Depends, HTTPException, status
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from sqlalchemy.ext.asyncio import AsyncSession

# from app.config import settings
# from app.database import async_session
# from app.crud.user import UserCRUD

# # ---------------- Password & JWT Setup ---------------- #
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# security = HTTPBearer()


# def hash_password(password: str) -> str:
#     """Hash a plaintext password."""
#     return pwd_context.hash(password)


# def verify_password(plain_password: str, hashed_password: str) -> bool:
#     """Verify a plaintext password against the hashed password."""
#     return pwd_context.verify(plain_password.strip(), hashed_password.strip())


# def create_access_token(user_id: str, role: str) -> str:
#     """Create a JWT token for a user."""
#     expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
#     payload = {"sub": user_id, "role": role, "exp": expire}
#     return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


# def decode_access_token(token: str):
#     """Decode a JWT token and return the payload."""
#     try:
#         payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
#         return payload
#     except jwt.PyJWTError:
#         return None


# # ---------------- FastAPI Dependencies ---------------- #
# async def get_db():
#     """Yield an async SQLAlchemy session."""
#     async with async_session() as session:
#         yield session


# async def get_current_user(
#     credentials: HTTPAuthorizationCredentials = Depends(security),
#     db: AsyncSession = Depends(get_db),
# ):
#     """Get the current logged-in user from JWT token."""
#     token = credentials.credentials
#     payload = decode_access_token(token)
#     if not payload:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="INVALID_TOKEN")

#     user_id = payload.get("sub")
#     role = payload.get("role")
#     if not user_id:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="INVALID_TOKEN")

#     user = await UserCRUD.get(db, user_id)
#     if not user:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="USER_NOT_FOUND")
#     return user


# async def get_current_admin(user=Depends(get_current_user)):
#     """Ensure the current user is an admin."""
#     if user.role != "admin":
#         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="FORBIDDEN")
#     return user















# from passlib.context import CryptContext
# from datetime import datetime, timedelta
# import jwt

# from fastapi import Depends, HTTPException, status
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from sqlalchemy.ext.asyncio import AsyncSession

# from app.config import settings
# from app.database import async_session
# from app.crud.user import UserCRUD

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# security = HTTPBearer()


# def hash_password(password: str) -> str:
#     return pwd_context.hash(password)


# def verify_password(password: str, hashed: str) -> bool:

#     return pwd_context.verify(password, hashed)


# def create_access_token(user_id: str, role: str) -> str:
#     expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
#     payload = {"sub": str(user_id), "role": role, "exp": expire}
#     return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


# def decode_access_token(token: str):
#     try:
#         payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
#         return payload
#     except jwt.PyJWTError:
#         return None


# async def get_db():
#     async with async_session() as session:
#         yield session


# async def get_current_user(
#     credentials: HTTPAuthorizationCredentials = Depends(security),
#     db: AsyncSession = Depends(get_db),
# ):
#     token = credentials.credentials
#     payload = decode_access_token(token)
#     if not payload:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="INVALID_TOKEN")

#     user_id = payload.get("sub")
#     role = payload.get("role")
#     if not user_id:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="INVALID_TOKEN")

#     user = await UserCRUD.get(db, user_id)
#     if not user:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="USER_NOT_FOUND")
#     return user


# async def get_current_admin(user=Depends(get_current_user)):
#     if user.role != "admin":
#         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="FORBIDDEN")
#     return user








