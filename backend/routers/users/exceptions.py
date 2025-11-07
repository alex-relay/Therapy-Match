class PatientNotFoundError(ValueError):
    """Raised when a patient record cannot be found."""


class InvalidPostalCodeError(ValueError):
    """Raised when a postal code is invalid or cannot be geocoded."""


class GeocodingServiceError(Exception):
    """Raised when the external geocoding service fails."""
