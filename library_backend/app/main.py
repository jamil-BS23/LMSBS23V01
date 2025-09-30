import asyncio
from fastapi import FastAPI
from app.api import auth, users, books, categories, borrow, admin,  uploads, settings, donation_book
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://lmsbs23v01-1.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(books.router, prefix="/books", tags=["Books"])
app.include_router(uploads.router, prefix="/files")
app.include_router(categories.router, prefix="/categories", tags=["Categories"])
app.include_router(borrow.router, prefix="/borrow", tags=["Borrow"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(settings.router, prefix="/settings", tags=["Settings"])
app.include_router(settings.router) 
app.include_router(donation_book.router, prefix="/donation", tags="Donation Book")


@app.get("/")
async def root():
    return {
        "message": "📚 Library Backend API is running 🚀",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }