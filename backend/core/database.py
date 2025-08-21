from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.core.config import DATABASE_URL

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=False, future=True)

# Create async session factory
async_session = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

# Create declarative base for models
Base = declarative_base()


async def get_session() -> AsyncSession:
    """Dependency for getting async database session.

    Yields:
        AsyncSession: Async database session
    """
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    async with engine.begin() as conn:
        # run_sync runs synchronous create_all in async context
        await conn.run_sync(Base.metadata.create_all)