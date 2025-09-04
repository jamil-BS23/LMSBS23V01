from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db  # <- updated import
from app.core.security import decode_access_token

security = HTTPBearer()

# Get the currently logged-in user
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="INVALID_TOKEN")

    user_id = payload.get("sub")
    role = payload.get("role")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="INVALID_TOKEN")

    # Import UserCRUD here to avoid circular imports
    from app.crud.user import UserCRUD
    user = await UserCRUD.get(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="USER_NOT_FOUND")

    return user

# Get current admin (only users with role='admin' can pass)
async def get_current_admin(current_user=Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="FORBIDDEN")
    return current_user






# from fastapi import Depends, HTTPException, status
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from sqlalchemy.ext.asyncio import AsyncSession
# from app.database import async_session
# from app.core.security import decode_access_token

# security = HTTPBearer()

# # Database session dependency
# async def get_db():
#     async with async_session() as session:
#         yield session

# # Get the currently logged-in user
# async def get_current_user(
#     credentials: HTTPAuthorizationCredentials = Depends(security),
#     db: AsyncSession = Depends(get_db)
# ):
#     token = credentials.credentials
#     payload = decode_access_token(token)
#     if payload is None:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="INVALID_TOKEN")

#     user_id = payload.get("sub")
#     role = payload.get("role")
#     if not user_id:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="INVALID_TOKEN")

#     # Import UserCRUD here to avoid circular imports
#     from app.crud.user import UserCRUD
#     user = await UserCRUD.get(db, user_id)
#     if not user:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="USER_NOT_FOUND")

#     return user

# # Get current admin (only users with role='admin' can pass)
# async def get_current_admin(current_user=Depends(get_current_user)):
#     if current_user.role != "admin":
#         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="FORBIDDEN")
#     return current_user


# from fastapi import Depends, HTTPException, status
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from sqlalchemy.ext.asyncio import AsyncSession
# from app.database import async_session
# from app.core.security import decode_access_token

# security = HTTPBearer()

# async def get_db():
#     async with async_session() as session:
#         yield session

# async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: AsyncSession = Depends(get_db)):
#     token = credentials.credentials
#     payload = decode_access_token(token)
#     user_id = payload.get("sub")
#     role = payload.get("role")
#     if not user_id:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="INVALID_TOKEN")
#     from app.crud.user import UserCRUD
#     user = await UserCRUD.get(db, user_id)
#     if not user:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="USER_NOT_FOUND")
#     return user

# async def admin_required(user=Depends(get_current_user)):
#     if user.role != "admin":
#         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="FORBIDDEN")
#     return user




