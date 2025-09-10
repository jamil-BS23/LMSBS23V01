import asyncio
from fastapi import FastAPI
from app.api import auth, users, books, categories, borrow, admin,  uploads

app = FastAPI()

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(books.router, prefix="/books", tags=["Books"])
app.include_router(uploads.router, prefix="/files")
app.include_router(categories.router, prefix="/categories", tags=["Categories"])
app.include_router(borrow.router, prefix="/borrow", tags=["Borrow"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])

