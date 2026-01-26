from enum import Enum


class GenderOption(str, Enum):
    MALE = "male"
    FEMALE = "female"
    NON_BINARY = "non_binary"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"
    OTHER = "other"


class UserOption(str, Enum):
    PATIENT = "patient"
    THERAPIST = "therapist"


class TherapistTypeOption(str, Enum):
    PSYCHOLOGIST = "psychologist"
    PSYCHOTHERAPIST = "psychotherapist"
    SOCIAL_WORKER = "social_worker"
    REGISTERED_PRACTITIONER = "registered_practitioner"
