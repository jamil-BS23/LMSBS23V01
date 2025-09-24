


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies import get_db, get_current_admin
from app.models.user import User
from app.models.settings import Settings
from app.schemas.settings import SettingsResponse, SettingsUpdate

router = APIRouter(
    prefix="/settings",
    tags=["Settings"]
)

# ------------------- Admin Routes (Protected) -------------------

@router.get("/admin", response_model=SettingsResponse)
async def get_settings_admin(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Settings).limit(1))
    setting = result.scalars().first()
    if not setting:
        raise HTTPException(status_code=404, detail="Settings not found")
    return setting


@router.post("/admin", response_model=SettingsResponse)
async def update_settings_admin(
    data: SettingsUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Settings).limit(1))
    setting = result.scalars().first()
    if not setting:
        raise HTTPException(status_code=404, detail="Settings not found")

    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(setting, key, value)

    db.add(setting)
    await db.commit()
    await db.refresh(setting)
    return setting


# ------------------- Public Routes (Read-Only) -------------------

@router.get("/public", response_model=SettingsResponse, tags=["Public Settings"])
async def get_public_settings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Settings).limit(1))
    setting = result.scalars().first()
    if not setting:
        raise HTTPException(status_code=404, detail="Settings not found")
    return setting




















# from fastapi import APIRouter, Depends
# from sqlalchemy.ext.asyncio import AsyncSession

# from app.dependencies import get_db, get_current_admin
# from app.schemas.settings import SettingsBase, 
# from app.crud.settings import SettingsCRUD
# from app.models.user import User

# router = APIRouter(
#     prefix="/admin/settings",
#     tags=["Settings"]
# )


# @router.get("/borrow_day_lim", response_model=BorrowDayLimit)
# async def get_borrow_day_limit(
#     admin: User = Depends(get_current_admin),
#     db: AsyncSession = Depends(get_db)
# ):
#     return await SettingsCRUD.get_borrow_day_limit(db)


# @router.post("/borrow_day_lim", response_model=BorrowDayLimit)
# async def set_borrow_day_limit(
#     data: BorrowDayLimit,
#     admin: User = Depends(get_current_admin),
#     db: AsyncSession = Depends(get_db)
# ):
#     return await SettingsCRUD.set_borrow_day_limit(db, data.borrow_day_lim)


# @router.get("/borrow_day_ext_lim", response_model=BorrowDayExtensionLimit)
# async def get_borrow_day_ext_limit(
#     admin: User = Depends(get_current_admin),
#     db: AsyncSession = Depends(get_db)
# ):
#     return await SettingsCRUD.get_borrow_day_ext_limit(db)


# @router.post("/borrow_day_ext_lim", response_model=BorrowDayExtensionLimit)
# async def set_borrow_day_ext_limit(
#     data: BorrowDayExtensionLimit,
#     admin: User = Depends(get_current_admin),
#     db: AsyncSession = Depends(get_db)
# ):
#     return await SettingsCRUD.set_borrow_day_ext_limit(db, data.borrow_day_ext_lim)


# @router.get("/borrow_book_lim", response_model=BorrowBookLimit)
# async def get_borrow_book_limit(
#     admin: User = Depends(get_current_admin),
#     db: AsyncSession = Depends(get_db)
# ):
#     return await SettingsCRUD.get_borrow_book_limit(db)


# @router.post("/borrow_book_lim", response_model=BorrowBookLimit)
# async def set_borrow_book_limit(
#     data: BorrowBookLimit,
#     admin: User = Depends(get_current_admin),
#     db: AsyncSession = Depends(get_db)
# ):
#     return await SettingsCRUD.set_borrow_book_limit(db, data.borrow_book_lim)
