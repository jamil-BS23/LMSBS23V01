from fastapi import APIRouter, UploadFile, Depends
from app.utils.minio_utils import upload_file
from app.dependencies import get_current_admin

router = APIRouter()

@router.post("/upload/user-photo", tags=["Uploads"], dependencies=[Depends(get_current_admin)])
async def upload_user_photo(file: UploadFile):
    """Upload user profile photo to MinIO and return URL"""
    file_url = upload_file(file, folder="users")
    return {"url": file_url}

@router.post("/upload/book-photo", tags=["Uploads"], dependencies=[Depends(get_current_admin)])
async def upload_book_photo(file: UploadFile):
    """Upload book photo to MinIO and return URL"""
    file_url = upload_file(file, folder="books")
    return {"url": file_url}
