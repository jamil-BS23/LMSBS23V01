import asyncio
from fastapi import FastAPI
# from app.database import engine, Base  # Temporarily commented out
from app.api import auth, users, books, categories, borrow, admin

app = FastAPI()

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(books.router, prefix="/books", tags=["Books"])
app.include_router(categories.router, prefix="/categories", tags=["Categories"])
app.include_router(borrow.router, prefix="/borrow", tags=["Borrow"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])


# Async init for models - Temporarily commented out
# async def init_models():
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)


# @app.on_event("startup")  # Temporarily commented out
# async def on_startup():
#     await init_models()


# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from app.api import auth, users, books, categories, borrow, admin
# from app.database import Base, engine   # ✅ Import database setup

# # Create FastAPI app
# app = FastAPI(title="Library Management System API", version="1.0.0")

# # Middleware (important for frontend integration, especially React, Vue, etc.)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # In production, replace "*" with specific frontend domains
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# Base.metadata.create_all(bind=engine)

# # Routers
# app.include_router(auth.router, prefix="/auth", tags=["Auth"])          
# app.include_router(users.router, prefix="/users", tags=["Users"])
# app.include_router(books.router, prefix="/books", tags=["Books"])
# app.include_router(categories.router, prefix="/categories", tags=["Categories"])  
# app.include_router(borrow.router, prefix="/borrow", tags=["Borrow"])   
# app.include_router(admin.router, prefix="/admin", tags=["Admin"])




# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from app.api import auth, users, books, categories, borrow, admin






# # Create FastAPI app
# app = FastAPI(title="Library Management System API", version="1.0.0")

# # Middleware (important for frontend integration, especially React, Vue, etc.)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # In production, replace "*" with specific frontend domains
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Routers
# app.include_router(auth.router, prefix="/auth", tags=["Auth"])          # Changed prefix: /auth
# app.include_router(users.router, prefix="/users", tags=["Users"])
# app.include_router(books.router, prefix="/books", tags=["Books"])
# app.include_router(categories.router, prefix="/categories", tags=["Categories"])  # Changed prefix: /categories
# app.include_router(borrow.router, prefix="/borrow", tags=["Borrow"])   # Changed prefix: /borrow
# app.include_router(admin.router, prefix="/admin", tags=["Admin"])
