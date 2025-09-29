from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.user import UserCRUD
from app.dependencies import get_db
from app.schemas.user import UserOut, UserList
from typing import Dict


router = APIRouter(tags=["Users"])

@router.get("/", response_model=UserList)
async def get_users(skip: int = 0, limit: int = 20, db: AsyncSession = Depends(get_db)):
    users = await UserCRUD.get_all_users(db, skip=skip, limit=limit)
    return UserList(
        data=[UserOut.from_orm(u) for u in users],
        meta={"total": len(users), "skip": skip, "limit": limit}
    )


@router.get("/count", tags=["Users"])
async def count_users(db: AsyncSession = Depends(get_db)) -> Dict[str, int]:
    """
    Returns the total number of registered users (members).
    Example response: {"total_users": 100}
    """
    total = await UserCRUD.count_users(db)
    return {"count": total}




@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    user = await UserCRUD.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="USER_NOT_FOUND")
    return UserOut.from_orm(user)

@router.patch("/{user_id}", response_model=UserOut)
async def update_user(user_id: str, user_update: dict, db: AsyncSession = Depends(get_db)):
    user = await UserCRUD.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="USER_NOT_FOUND")
    updated_user = await UserCRUD.update_user(db, user, user_update)
    return UserOut.from_orm(updated_user)

@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db)):
    user = await UserCRUD.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="USER_NOT_FOUND")
    await UserCRUD.delete_user(db, user)
    return {"detail": "USER_DELETED"}
