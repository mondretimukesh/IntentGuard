import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_admin_rbac_enforcement(client: AsyncClient, user_token: str, admin_token: str):
    """Verify that only users with role=admin can access /api/admin endpoints."""
    # 1. Non-admin forbidden
    user_headers = {"Authorization": f"Bearer {user_token}"}
    res_forbidden = await client.get("/api/admin/users", headers=user_headers)
    assert res_forbidden.status_code == 403

    res_audit_forbidden = await client.get("/api/admin/audit-logs", headers=user_headers)
    assert res_audit_forbidden.status_code == 403

    # 2. Admin authorized
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    res_ok = await client.get("/api/admin/users", headers=admin_headers)
    assert res_ok.status_code == 200
    users = res_ok.json()
    assert len(users) >= 2


@pytest.mark.asyncio
async def test_admin_user_management_and_audit_logging(client: AsyncClient, admin_token: str):
    """Test admin creating user, modifying role/status, and verifying atomic audit log writes."""
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Admin creates user
    create_payload = {
        "fullName": "Alex Rivera",
        "email": "alex.rivera@threatlab.io",
        "role": "user",
        "organization": "Mobile Malware Forensics"
    }
    create_res = await client.post("/api/admin/users", json=create_payload, headers=admin_headers)
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert "tempPassword" in created_data
    created_user_id = created_data["user"]["id"]
    assert created_data["user"]["email"] == "alex.rivera@threatlab.io"

    # 2. Admin updates role to admin
    role_res = await client.patch(
        f"/api/admin/users/{created_user_id}/role",
        json={"role": "admin"},
        headers=admin_headers
    )
    assert role_res.status_code == 200
    assert role_res.json()["role"] == "admin"

    # 3. Admin suspends user
    status_res = await client.patch(
        f"/api/admin/users/{created_user_id}/status",
        json={"status": "suspended"},
        headers=admin_headers
    )
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "suspended"

    # 4. Verify audit log captures all events
    audit_res = await client.get("/api/admin/audit-logs", headers=admin_headers)
    assert audit_res.status_code == 200
    audit_logs = audit_res.json()
    assert len(audit_logs) >= 3

    events = [log["action"] for log in audit_logs]
    assert any("Admin Created User" in e for e in events)
    assert any("User Role Updated" in e for e in events)
    assert any("User Suspended" in e for e in events)
