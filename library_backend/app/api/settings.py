from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_admin
from app.schemas.settings import BorrowDayLimit, BorrowBookLimit, BorrowDayExtensionLimit
from app.crud.settings import SettingsCRUD
from app.models.user import User

router = APIRouter(
    prefix="/admin/settings",
    tags=["Settings"]
)


@router.get("/borrow_day_lim", response_model=BorrowDayLimit)
async def get_borrow_day_limit(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    return await SettingsCRUD.get_borrow_day_limit(db)


@router.post("/borrow_day_lim", response_model=BorrowDayLimit)
async def set_borrow_day_limit(
    data: BorrowDayLimit,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    return await SettingsCRUD.set_borrow_day_limit(db, data.borrow_day_lim)


@router.get("/borrow_day_ext_lim", response_model=BorrowDayExtensionLimit)
async def get_borrow_day_ext_limit(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    return await SettingsCRUD.get_borrow_day_ext_limit(db)


@router.post("/borrow_day_ext_lim", response_model=BorrowDayExtensionLimit)
async def set_borrow_day_ext_limit(
    data: BorrowDayExtensionLimit,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    return await SettingsCRUD.set_borrow_day_ext_limit(db, data.borrow_day_ext_lim)


@router.get("/borrow_book_lim", response_model=BorrowBookLimit)
async def get_borrow_book_limit(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    return await SettingsCRUD.get_borrow_book_limit(db)


@router.post("/borrow_book_lim", response_model=BorrowBookLimit)
async def set_borrow_book_limit(
    data: BorrowBookLimit,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    return await SettingsCRUD.set_borrow_book_limit(db, data.borrow_book_lim)
