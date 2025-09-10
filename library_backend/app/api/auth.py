

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.user import UserCRUD
from app.dependencies import get_db
from app.core.security import verify_password, create_access_token

router = APIRouter()

class LoginRequest(BaseModel):
    user_name: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"

@router.post("/login", response_model=LoginResponse, tags=["Auth"])
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Fetch user by username
    user = await UserCRUD.get_user_by_name(db, payload.user_name)
    
    print(payload.password)
    print(user.password)
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="INVALID_CREDENTIALS: Incorrect username or password."
        )

    token = create_access_token(user_id=user.user_id, role=user.role)

    return {"access_token": token, "token_type": "Bearer"}


