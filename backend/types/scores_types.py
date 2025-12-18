from enum import Enum


class PersonalityTestCategory(str, Enum):
    AGREEABLENESS = "agreeableness"
    NEUROTICISM = "neuroticism"
    CONSCIENTIOUSNESS = "conscientiousness"
    EXTROVERSION = "extroversion"
    OPENNESS = "openness"
