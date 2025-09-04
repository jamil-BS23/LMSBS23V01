

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.user import UserCRUD
from app.dependencies import get_db
from app.core.security import verify_password, create_access_token

router = APIRouter()

# ---------------- Pydantic Schemas ---------------- #
class LoginRequest(BaseModel):
    user_name: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"

# ---------------- Login Endpoint ---------------- #
@router.post("/login", response_model=LoginResponse, tags=["Auth"])
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Fetch user by username
    user = await UserCRUD.get_user_by_name(db, payload.user_name)
    
    # Verify user exists and password matches
    print(payload.password)
    print(user.password)
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="INVALID_CREDENTIALS: Incorrect username or password."
        )

    # Create JWT token
    token = create_access_token(user_id=user.user_id, role=user.role)

    return {"access_token": token, "token_type": "Bearer"}




# from fastapi import APIRouter, Depends, HTTPException, status
# from pydantic import BaseModel
# from sqlalchemy.ext.asyncio import AsyncSession
# from app.crud.user import UserCRUD
# from app.dependencies import get_db
# from app.core.security import verify_password, create_access_token
# from app.config import settings

# router = APIRouter()

# # Login request using user_name and password
# class LoginRequest(BaseModel):
#     user_name: str
#     password: str

# class LoginResponse(BaseModel):
#     access_token: str
#     token_type: str = "Bearer"

# @router.post("/login", response_model=LoginResponse, tags=["Auth"])
# async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
#     # 🔹 Fetch user by username
#     user = await UserCRUD.get_user_by_name(db, payload.user_name)

#     # 🔹 The core logic for verification is here.
#     #    The 'verify_password' function compares the plaintext password from the request
#     #    against the hashed password from the database.
#     #    If the user doesn't exist OR the passwords don't match, an HTTPException is raised.
#     if not user or not verify_password(payload.password, user.password):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="INVALID_CREDENTIALS: Incorrect username or password."
#         )

#     # 🔹 Create JWT token with user_id & role
#     token = create_access_token(
#         user_id=user.user_id,
#         role=user.role,
#         secret_key=settings.SECRET_KEY
#     )

#     return {"access_token": token, "token_type": "Bearer"}



# from fastapi import APIRouter, Depends, HTTPException, status
# from pydantic import BaseModel
# from sqlalchemy.ext.asyncio import AsyncSession
# from app.crud.user import UserCRUD
# from app.dependencies import get_db
# from app.core.security import verify_password, create_access_token
# from app.config import settings  # make sure settings is imported

# router = APIRouter()

# # Login request using user_name and password
# class LoginRequest(BaseModel):
#     user_name: str
#     password: str

# class LoginResponse(BaseModel):
#     access_token: str
#     token_type: str = "Bearer"

# @router.post("/login", response_model=LoginResponse, tags=["Auth"])
# async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
#     # 🔹 fetch user by username instead of user_id
#     user = await UserCRUD.get_user_by_name(db, payload.user_name)
#     print(user.password)
#     print(payload.password)
#     if not user or not verify_password(payload.password, user.password):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="INVALID_CREDENTIALS"
#         )

#     # 🔹 create JWT token with user_id & role
#     token = create_access_token(
#         user_id=user.user_id,
#         role=user.role,
#         secret_key=settings.SECRET_KEY
#     )

#     return {"access_token": token, "token_type": "Bearer"}







# from fastapi import APIRouter, Depends, HTTPException, status
# from pydantic import BaseModel
# from sqlalchemy.ext.asyncio import AsyncSession
# from app.crud.user import UserCRUD
# from app.dependencies import get_db
# from app.core.security import verify_password, create_access_token

# router = APIRouter()

# # Login request using user_id and password
# class LoginRequest(BaseModel):
#     user_id: str
#     password: str

# class LoginResponse(BaseModel):
#     access_token: str
#     token_type: str = "Bearer"

# @router.post("/login", response_model=LoginResponse, tags=["Auth"])
# async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
#     user = await UserCRUD.get_user_by_id(db, payload.user_id)
#     if not user or not verify_password(payload.password, user.password):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="INVALID_CREDENTIALS"
#         )
#     #token = create_access_token(user_id=user.user_id, role=user.role)
#     token = create_access_token(user_id=user.user_id, role=user.role, secret_key=settings.SECRET_KEY)

#     return {"access_token": token}
