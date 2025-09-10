import uuid
from minio import Minio
from fastapi import UploadFile, HTTPException
from app.config import settings

minio_client = Minio(
    settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=False  
)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}
MAX_FILE_SIZE = 1 * 1024 * 1024  # 1 MB in bytes


def validate_file(file: UploadFile):
    """Validate file extension and size before upload."""
    extension = file.filename.split(".")[-1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only .png, .jpg, .jpeg files are allowed")

    
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 1 MB")

    return extension


def upload_file(file: UploadFile, folder: str = "uploads"):
    """Upload file to MinIO and return public link."""
    extension = validate_file(file)

    file_id = str(uuid.uuid4())
    object_name = f"{folder}/{file_id}.{extension}"

    try:
        minio_client.put_object(
            bucket_name=settings.MINIO_BUCKET,
            object_name=object_name,
            data=file.file,
            length=-1,  
            part_size=10 * 1024 * 1024,  
            content_type=file.content_type
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MinIO upload failed: {str(e)}")

    # Return file URL
    file_url = f"http://{settings.MINIO_ENDPOINT}/{settings.MINIO_BUCKET}/{object_name}"
    return file_url


def delete_file(object_name: str):
    """Delete file from MinIO."""
    try:
        minio_client.remove_object(settings.MINIO_BUCKET, object_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MinIO delete failed: {str(e)}")
