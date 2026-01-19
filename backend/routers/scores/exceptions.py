class TestScoreCreationError(Exception):
    """Custom exception for test score creation errors."""


class TestScoreUpdateError(Exception):
    """Custom exception on failing to save an updated personality test"""


class PersonalityTestScoreCreationError(Exception):
    """Raised when there is an error creating a personality test score."""
