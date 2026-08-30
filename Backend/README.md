# IntentShield CTI — Backend API Platform

Defensive Android Security, APK Threat-Intelligence & Financial-Risk Analysis Platform.

---

## Architecture Overview

IntentShield CTI statically inspects Android APK files to detect device takeover vectors, high-privilege accessibility abuse, and phishing overlays.

The backend is built with:
- **FastAPI (Python 3.12)**: Asynchronous REST API with Pydantic v2 schemas configured for camelCase serialization matching the React/TypeScript frontend.
- **PostgreSQL + SQLAlchemy 2.0 (Async) + Alembic**: Relational persistence for users, jobs, reports, audit logs, and risk policies.
- **Celery + Redis**: Asynchronous distributed worker queue executing 8-stage APK analysis out-of-band.
- **6-Factor Contextual Risk Engine**: Isolated pure scoring module evaluating Malware Evidence, Capability Risk, Purpose Mismatch, Behavioral Anomalies, Fraud Pathway, and Certificate Reputation.
- **WeasyPrint / ReportLab**: PDF executive CTI report generator.
- **Docker Compose**: One-command orchestration bringing up `api`, `worker`, `postgres`, `redis`, and `minio`.

---

## ⚡ Team Integration: Swapping Mocks for Real Implementations

To enable independent parallel team development, the intelligence pipeline is isolated into **exactly two swappable client functions**:

### 1. Static Analyzer Integration
- **File**: `app/services/static_analyzer_client.py`
- **Function**: `get_static_evidence(apk_path: str) -> EvidenceJson`
- **Contract**:
  ```python
  class EvidenceJson(BaseModel):
      packageName: str
      appName: str
      fileSizeBytes: int
      sha256: str
      manifestXml: str
      declaredCategory: str | None
      permissions: list[Permission]
      hooks: HighPrivilegeHooks
      certificate: CertificateInfo
      suspiciousStrings: list[str]
      suspiciousApiCalls: list[str]
  ```
- **How to swap**: Replace the body of `get_static_evidence()` with your Androguard extraction pipeline returning `EvidenceJson`.

---

### 2. ML & Risk Engine Integration
- **File**: `app/services/ml_risk_client.py`
- **Function**: `get_ml_classification(evidence: EvidenceJson) -> MLPrediction`
- **Contract**:
  ```python
  class MLPrediction(BaseModel):
      malwareProbability: float  # 0.0–1.0
      predictedLabel: str        # "malware" | "benign" | "suspicious"
      confidence: float          # 0.0–1.0
      topFeatureContributions: list[dict] | None = None
  ```
- **How to swap**: Replace the body of `get_ml_classification()` with your Random Forest model inference code returning `MLPrediction`.

**Note**: All downstream scoring, report assembly, database persistence, and API responses remain completely unchanged!

---

## Quickstart (Local Development)

### 1. Prerequisites
- Python 3.12+
- Redis (optional, fallback in-process background worker enabled)
- PostgreSQL (or automatic SQLite fallback)

### 2. Install Dependencies
```bash
cd Backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Run Migrations & Start FastAPI Server
```bash
# Run database migrations
alembic upgrade head

# Start API server
uvicorn app.main:app --reload --port 8000
```
Interactive Swagger Documentation will be available at: **http://localhost:8000/docs**

### 5. Start Celery Worker (Optional)
```bash
celery -A app.workers.celery_app worker --loglevel=info
```

---

## Docker Compose (Production / Full Stack)

Run the entire system (`api`, `worker`, `postgres`, `redis`, `minio`) with a single command:

```bash
docker compose up --build
```

Services:
- **FastAPI Backend**: `http://localhost:8000` (Docs: `http://localhost:8000/docs`)
- **PostgreSQL**: `localhost:5432` (`intentguard`)
- **Redis**: `localhost:6379`
- **MinIO Console**: `http://localhost:9001` (User/Pass: `minioadmin` / `minioadmin`)

---

## Running the Automated Test Suite

Run pytest to verify authentication, RBAC enforcement, 6-factor risk formulas, and end-to-end analysis pipelines:

```bash
pytest tests/ -v
```

---

## API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` (or `/signup`) — Register new user
- `POST /api/auth/login` (or `/signin`) — Authenticate and receive JWT
- `GET /api/auth/me` — Retrieve active user profile
- `POST /api/auth/change-password` — Update user password

### Administrator Management (`/api/admin`) *(Requires role=admin)*
- `GET /api/admin/users` — List platform users
- `POST /api/admin/users` — Provision new user with temporary password
- `PATCH /api/admin/users/{id}/role` — Change user role (audit-logged in same transaction)
- `PATCH /api/admin/users/{id}/status` — Suspend or reactivate user (audit-logged in same transaction)
- `GET /api/admin/audit-logs` — Retrieve immutable security audit trail

### APK Analysis & Reports (`/api/analyze`, `/api/report`, `/api/history`)
- `POST /api/analyze` — Multipart APK upload (returns `{jobId, sha256}` immediately)
- `GET /api/analyze/{id}` — Poll analysis progress and 8-stage logs
- `GET /api/report/{id}` — Retrieve full structured report
- `GET /api/report/{id}/export` — Export PDF executive report
- `GET /api/history` — Paginated scan history with filter & search
- `DELETE /api/history/{id}` — Delete scan record

### Settings & Health (`/api/settings`, `/api/health`)
- `GET /api/settings` / `PATCH /api/settings` — App settings & dynamic capability weights
- `GET /api/settings/risk-weights` — Read-only formula weights
- `GET /api/settings/threat-intel-sources` — Connected CTI feed status
- `GET /api/health` — System health check
