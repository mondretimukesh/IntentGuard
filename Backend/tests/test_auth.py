import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_and_login_flow(client: AsyncClient):
    """Test user registration and subsequent login."""
    # 1. Register
    reg_payload = {
        "fullName": "Sarah Chen",
        "email": "sarah.chen@intentguard.sec",
        "password": "SecurePassword123!",
        "role": "user",
        "organization": "Financial Threat Unit"
    }
    reg_res = await client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "token" in reg_data
    assert reg_data["user"]["email"] == "sarah.chen@intentguard.sec"
    assert reg_data["user"]["role"] == "user"
    assert reg_data["user"]["name"] == "Sarah Chen"

    # 2. Duplicate Registration Prevention
    dup_res = await client.post("/api/auth/register", json=reg_payload)
    assert dup_res.status_code == 400

    # 3. Login
    login_payload = {
        "email": "sarah.chen@intentguard.sec",
        "password": "SecurePassword123!"
    }
    login_res = await client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "token" in login_data
    assert login_data["user"]["email"] == "sarah.chen@intentguard.sec"

    # 4. Invalid Password
    bad_login = await client.post("/api/auth/login", json={
        "email": "sarah.chen@intentguard.sec",
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401


@pytest.mark.asyncio
async def test_me_and_change_password(client: AsyncClient, user_token: str):
    """Test /api/auth/me and password update."""
    headers = {"Authorization": f"Bearer {user_token}"}

    # 1. Profile /me
    me_res = await client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == "analyst@intentguard.sec"
    assert me_data["role"] == "user"

    # 2. Change password
    pwd_payload = {
        "currentPassword": "AnalystPassword123!",
        "newPassword": "NewSecurePassword456!"
    }
    pwd_res = await client.post("/api/auth/change-password", json=pwd_payload, headers=headers)
    assert pwd_res.status_code == 200
    assert pwd_res.json()["success"] is True

    # 3. Verify login with new password
    login_res = await client.post("/api/auth/login", json={
        "email": "analyst@intentguard.sec",
        "password": "NewSecurePassword456!"
    })
    assert login_res.status_code == 200
