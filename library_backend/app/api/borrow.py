


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import models, crud
from app.schemas.borrow import (
    BorrowRecord,
    BorrowCreate,
    BorrowStatusUpdate,
    BorrowListResponse,
    BorrowCountResponse,
)



from app.core.security import get_current_user
from app.database import get_db


router = APIRouter()

# ================================
# USER ROUTES
# ================================
get_current_active_user = get_current_user


@router.post("/borrow/", response_model=BorrowRecord)
def borrow_book(
    borrow: BorrowCreate,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(get_current_active_user),
):
    """
    User requests to borrow a book.
    """
    return crud.borrow.create_borrow(db=db, borrow=borrow, user_id=current_user.id)


@router.get("/borrow/my", response_model=List[BorrowRecord])
def get_my_borrowed_books(
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(get_current_active_user),
):
    """
    User can see only his own borrow requests and book details.
    """
    return crud.borrow.get_user_borrows(db, user_id=current_user.id)


# ================================
# ADMIN ROUTES
# ================================

@router.patch("/borrow/{borrow_id}/status", response_model=BorrowRecord)
def update_borrow_status(
    borrow_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(get_current_active_user),
):
    """
    Admin can update borrow_status (borrowed, returned, overdue).
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.borrow.update_borrow_status(db, borrow_id=borrow_id, status=status)


@router.patch("/borrow/{borrow_id}/request", response_model=BorrowRecord)
def update_request_status(
    borrow_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(get_current_active_user),
):
    """
    Admin can update request_status (accept, pending, reject).
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.borrow.update_request_status(db, borrow_id=borrow_id, status=status)


# ======= Borrow Status Statistics =======

@router.get("/borrow/status/{status}/count", response_model=BorrowCountResponse)
def get_borrow_status_count(
    status: str, db: Session = Depends(get_db), current_user: models.user.User = Depends(get_current_active_user)
):
    """
    Admin: Get count of borrows by borrow_status.
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return {"count": crud.borrow.count_by_borrow_status(db, status=status)}


@router.get("/borrow/status/{status}/list", response_model=List[BorrowRecord])
def get_borrow_status_list(
    status: str, db: Session = Depends(get_db), current_user: models.user.User = Depends(get_current_active_user)
):
    """
    Admin: Get detailed list of borrows by borrow_status.
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.borrow.list_by_borrow_status(db, status=status)


# ======= Request Status Statistics =======

@router.get("/borrow/request/{status}/count", response_model=BorrowCountResponse)
def get_request_status_count(
    status: str, db: Session = Depends(get_db), current_user: models.user.User = Depends(get_current_active_user)
):
    """
    Admin: Get count of borrows by request_status.
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return {"count": crud.borrow.count_by_request_status(db, status=status)}


@router.get("/borrow/request/{status}/list", response_model=List[BorrowRecord])
def get_request_status_list(
    status: str, db: Session = Depends(get_db), current_user: models.user.User = Depends(get_current_active_user)
):
    """
    Admin: Get detailed list of borrows by request_status.
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.borrow.list_by_request_status(db, status=status)
















# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from typing import List

# from app import schemas, models, crud
# from app.core.security import get_current_user
# from app.database import get_db


# router = APIRouter()

# # ================================
# # USER ROUTES
# # ================================
# get_current_active_user = get_current_user
# @router.post("/borrow/", response_model=schemas.borrow)
# def borrow_book(
#     borrow: schemas.BorrowCreate,
#     db: Session = Depends(get_db),
#     current_user: models.user.User = Depends(get_current_active_user),
# ):
#     """
#     User requests to borrow a book.
#     """
#     return crud.borrow.create_borrow(db=db, borrow=borrow, user_id=current_user.id)


# @router.get("/borrow/my", response_model=List[schemas.borrow])
# def get_my_borrowed_books(
#     db: Session = Depends(get_db),
#     current_user: models.user.User = Depends(get_current_active_user),
# ):
#     """
#     User can see only his own borrow requests and book details.
#     """
#     return crud.borrow.get_user_borrows(db, user_id=current_user.id)


# # ================================
# # ADMIN ROUTES
# # ================================

# @router.patch("/borrow/{borrow_id}/status", response_model=schemas.borrow)
# def update_borrow_status(
#     borrow_id: int,
#     status: str,
#     db: Session = Depends(get_db),
#     current_user: models.user.User = Depends(get_current_active_user),
# ):
#     """
#     Admin can update borrow_status (borrowed, returned, overdue).
#     """
#     if not current_user.is_admin:
#         raise HTTPException(status_code=403, detail="Not authorized")
#     return crud.borrow.update_borrow_status(db, borrow_id=borrow_id, status=status)


# @router.patch("/borrow/{borrow_id}/request", response_model=schemas.borrow)
# def update_request_status(
#     borrow_id: int,
#     status: str,
#     db: Session = Depends(get_db),
#     current_user: models.user.User = Depends(get_current_active_user),
# ):
#     """
#     Admin can update request_status (accept, pending, reject).
#     """
#     if not current_user.is_admin:
#         raise HTTPException(status_code=403, detail="Not authorized")
#     return crud.borrow.update_request_status(db, borrow_id=borrow_id, status=status)


# # ======= borrow Status Statistics =======

# @router.get("/borrow/status/{status}/count")
# def get_borrow_status_count(
#     status: str, db: Session = Depends(get_db), current_user: models.user.User = Depends(get_current_active_user)
# ):
#     """
#     Admin: Get count of borrows by borrow_status.
#     """
#     if not current_user.is_admin:
#         raise HTTPException(status_code=403, detail="Not authorized")
#     return {"status": status, "count": crud.borrow.count_by_borrow_status(db, status=status)}


# @router.get("/borrow/status/{status}/list", response_model=List[schemas.borrow])
# def get_borrow_status_list(
#     status: str, db: Session = Depends(get_db), current_user: models.user.User = Depends(get_current_active_user)
# ):
#     """
#     Admin: Get detailed list of borrows by borrow_status.
#     """
#     if not current_user.is_admin:
#         raise HTTPException(status_code=403, detail="Not authorized")
#     return crud.borrow.list_by_borrow_status(db, status=status)


# # ======= Request Status Statistics =======

# @router.get("/borrow/request/{status}/count")
# def get_request_status_count(
#     status: str, db: Session = Depends(get_db), current_user: models.user.User = Depends(get_current_active_user)
# ):
#     """
#     Admin: Get count of borrows by request_status.
#     """
#     if not current_user.is_admin:
#         raise HTTPException(status_code=403, detail="Not authorized")
#     return {"status": status, "count": crud.borrow.count_by_request_status(db, status=status)}


# @router.get("/borrow/request/{status}/list", response_model=List[schemas.borrow])
# def get_request_status_list(
#     status: str, db: Session = Depends(get_db), current_user: models.user.User = Depends(get_current_active_user)
# ):
#     """
#     Admin: Get detailed list of borrows by request_status.
#     """
#     if not current_user.is_admin:
#         raise HTTPException(status_code=403, detail="Not authorized")
#     return crud.borrow.list_by_request_status(db, status=status)
