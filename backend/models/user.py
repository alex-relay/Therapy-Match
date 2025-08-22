from sqlalchemy import Column, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from pgvector.sqlalchemy import Vector
from uuid import uuid4
from backend.core.database import Base

class User:
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    email_address = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)

class Therapist(User, Base):
    __tablename__ = "therapists"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    personality_test_id = Column(UUID(as_uuid=True), ForeignKey("personality_test_scores.id", ondelete="CASCADE"), nullable=True)
    specializations = Column(ARRAY(String), nullable=False)

    personality_test = relationship(
        "PersonalityTestScore",
        cascade="all, delete-orphan",
        single_parent=True,
        uselist=False
    )

class Patient(User, Base):
    __tablename__ = "patients"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    therapy_needs = Column(ARRAY(String), nullable=False)
    personality_test_id = Column(UUID(as_uuid=True), ForeignKey("personality_test_scores.id", ondelete="CASCADE"), nullable=True)

    personality_test = relationship(
        "PersonalityTestScore",
        cascade="all, delete-orphan",
        single_parent=True,
        uselist=False
    )

class PersonalityTestScore(Base):
    __tablename__= "personality_test_scores"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    neuroticism = Column(Float, nullable=False)
    openness = Column(Float, nullable=False)
    extraversion = Column(Float, nullable=False)
    conscientiousness = Column(Float, nullable=False)
    agreeableness = Column(Float, nullable=False)
    vector = Column(Vector(5), nullable=True)

class Matches(Base):
    __tablename__= "matches"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    therapist_id = Column(UUID(as_uuid=True), ForeignKey("therapists.id", ondelete="CASCADE"), nullable=False)

