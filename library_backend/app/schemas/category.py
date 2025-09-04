
from pydantic import BaseModel
from typing import Optional

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class CategoryOut(CategoryBase):
    id: int

    class Config:
        orm_mode = True





# from pydantic import BaseModel, Field
# from typing import Optional


# class CategoryBase(BaseModel):
#     category_title: str


# class CategoryCreate(CategoryBase):
#     pass


# class CategoryUpdate(BaseModel):
#     category_title: Optional[str]


# class Category(CategoryBase):
#     category_id: int

#     class Config:
#         orm_mode = True
