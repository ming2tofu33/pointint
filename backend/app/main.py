import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(
    title="Pointint API",
    version="0.1.0",
    description="Cursor creation workflow backend",
)

cors_origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    "http://localhost:3000",
    "https://pointtint.com",
    "https://www.pointtint.com",
    "https://pointint.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from app.api.background import router as background_router
from app.api.cursor import router as cursor_router

app.include_router(background_router, prefix="/api")
app.include_router(cursor_router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "pointint-api"}
