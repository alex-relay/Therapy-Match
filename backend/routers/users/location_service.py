""" location service """

import ssl
import pgeocode
import certifi
from backend.core.logging import get_logger

logger = get_logger(__name__)

ssl._create_default_https_context = lambda: ssl.create_default_context(
    cafile=certifi.where()
)


def get_coordinates_from_postal_code(
    postal_code: str | None,
) -> dict[str, float] | None:
    """
    Resolve a Canadian postal code to geographic coordinates.

    Args:
        postal_code: A Canadian postal code string, or None.

    Returns:
        A dictionary with 'latitude' and 'longitude' keys (both float),
        or None if postal_code is falsy.

    Raises:
        ValueError: If the postal code cannot be resolved to coordinates.
    """
    if not postal_code:
        return None

    try:
        nomi = pgeocode.Nominatim("ca")
        location = nomi.query_postal_code(postal_code)

        if (
            location.empty
            or location["latitude"].isna().any()
            or location["longitude"].isna().any()
        ):
            return None

        return {
            "latitude": float(location.latitude.iloc[0]),
            "longitude": float(location.longitude.iloc[0]),
        }
    except Exception as e:
        logger.exception("Unable to find location: %s", e)
        raise ValueError("Unable to find location") from e
