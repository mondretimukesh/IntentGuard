import pytest
import io
import asyncio
from httpx import AsyncClient
from app.workers.tasks import run_analysis_pipeline_async


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test /api/health endpoint."""
    res = await client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_settings_and_weights_api(client: AsyncClient):
    """Test /api/settings endpoints."""
    # 1. Get default settings
    res = await client.get("/api/settings")
    assert res.status_code == 200
    data = res.json()
    assert data["autoDeleteApks"] is True
    assert data["capabilityTuning"]["accessibilityService"] == 30

    # 2. Patch settings
    patch_res = await client.patch("/api/settings", json={
        "autoDeleteApks": False,
        "capabilityTuning": {
            "accessibilityService": 45,
            "systemOverlay": 25,
            "notificationAccess": 15,
            "smsAccess": 15,
            "bootPersistence": 10,
            "suspiciousNetworking": 10
        }
    })
    assert patch_res.status_code == 200
    updated_data = patch_res.json()
    assert updated_data["autoDeleteApks"] is False
    assert updated_data["capabilityTuning"]["accessibilityService"] == 45

    # 3. Get risk weights
    weights_res = await client.get("/api/settings/risk-weights")
    assert weights_res.status_code == 200
    w_data = weights_res.json()
    assert w_data["malwareEvidence"] == 0.30
    assert w_data["capabilityRisk"] == 0.25

    # 4. Get Threat Intel sources
    cti_res = await client.get("/api/settings/threat-intel-sources")
    assert cti_res.status_code == 200
    assert len(cti_res.json()) >= 3


@pytest.mark.asyncio
async def test_analysis_pipeline_and_report_flow(client: AsyncClient, db_session):
    """Test full upload -> process -> report -> history -> export -> delete pipeline."""
    # 1. Upload Banking Trojan Sample
    fake_apk_bytes = b"PK\x03\x04\x14\x00\x00\x00\x08\x00DummyApkContentBankingPayload"
    files = {
        "file": ("banking_trojan_v4.apk", io.BytesIO(fake_apk_bytes), "application/vnd.android.package-archive")
    }
    upload_res = await client.post("/api/analyze", files=files)
    assert upload_res.status_code == 200
    upload_data = upload_res.json()
    assert "jobId" in upload_data
    assert "sha256" in upload_data
    job_id = upload_data["jobId"]

    # 2. Check initial job status
    status_res = await client.get(f"/api/analyze/{job_id}")
    assert status_res.status_code == 200
    job_status = status_res.json()
    assert job_status["jobId"] == job_id
    assert len(job_status["logs"]) >= 1

    # Run analysis pipeline directly to populate database
    await run_analysis_pipeline_async(job_id, "banking_trojan_v4.apk")

    # 3. Poll completed status
    completed_res = await client.get(f"/api/analyze/{job_id}")
    assert completed_res.status_code == 200
    comp_data = completed_res.json()
    assert comp_data["status"] == "complete"
    assert comp_data["estimatedTimeRemaining"] == 0
    assert len(comp_data["logs"]) >= 5

    # 4. Fetch Full Report
    report_res = await client.get(f"/api/report/{job_id}")
    assert report_res.status_code == 200
    report = report_res.json()
    assert report["jobId"] == job_id
    assert report["riskScore"] >= 70
    assert report["riskLevel"] in ["high", "critical"]
    assert len(report["riskComponents"]) == 6
    assert len(report["evidence"]) >= 1
    assert len(report["permissions"]) >= 1
    assert "attackPathway" in report
    assert len(report["attackPathway"]["steps"]) >= 1
    assert len(report["recommendations"]) >= 1
    assert "manifestXml" in report

    # 5. Export Report PDF
    pdf_res = await client.get(f"/api/report/{job_id}/export")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 100

    # 6. Fetch Scan History
    hist_res = await client.get("/api/history?page=1&limit=10")
    assert hist_res.status_code == 200
    hist_data = hist_res.json()
    assert hist_data["total"] >= 1
    assert any(item["id"] == job_id for item in hist_data["items"])

    # 7. Delete Scan History
    del_res = await client.delete(f"/api/history/{job_id}")
    assert del_res.status_code == 200

    # Verify deleted
    post_del_res = await client.get(f"/api/report/{job_id}")
    assert post_del_res.status_code == 404
