
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.dependencies import get_db, get_current_admin
from app.schemas.category import CategoryOut, CategoryUpdate
from app.crud.category import CategoryCRUD
from app.models.user import User
from app.core.exceptions import not_found_error, conflict_error

router = APIRouter(
    prefix="/books/category",
    tags=["Categories"]
)


@router.get("/all", response_model=List[CategoryOut])
async def list_categories(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    skip = (page - 1) * page_size
    categories = await CategoryCRUD.get_categories(db, skip=skip, limit=page_size)
    return categories


@router.patch("/{category_id}", response_model=CategoryOut)
async def update_category(
    category_id: int,
    category_update: CategoryUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    category = await CategoryCRUD.update_category(db, category_id, category_update)
    if not category:
        raise not_found_error("Category", category_id)
    return category


@router.delete("/{category_id}", status_code=204)
async def delete_category(
    category_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    success = await CategoryCRUD.delete_category(db, category_id)
    if not success:
        raise conflict_error("Category in use or not found")
    return None
