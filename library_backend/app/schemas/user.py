
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserBase(BaseModel):
    user_name: str = Field(..., max_length=100)
    user_email: EmailStr
    user_photo: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    user_name: Optional[str] = None
    user_email: Optional[EmailStr] = None
    user_photo: Optional[str] = None
    password: Optional[str] = None

class UserOut(UserBase):
    user_id: str
    role: str

    # class Config:
    #     orm_mode = True

    model_config = {
        "from_attributes": True  
    }


class UserList(BaseModel):
    data: list[UserOut]
    meta: dict



