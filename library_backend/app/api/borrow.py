


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession


from app import models, crud
from app.crud.borrow import BorrowCRUD

from app.schemas.borrow import (
    BorrowRecord,
    BorrowCreate,
    BorrowStatusUpdate,
    BorrowListResponse,
    BorrowCountResponse,
    BorrowDetailResponse,
    BorrowRequestRecord,
)



from app.core.security import get_current_user
from app.database import get_db


router = APIRouter()


get_current_active_user = get_current_user




@router.get("/borrow/", response_model=List[BorrowDetailResponse])
async def get_all_borrowed_books(
    db: AsyncSession = Depends(get_db),
    current_user: models.user.User = Depends(get_current_active_user),
):
    """
    Admin: Get all users' borrow requests with book and user details.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    return await BorrowCRUD.get_all_borrows_admin(db)





@router.post("/borrow/", response_model=BorrowRecord)
async def borrow_book(
    borrow: BorrowCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.user.User = Depends(get_current_active_user),
):
   
    #return await crud.borrow.create_borrow(db=db, borrow=borrow, user=current_user)
    return await BorrowCRUD.create_borrow(db=db, borrow=borrow, user=current_user)





@router.get("/borrow/my", response_model=List[BorrowDetailResponse])
async def get_my_borrowed_books(
    db: AsyncSession = Depends(get_db),
    current_user: models.user.User = Depends(get_current_active_user),
):
    """
    User can see only their own borrow requests with book and user details.
    """
    return await BorrowCRUD.get_my_borrow(db, user_id=current_user.user_id)



@router.patch("/borrow/{borrow_id}/status", response_model=BorrowDetailResponse)
async def update_borrow_status(
    borrow_id: int,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.user.User = Depends(get_current_active_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    return await BorrowCRUD.update_borrow_status(db, borrow_id, status)



@router.patch("/borrow/{borrow_id}/request", response_model=BorrowDetailResponse)
async def update_request_status(
    borrow_id: int,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.user.User = Depends(get_current_active_user),
):
    


    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    return await BorrowCRUD.update_borrow_request_status(db, borrow_id, status)





@router.get("/borrow/status/{status}/count", response_model=BorrowCountResponse)
async def get_borrow_status_count(
    status: str, db: AsyncSession = Depends(get_db), current_user: models.user.User = Depends(get_current_active_user)
):
   
    if current_user.role == "user":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    count = await BorrowCRUD.count_by_borrow_status(db, status=status)
    return {"count": count}



@router.get("/borrow/status/{status}/list", response_model=List[BorrowRequestRecord])
async def get_borrow_status_list(
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.user.User = Depends(get_current_active_user)
):
    

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    result = await BorrowCRUD.list_by_borrow_status(db, status=status)
    print("result :", result)
    return result





@router.get("/borrow/request/{status}/count", response_model=BorrowCountResponse)
async def get_request_status_count(
    status: str, db: AsyncSession = Depends(get_db), current_user: models.user.User = Depends(get_current_active_user)
):
    


    if current_user.role == "user":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    count = await BorrowCRUD.count_by_request_status(db, status=status)
    return {"count": count}






@router.get("/borrow/request/{status}/list", response_model=List[BorrowRequestRecord])
async def get_borrow_status_list(
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.user.User = Depends(get_current_active_user)
):
    

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    return await BorrowCRUD.list_by_request_status(db, status=status)





@router.get("/borrow/status/{status}/count/my", response_model=BorrowCountResponse)
async def get_my_borrow_status_count(
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.user.User = Depends(get_current_active_user)
):
    
    count = await BorrowCRUD.count_my_borrow_status(db, user_id=current_user.user_id, status=status)
    return {"count": count}



@router.get("/borrow/status/{status}/list/my", response_model=List[BorrowRecord])
async def get_borrow_status_list(
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.user.User = Depends(get_current_active_user)
):
    
    user_id = None if current_user.role == "admin" else current_user.user_id
    return await BorrowCRUD.list_my_borrow_status(db, status=status, user_id=user_id)






@router.get("/borrow/request/{status}/count/my", response_model=BorrowCountResponse)
async def get_request_status_count(
    status: str, db: AsyncSession = Depends(get_db), current_user: models.user.User = Depends(get_current_active_user)
):
    
    user_id = None if current_user.role == "admin" else current_user.user_id
    count = await BorrowCRUD.count_my_request_status(db, status=status, user_id=user_id)
    return {"count": count}


@router.get("/borrow/request/{status}/list/my", response_model=List[BorrowRecord])
async def get_request_status_list(
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.user.User = Depends(get_current_active_user)
):
   
    user_id = None if current_user.role == "admin" else current_user.user_id
    return await BorrowCRUD.list_my_request_status(db, status=status, user_id=user_id)




