
from pydantic import BaseModel
from typing import Optional

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(BaseModel):
    category_title: str

class CategoryUpdate(BaseModel):
    category_title: str | None = None


class CategoryOut(BaseModel):
    category_id: int
    category_title: str

    class Config:
        orm_mode = True
        from_attributes = True 
