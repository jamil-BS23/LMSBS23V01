from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.user import UserCRUD
from app.dependencies import get_db
from app.core.security import create_access_token
from typing import Optional, List


router = APIRouter(tags=["Admin"])

# Admin creates a new user
class CreateUserRequest(BaseModel):
    user_name: str
    user_email: EmailStr
    password: str
    user_photo: Optional[str] = None
    role: str = "user"

class CreateUserResponse(BaseModel):
    user_name: str
    user_email: EmailStr
    role: str

@router.post("/create-user", response_model=CreateUserResponse)
async def create_user(payload: CreateUserRequest, db: AsyncSession = Depends(get_db)):
    existing_user = await UserCRUD.get_user_by_id(db, payload.user_name)
    if existing_user:
        raise HTTPException(status_code=409, detail="USER_NAME_ALREADY_EXISTS")
    
    existing_email = await UserCRUD.get_user_by_email(db, payload.user_email)
    if existing_email:
        raise HTTPException(status_code=409, detail="EMAIL_ALREADY_EXISTS")
    
    user = await UserCRUD.create_user(db, payload)
    return CreateUserResponse(
        user_name=user.user_name,
        user_email=user.user_email,
        role=user.role
    )
