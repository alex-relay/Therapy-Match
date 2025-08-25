from fastapi import FastAPI
from .routers.users.users import router
from backend.models.user import Therapist, Patient
from backend.core.database import create_db_and_tables

app = FastAPI()

app.include_router(router)

@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.on_event("startup")
async def on_startup():
    # Create tables if they don't exist
    create_db_and_tables()