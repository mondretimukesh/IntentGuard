# IntentGuard 🛡️

**An Explainable Android Security & Financial-Risk Analysis Platform**
Built for VIT DevJams '26 — Team Cyber Mavericks

IntentGuard AI is a web-based tool that analyzes Android APK files and flags dangerous permission combinations before a user installs a sideloaded app. Instead of a binary "safe/malicious" verdict, it produces a multi-dimensional, explainable risk score that tells the user *why* an app is risky — not just that it is.

---

## The Problem

People frequently install APKs from WhatsApp, Telegram, SMS links, or third-party sites — outside the Play Store's vetting process. On their own, permissions like Accessibility Service, System Overlays, SMS access, and Notification access are common and often legitimate. Combined, they form a takeover pathway:

```
Overlay captures login credentials
        ↓
SMS / Notification access intercepts the OTP
        ↓
Accessibility Service silently executes the transaction
```

Users typically only find out after their bank account or UPI wallet has already been drained.

---

## What IntentGuard AI Does

1. User uploads an APK through the web interface.
2. The backend validates the file and computes a SHA-256 hash.
3. Androguard extracts the manifest, permissions, components, and API usage indicators.
4. The app's **inferred purpose** (from its label, strings, and declared components) is compared against its **requested permissions**, to check whether each permission is actually justified.
5. A weighted risk score is calculated across multiple signals.
6. The user receives a plain-language report explaining the score, not just a number.

**IntentGuard AI never says an app is simply "safe" or "malicious."** It scores risk across dimensions and explains its reasoning.

---

## Why Not Just Use MobSF?

Tools like MobSF are excellent general-purpose scanners, but they flag permissions in isolation — SMS access is treated as "dangerous" regardless of what the app actually is. That means a messaging app and a fake calculator app both get flagged the same way for requesting SMS access, even though only one of them has a legitimate reason to need it.

CyberShield AI instead asks: **does this app's declared purpose justify the permissions it's requesting?** SMS access on a messaging app is expected. SMS access on an offline calculator is not. This lets us surface disguised fraud apps that use only "individually normal" permissions in a combination that doesn't fit their stated purpose — something a flat permission checklist can miss.

| | MobSF / typical scanners | CyberShield AI |
|---|---|---|
| Permission check | Flags dangerous permissions in isolation | Checks permissions against the app's inferred purpose |
| Output | Checklist of findings across many categories | One weighted risk score + plain-language explanation |
| Focus | General-purpose security auditing | Specifically targets device-takeover & financial-fraud chains |
| Audience | Security researchers, developers | End users sideloading APKs |

---

## System Architecture — Analysis Pipeline

```
1. APK Upload & Validation
        ↓
2. SHA-256 Hashing & Static Manifest Extraction
        ↓
3. Purpose vs. Permission Matching
        ↓
4. Transparency Scoring
        ↓
5. Rule-Based + ML Risk Classification
        ↓
6. Dynamic Sandbox Analysis        ← Phase 2 (post-hackathon, not in MVP)
        ↓
7. Threat-Intelligence Enrichment  ← Phase 2/3 (not in MVP — placeholder only)
        ↓
8. Contextual Risk Engine
        ↓
9. Explainable Risk Report
```

> **Note on scope:** Steps 6 and 7 are architected for but **not implemented** in the 48-hour MVP. They appear in the diagram to show the intended full system, but the hackathon build stops at rule-based + ML scoring (steps 1–5, 8–9).

---

## Risk Scoring

Risk is calculated deterministically from a weighted combination of signals:

```
R = 0.30 × Malware Evidence
  + 0.25 × Capability Risk
  + 0.15 × Purpose Mismatch
  + 0.15 × Behavior
  + 0.10 × Fraud Pathway
  + 0.05 × Cert Reputation
```

**Capability risk increments:**

| Signal | Weight |
|---|---|
| Accessibility Service present | +30 |
| System overlay capability present | +25 |
| Notification access present | +15 |
| SMS access present | +15 |
| Boot persistence / receivers | +10 |
| Suspicious networking / reflection | +10 |

**Transparency bands:**

| Score | Rating |
|---|---|
| 80–100 | High transparency |
| 60–79 | Mostly transparent |
| 30–59 | Weak transparency |
| 0–29 | Poor transparency |

⚠️ **Risk Score ≠ Probability.** The score is a relative, explainable risk rating — not a statistical likelihood of infection.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React, TypeScript, Vite | Upload UI, score visualizations, report views |
| Backend API | Python, FastAPI | Secure APK upload, validation, hashing |
| Static Analysis | Python, Androguard | Manifest parsing, permission/component extraction |
| Scoring & ML | Python, pandas, NumPy, scikit-learn | Rule-based scoring + baseline ML classifier |
| Storage | PostgreSQL / MySQL | Report metadata storage, encrypted temp file handling |

---

## Dataset

*[Fill in before submission — this section must not be left blank.]*

- **Source:** *e.g., name / link of the dataset used (Kaggle, CICMalDroid, Drebin, custom-collected APK set, etc.)*
- **Size:** *e.g., X total samples*
- **Label balance:** *e.g., X benign / X malicious*
- **Preprocessing:** *e.g., deduplication, feature extraction method, train/test split strategy*

---

## MVP Scope

**Included:**
- Secure APK upload & validation
- SHA-256 hash calculation
- Static manifest & permission extraction
- Component / API usage indicator detection
- Purpose vs. permission comparison
- Rule-based capability risk scoring
- Baseline ML classification
- Explainable risk report & recommendations

**Not included (roadmap):**
- Continuous post-installation monitoring
- Keystroke / screen capture
- Automatic app uninstallation
- Blocking live banking/payment transactions
- Full dynamic sandbox analysis
- Live threat-intelligence API integration
- Guaranteed 100% malware detection

---

## Known Limitations

| Limitation | Mitigation |
|---|---|
| Static analysis misses delayed or server-triggered behavior | Phase 2: sandbox monitoring of network/filesystem/overlay/accessibility use |
| A web app can't monitor devices or block live transactions | Phase 2/3: companion app to flag risky installs and guide manual permission revocation |
| Misleading app names or disclosures | Compare declared purpose against actual API usage; output a transparency score |
| Obfuscation/reflection can hide logic | Flag reduced static confidence; recommend dynamic analysis |
| Legitimate power-user apps may trigger false positives | Weight permissions contextually against inferred app purpose |
| Small/limited training data can bias the ML model | Clean/dedupe data; fall back to rule-based "Insufficient Evidence" when confidence is low |
| No live reputation data for new certs/domains | Phase 3: local hash/cert/domain database, later external threat-intel API |
| Users may misread the score as an infection probability | Explicit "Risk Score ≠ Probability" disclaimer with qualitative ratings |

---

## Security & Privacy

- **No execution:** Uploaded APKs are never run or installed — analysis is fully static.
- **Ephemeral storage:** Uploaded files and temp data are automatically deleted shortly after analysis completes.
- **No sensitive data collection:** The engine parses manifest/code structure only. It does not and cannot collect OTPs, SMS content, credentials, or device location.

---

## 48-Hour Build Plan

| Phase | Hours | Focus | Owner |
|---|---|---|---|
| 1. Setup | 0–4 | Repo setup, FastAPI init, React/Vite boilerplate, PostgreSQL (Docker) | All |
| 2. Static Analysis Pipeline | 4–12 | Androguard integration, manifest parsing, component/string extraction | Security Analysis Engineer |
| 3. Scoring Engine & ML Core | 12–20 | Weighted scoring formula, baseline ML classifier | AI/ML & Risk Analytics Lead |
| 4. Purpose Matching Engine | 20–26 | Purpose inference, Expected/Questionable/Unexpected permission buckets | Security Engineer + ML Lead |
| 5. UI & Report Generation | 26–36 | Upload UI, score visualizations, evidence cards, report rendering | Frontend Lead |
| 6. Integration & Testing | 36–44 | Wiring frontend↔backend, running demo test matrix | Full team |
| 7. Polish & Demo Prep | 44–48 | UI polish, pitch slides, final testing, freeze code | Full team |

---

## Demo Test Matrix

| Test File | Expected Signal | Result |
|---|---|---|
| Legitimate offline calculator | Low malware, low capability, strong purpose match | Low Risk |
| Legitimate screen reader | Low malware, high capability, strong purpose match | Review Required |
| Deceptive flashlight APK | Low malware, high capability, weak purpose match | High Risk |
| Impersonation UPI/banking APK | High malware evidence | Critical Risk |
| Corrupt / non-APK / zip file | Validation failure | Rejected |

---

## Team — Cyber Mavericks

| Member | Role | Responsibilities |
|---|---|---|
| Member 1 | Frontend & UI/UX Lead | React/TypeScript dashboard, upload UI, score visualizations, report views |
| Member 2 | Backend & API Engineer | FastAPI backend, upload validation, SHA-256 hashing, database schema, encrypted temp storage |
| Member 3 | Security Analysis Engineer | Androguard static analysis, manifest/permission/component extraction, purpose-permission matching |
| Member 4 | AI/ML & Risk Analytics Lead | Transparency scoring, ML classifier (scikit-learn), contextual risk engine, scoring formula |

All members contribute to integration, testing, and final demo preparation.

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/<your-org>/IntentGuard.git
cd IntentGuard

# Backend setup
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend setup
cd ../frontend
npm install
npm run dev
```

## Acknowledgements

Built for VIT DevJams '26 by Team Cyber Mavericks.
