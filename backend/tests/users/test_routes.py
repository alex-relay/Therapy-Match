
import pytest
from httpx import AsyncClient

def test_read_main(client_fixture):
    response = client_fixture.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}


def test_create_therapist(client_fixture):
    response = client_fixture.post(
        "/register/therapist",
        json={
            "first_name": "John",
            "last_name": "Doe",
            "location": "40.7128, -74.0060",
            "email_address": "f@b.com",
            "description": "Experienced therapist",
            "specializations": ["anxiety", "depression"],
            "therapist_type": "licensed"
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["first_name"] == "John"
    assert data["last_name"] == "Doe"

    