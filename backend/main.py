from fastapi import FastAPI
from contextlib import asynccontextmanager
from .routers.users.users import router
from backend.models.user import Therapist, Patient
from backend.core.database import create_db_and_tables, run_migrations


@asynccontextmanager
async def lifespan(app_: FastAPI):
    run_migrations()
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(router)


@app.get("/")
async def root():
    return {"message": "Hello World"}
