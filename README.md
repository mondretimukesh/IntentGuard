# IntentGuard

**An Explainable Android Security & Financial-Risk Analysis Platform**

Static APK Analysis • Contextual Permission Assessment • Risk Scoring

---

## Overview

IntentGuard is a website-based platform that analyzes Android APK files to detect device-takeover and financial-fraud risk **before installation**. Instead of a binary "safe / malicious" verdict, it produces a multi-dimensional, explainable risk report — combining static analysis, contextual permission-purpose matching, and machine learning into a single evidence-backed score.

IntentGuard is designed as a **complementary layer**, not a replacement, for Google Play Protect — focused specifically on threats introduced by sideloaded APKs (installed via WhatsApp, Telegram, SMS, or third-party sites) that bypass Play Store checks.

## The Problem

Individually common Android permissions become a takeover pathway when combined:

| Permission | Capability |
|---|---|
| Accessibility Service | Automates UI interaction and reads screen content |
| System Overlays | Draws fake screens over legitimate apps |
| SMS Access | Reads incoming text messages, including OTPs |
| Notification Access | Intercepts live device alerts |

**The attack chain:** An overlay captures credentials → SMS/notification access grabs the OTP → the accessibility service executes a banking, UPI, or card transaction entirely in the background. Users typically find out only after their accounts are compromised.

## Core Idea

IntentGuard judges **intent, not just presence**. It flags whether an app's requested permissions are actually justified by its apparent purpose (e.g., SMS access on an offline calculator is far more suspicious than SMS access on a messaging app), and scores risk across multiple signals rather than issuing a single pass/fail verdict.

## System Architecture — 8-Layer Analysis Flow

1. **APK Validation** — secure upload, integrity checks
2. **Static Manifest & Code Analysis** — permissions, activities, services, API indicators (via Androguard)
3. **Purpose & Permission Matching** — inferred app purpose vs. requested capabilities
4. **Transparency Evaluation** — how well permissions align with the app's declared use case
5. **Malware ML Classifier** — pretrained Random Forest inference
6. **Threat-Intelligence Enrichment** — offline-cached hash/certificate reputation lookup (VirusTotal- and MalwareBazaar-derived)
7. **Contextual Risk Engine** — combines all signals into a weighted score
8. **User Report & Recommended Action** — explainable output for the end user

## Risk Scoring

```
R = 0.30 × Malware
  + 0.25 × Capability
  + 0.15 × Purpose Mismatch
  + 0.15 × Behavior
  + 0.10 × Fraud Pathway
  + 0.05 × Cert Reputation
```

**Capability risk increments** (examples): Accessibility Service present (+30), Overlay capability present (+25), Notification access (+15), SMS access (+15), Boot persistence/receivers (+10), Suspicious networking/reflection (+10).

**Classification** is determined by a decision matrix combining Malware Evidence, Capability Risk, and Purpose Match — output as one of: Low Risk, Review Required, High Risk, Critical Risk, Insufficient Evidence, or Review & Verify Source.

## Purpose Inference

Purpose is inferred from a fixed taxonomy (Calculator, Messaging, Banking, Screen Reader, Media, Game, Unknown fallback) using cheap signals:

- App label, package name & certificate signatures
- Onboarding / resource string disclosures
- Declared activities, services, receivers, intent filters
- Explicit API usage indicators (TTS, media, file I/O, accessibility)

Permissions are then bucketed as **Expected**, **Questionable**, or **Unexpected** relative to the app's inferred purpose.

## Machine Learning

- **Dataset:** CICMalDroid 2020 (pretrained, offline, inference-only during build)
- Full corpus: 17,341 APKs → 11,598 clean analyzed samples post-preprocessing
- **Training subsample:** 1,250 samples, balanced across 5 classes (SMS Malware, Riskware, Banking Malware, Benign, Adware) — 250 samples each, no SMOTE required
- **Pipeline:** Raw APKs → Dedupe → Androguard Extraction → Binary Encoding → Balanced Subsampling → Random Forest Training

## MVP Scope

### ✅ Included
- Secure APK upload & validation
- SHA-256 hash calculation
- Static manifest & permission extraction
- Component / API usage indicator detection
- Inferred purpose vs. permission comparison
- Rule-based capability risk scoring
- Baseline ML classification (1,250 balanced samples, inference-only)
- Explainable risk report & recommendations

### ❌ Not in Scope
- Continuous post-installation monitoring
- Keystroke / screen capture
- Automatic app uninstallation
- Blocking live banking / payment transactions
- Full production-grade dynamic sandboxing
- Guaranteed 100% malware detection
- Direct OTP or SMS-content collection
- Enterprise device-owner enforcement

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React, TypeScript, Vite |
| API Framework | Python, FastAPI |
| Analysis Worker | Python, Androguard |
| Scoring & ML | Python, pandas, NumPy, scikit-learn |
| Storage | PostgreSQL / MySQL (metadata & reports), temp storage with scheduled auto-deletion |

## Team & Ownership

4 members · 8 architecture layers · 1 integrated pipeline

| Role | Owns | Deliverable |
|---|---|---|
| Frontend & Product Lead | Layer 8 — User Report & Recommended Action | Working security dashboard + user-facing risk report |
| Backend & API Lead | Layer 1 — APK Validation + Storage | Secure backend API + reliable pipeline integration |
| Static Analysis Lead | Layers 2–4 — Static Analysis, Purpose Matching & Transparency | APK feature vector + explainable evidence |
| ML & Risk Engine Lead | Layers 5–7 — Malware ML, Threat Intel & Contextual Risk | Explainable risk engine + final risk JSON |

## Build Timeline (48 Hours)

| Phase | Time | Focus |
|---|---|---|
| Setup | 0–4h | Repo setup, FastAPI init, React/Vite boilerplate, Postgres container |
| Static Analysis Pipeline | 4–12h | Androguard integration, manifest parsing, API extraction |
| Scoring Engine & ML Core | 12–20h | CICMalDroid preprocessing, RF training, weighted formula |
| Purpose Matching Engine | 20–26h | Purpose inference, permission categorization |
| UI & Report Generation | 26–36h | Upload dropzone, score meters, evidence cards, PDF export |
| Integration & Testing | 36–44h | End-to-end wiring, validation test matrix |
| Polish & Pitch Prep | 44–48h | Visual polish, deck finalization, dry-run demo, code freeze |

**Review checkpoints:** ~8h (concept clarity), ~20h (mini-integration check — mocked JSON contracts), ~24h (working prototype), ~40h (near-complete, demo stability).

## De-Risking the Build

| Risk | Mitigation |
|---|---|
| Purpose-inference ambiguity is open-ended | Bounded to a fixed taxonomy with pre-mapped permission policies per category, plus an explicit "Unknown" fallback; validated against 15–20 labeled sample APKs |
| Threat-intel enrichment implies live data dependency | Reputation hashes pre-downloaded and cached before the event — static local lookup, no live API calls during build |
| 8-layer integration across 4 members in 48 hours | Fixed JSON contracts locked at hour 0; each lead builds against mocked inputs/outputs; mini-integration checkpoint at ~20h; critical-path demo stays functional even if an enhancement layer slips |

## Disclaimer

IntentGuard's risk score is **not a probability** and not a guarantee of safety or maliciousness. It provides an explainable reason for every risk level to support — not replace — user judgment.

---

*Project reference deck — revised with build risk mitigations.*
