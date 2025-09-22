from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .routers.users.users import router as user_router
from backend.routers.scores.scores import router as scores_router
from backend.models import *  # pylint: disable=wildcard-import
from backend.core.database import run_migrations


@asynccontextmanager
async def lifespan(app_: FastAPI):
    run_migrations()
    yield


app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(scores_router)
app.include_router(user_router)


@app.get("/")
async def root():
    return {"message": "Hello World"}
