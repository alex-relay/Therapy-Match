from uuid import UUID
from sqlmodel import Field, SQLModel


class Match(SQLModel, table=True):
    __tablename__ = "matches"

    id: int | None = Field(default=None, primary_key=True)
    patient_id: UUID | None = Field(default=None, foreign_key="patients.id")
    therapist_id: UUID | None = Field(default=None, foreign_key="therapists.id")
