# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    MAX_BORROW_LIMIT: int = 5
    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str
    JWT_EXPIRATION_MINUTES: int = 60  


    class Config:
        env_file = ".env"
        # Allow extra fields from .env without error
        extra = "allow"

# Initialize settings
settings = Settings()












# from pydantic_settings import BaseSettings

# class Settings(BaseSettings):
#     DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost/library_db"
#     JWT_SECRET_KEY: str = "supersecretjwtkey"
#     JWT_ALGORITHM: str = "HS256"
#     JWT_EXPIRATION_MINUTES: int = 60

#     MINIO_ENDPOINT: str = "http://localhost:9000"
#     MINIO_ACCESS_KEY: str = "minio_access_key"
#     MINIO_SECRET_KEY: str = "minio_secret_key"
#     MINIO_BUCKET: str = "library"

# settings = Settings()



# from pydantic_settings import BaseSettings

# class Settings(BaseSettings):
#     DATABASE_URL: str
#     SECRET_KEY: str
#     ALGORITHM: str
#     ACCESS_TOKEN_EXPIRE_MINUTES: int
#     MAX_BORROW_LIMIT: int = 5   # default if not provided

#     class Config:
#         env_file = ".env"   # Load from .env file

# # Global instance
# settings = Settings()
