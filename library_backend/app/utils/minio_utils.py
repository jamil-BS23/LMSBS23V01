from minio import Minio
from app.config import settings
from fastapi import UploadFile
import uuid

minio_client = Minio(
    settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=False
)

def upload_file(file: UploadFile, folder: str = "books"):
    file_id = str(uuid.uuid4())
    extension = file.filename.split(".")[-1]
    object_name = f"{folder}/{file_id}.{extension}"
    minio_client.put_object(
        bucket_name=settings.MINIO_BUCKET,
        object_name=object_name,
        data=file.file,
        length=file.spool_max_size,
        content_type=file.content_type
    )
    url = f"{settings.MINIO_ENDPOINT}/{settings.MINIO_BUCKET}/{object_name}"
    return url

def delete_file(object_name: str):
    minio_client.remove_object(settings.MINIO_BUCKET, object_name)
