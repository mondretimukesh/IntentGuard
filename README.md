
# 🛡️ IntentGuard

## Explainable Android APK Risk Detection

> **Analyze an APK before installation. Understand what it can do, why it may be risky, and make an informed decision.**

**Static Analysis • Machine Learning • Contextual Risk Scoring • Explainable Evidence**

---

## 📌 Overview

IntentGuard is a web-based Android APK security analysis platform designed to assess the risk of an APK **before installation**.

Instead of providing only a simple:

> "Safe" or "Malicious"

verdict, IntentGuard combines:

- Static APK analysis
- Permission and capability analysis
- Behavioral API indicators
- Machine learning classification
- Contextual risk scoring
- Explainable security evidence

The goal is to convert complex APK security information into a result that is understandable to both **normal users and technical analysts**.

### Core Principle

> **IntentGuard doesn't just ask "Is this APK malicious?" — it asks what the APK can do, whether those capabilities make sense for its apparent purpose, what behavioral patterns it exhibits, and why the resulting risk assessment was made.**

---

# 🎯 The Problem

Android users increasingly download APK files from:

- Third-party websites
- Messaging platforms
- Shared links
- Unofficial application sources
- Direct APK distribution

Before installation, most users cannot easily determine:

- What permissions the APK requests
- What APIs it uses
- What system capabilities it accesses
- Whether its behavior appears suspicious
- Whether its requested capabilities make sense for its intended purpose

### The Core Problem

> **Security information exists, but it is often too technical or fragmented for normal users to understand and act upon.**

A user may see permissions such as SMS, accessibility, storage, networking, or overlay access without understanding the potential security implications of their combination.

---

# ⚠️ Why Individual Indicators Are Not Enough

A single permission or API does **not automatically mean that an application is malicious**.

For example:

```text
Messaging App
      +
   SMS Access
      ↓
Potentially Expected
````

while:

```text
Calculator
      +
   SMS Access
      ↓
Potentially Unexpected
```

Similarly, networking APIs are commonly used by legitimate applications.

Therefore, IntentGuard evaluates **multiple signals together** rather than treating one indicator as an automatic malware verdict.

---

# 💡 Core Idea — Intent, Not Just Presence

## **IntentGuard judges intent, not just presence.**

The system evaluates whether an APK's requested capabilities and observed behaviors are reasonable in the context of what the application appears to do.

For example:

```text
App Purpose
     +
Requested Permissions
     +
Observed API Behavior
     +
ML Classification
     ↓
Contextual Risk Assessment
```

Permissions are categorized conceptually as:

* **Expected**
* **Questionable**
* **Unexpected**

This allows the system to move beyond simple permission counting.

---

# 🔄 What Happens When an APK Is Uploaded?

The intended user flow is:

```text
        APK FILE
           │
           ▼
      APK VALIDATION
           │
           ▼
     STATIC ANALYSIS
           │
           ▼
    FEATURE EXTRACTION
           │
           ├───────────────┐
           ▼               ▼
   STATIC EVIDENCE      ML FEATURES
                           │
                           ▼
                    MACHINE LEARNING
                           │
                           ▼
                    RISK ENGINE
                           │
                           ▼
                  EXPLAINABLE REPORT
```

### In simple terms:

**Upload → Analyze → Classify → Score → Explain**

No APK installation is required for the static analysis process.

---

# 🏗️ System Architecture

IntentGuard is designed around several analysis layers.

### 1. APK Validation

* Validate the uploaded APK
* Perform integrity checks
* Calculate APK SHA-256 hash

### 2. Static Manifest & Code Analysis

Using Android static-analysis tooling such as Androguard:

* Extract permissions
* Inspect activities
* Inspect services
* Inspect receivers
* Identify API references
* Identify behavioral indicators

### 3. Purpose & Permission Matching

Infer the apparent application purpose using available APK information and compare that purpose with requested capabilities.

### 4. Transparency Evaluation

Assess how well the application's declared or inferred purpose aligns with its requested capabilities.

### 5. Machine Learning Classification

Convert extracted APK behavior into a numerical feature vector and classify the APK using a trained Random Forest model.

### 6. Threat Intelligence Enrichment

Planned enhancement for reputation-based analysis using locally cached hash/certificate intelligence.

### 7. Contextual Risk Engine

Combine ML assessment and static-analysis evidence into a final risk score.

### 8. User Report

Present:

* Predicted class
* ML confidence
* Risk score
* Risk level
* Security evidence
* Recommended action

---

# 🔍 What Does IntentGuard Analyze?

IntentGuard can analyze multiple categories of APK behavior.

### 🔐 Permissions

Examples include:

* SMS permissions
* Contact access
* Phone-state access
* Storage access
* Camera
* Microphone
* Overlay capability
* Installation-related permissions

### 🌐 Networking

Identify network-related API indicators and communication capabilities.

### 🔄 Reflection

Identify reflection-related APIs that may be relevant to application behavior.

### 💬 SMS

Identify SMS-related API indicators.

### ♿ Accessibility

Distinguish between:

* Accessibility API references
* Actual accessibility service components

This distinction is important because legitimate applications and Android support libraries may contain accessibility-related APIs without actually providing a malicious accessibility service.

### ⚙️ System Behavior

Potential indicators include:

* Process execution
* Boot persistence
* File-system operations
* System-level API interactions
* Other suspicious behavioral signals

---

# 🤖 Machine Learning

## ML-Based APK Classification

IntentGuard uses machine learning to identify behavioral patterns across APK samples.

### Dataset

**CICMalDroid 2020**

The project uses a prepared subset of the dataset for model development.

### Current ML Dataset

* **1,250 samples**
* **5 classes**
* **250 samples per class**
* Balanced dataset
* Duplicate samples removed during preparation

### Classes

| Class           | Description                                               |
| --------------- | --------------------------------------------------------- |
| SMS Malware     | Malware associated with SMS-related behavior              |
| Riskware        | Applications exhibiting potentially risky behavior        |
| Banking Malware | Malware associated with banking/financial threats         |
| Benign          | Non-malicious applications                                |
| Adware          | Applications associated with advertising-related behavior |

---

# 🧮 ML Feature Pipeline

The current ML pipeline uses:

## **470 behavioral features**

The feature pipeline follows:

```text
APK Dataset
     ↓
Duplicate Removal
     ↓
Balanced Dataset
     ↓
Train / Validation / Test Split
     ↓
Random Forest Training
     ↓
470-Feature Inference Vector
     ↓
Classification
```

During inference, the static analyzer produces a **470-dimensional numerical vector** using the same feature names and model ordering required by the trained model.

---

# 🌲 Why Random Forest?

IntentGuard currently uses a **Random Forest Classifier**.

Random Forest was selected because:

* The input is structured numerical/tabular feature data
* It can model nonlinear relationships between features
* It performs well for many tabular classification tasks
* It provides feature importance
* Feature importance can contribute to explainability

### Current Model Configuration

```text
Model:
Random Forest Classifier

Estimators:
200

Random State:
42

Class Weight:
Balanced
```

---

# 📊 Current ML Prototype Performance

The current prototype achieves approximately:

## **90% test accuracy on the prepared dataset**

This result represents performance on our prepared dataset.

> **It should not be interpreted as a guarantee of real-world malware detection accuracy.**

Further validation on diverse APKs and unseen malware families is required before making production-level performance claims.

---

# 💡 Explainability

## Detection Is Not Enough — We Explain the Risk

A security system should not only say:

```text
"This APK is risky."
```

It should also answer:

```text
"Why?"
```

IntentGuard therefore combines:

### Machine Learning Evidence

* Predicted class
* Class probabilities
* Important model features

### Static Evidence

* Permissions
* Networking indicators
* Reflection indicators
* SMS indicators
* Accessibility indicators
* Other behavioral indicators

### Example

```text
⚠️ RISKWARE

Risk Score: 52 / 100
Risk Level: MEDIUM

Why?

• Network APIs detected
• Reflection APIs detected
• Accessibility API references detected
• 3 permissions requested
```

---

# 🧠 Feature Importance

The Random Forest model provides feature importance values that help identify which features contribute strongly to classification.

Examples of important features in the current trained model include:

```text
getApplicationInfo
getDisplayInfo
getInstallerPackageName
getDeviceId
getPackageInfo
getSubscriberId
read
open
access
mkdir
```

Feature importance is used as an **explainability aid**, not as proof that a particular API is malicious.

---

# ⚖️ Contextual Risk Engine

The Risk Engine combines the ML assessment with static-analysis evidence.

Conceptually:

```text
             ML Assessment
                  │
                  ▼
          Malware Probability
                  │
                  │
Static Evidence ──┤
                  ▼
             Risk Engine
                  │
                  ▼
           Risk Score 0–100
                  │
          ┌───────┼───────┐
          ▼       ▼       ▼
         LOW    MEDIUM    HIGH
```

The risk score is intended to provide a simple summary of multiple security signals.

---

# 📐 Risk Scoring Concept

The overall architecture is designed around multiple risk dimensions:

```text
Malware Evidence
       +
Capability Risk
       +
Purpose Mismatch
       +
Behavior Indicators
       +
Fraud Pathway
       +
Reputation Evidence
       ↓
Contextual Risk Score
```

The exact weights and thresholds are part of the prototype and will be validated and refined during development.

### Important

> **The risk score is an assessment score, not a probability.**

A score of 70/100 does not mean there is a 70% probability that an APK is malicious.

---

# 🧪 Example Prototype Result

A current prototype analysis can produce results such as:

```text
============================================================
              INTENTGUARD RESULT
============================================================

Predicted Class:
  Riskware

ML Confidence:
  54.50%

Malware Probability:
  70.00%

Static Analysis Score:
  10.00 / 100

Final Risk Score:
  52.00 / 100

Risk Level:
  MEDIUM

Evidence:
  • Network APIs detected
  • Reflection APIs detected
  • Accessibility API references detected
  • 3 permissions requested
```

This demonstrates the intended integration between:

```text
Static Analysis
       +
Machine Learning
       +
Risk Engine
       ↓
Explainable Result
```

---

# 🧩 MVP Scope

## ✅ Included / Core Prototype

* APK upload and validation
* SHA-256 hash calculation
* Static manifest analysis
* Permission extraction
* Component analysis
* API usage indicators
* ML feature extraction
* 470-dimensional ML vector
* Random Forest classification
* Class probabilities
* Feature importance
* Contextual risk scoring
* Explainable security evidence

---

# 🚧 In Development / Integration

The following components are being integrated or refined:

* Frontend dashboard
* Backend API integration
* End-to-end APK → analysis → report pipeline
* Purpose inference refinement
* Purpose/permission matching refinement
* Risk-score calibration
* Broader feature coverage validation
* Additional APK testing

---

# 🔮 Future Enhancements

Potential future improvements include:

* Expanded ML feature coverage
* Improved purpose inference
* Larger and more diverse training datasets
* Dynamic analysis / sandboxing
* Improved malware-family generalization
* Reputation intelligence enrichment
* More advanced explainability
* Continuous model evaluation
* Production-scale deployment

---

# ❌ Not in Scope

IntentGuard does not currently aim to:

* Guarantee 100% malware detection
* Replace Google Play Protect or commercial antivirus
* Continuously monitor applications after installation
* Capture user keystrokes
* Capture screen contents
* Automatically uninstall applications
* Block banking or payment transactions
* Collect actual OTP/SMS content
* Provide production-grade dynamic sandboxing
* Enforce enterprise device-owner policies

---

# 🛡️ Why IntentGuard Is Different

## 1. Pre-Installation Analysis

Analyze an APK before the user installs it.

## 2. Multi-Signal Detection

Combine permissions, APIs, components and behavioral indicators.

## 3. Machine Learning

Use behavioral features to identify patterns across multiple APK categories.

## 4. Contextual Analysis

Consider whether requested capabilities make sense for the application's apparent purpose.

## 5. Explainability

Show evidence instead of returning only a malware label.

## 6. Simple Risk Score

Convert complex technical information into a 0–100 risk assessment.

## 7. Designed for Multiple Users

Simple enough for ordinary users while retaining technical evidence for analysts.

---

# 👤 Target Users

IntentGuard is designed primarily for:

### Everyday Android Users

Users who download APKs from outside official app stores.

### Security-Conscious Users

Users who want to inspect an APK before installation.

### Developers

Developers who want to inspect application capabilities and security indicators.

### Security Analysts

Analysts who need structured static evidence and ML-assisted classification.

---

# 🖥️ User Experience

The intended user journey is:

```text
        UPLOAD APK
             ↓
          ANALYZE
             ↓
       RISK ASSESSMENT
             ↓
       UNDERSTAND WHY
             ↓
       MAKE A DECISION
```

The main result should be immediately understandable:

```text
┌─────────────────────────────┐
│         🛡️ INTENTGUARD      │
│                             │
│       ⚠️ RISKWARE           │
│                             │
│       52 / 100              │
│       MEDIUM RISK           │
│                             │
│ Why?                        │
│ • Network APIs detected    │
│ • Reflection detected      │
│ • 3 permissions requested  │
│                             │
│       View Details          │
└─────────────────────────────┘
```

---

# 🧱 Tech Stack

| Layer           | Technology                           |
| --------------- | ------------------------------------ |
| Frontend        | React, TypeScript, Vite              |
| Backend / API   | Python, FastAPI                      |
| Static Analysis | Python, Androguard                   |
| ML              | Python, scikit-learn                 |
| Data Processing | pandas, NumPy                        |
| Model           | Random Forest                        |
| Storage         | PostgreSQL / MySQL                   |
| Reports         | JSON-based analysis and risk results |

---

# 🔗 Component Integration

IntentGuard is divided into four major responsibilities:

```text
                 INTENTGUARD
                      │
       ┌──────────────┼──────────────┐
       │              │              │
       ▼              ▼              ▼
    STATIC           ML            RISK
    ANALYSIS        ENGINE         ENGINE
       │              │              │
       └──────────────┼──────────────┘
                      │
                      ▼
                  FRONTEND
```

### Static Analysis

Produces:

* APK evidence
* Permissions
* API indicators
* Behavioral indicators
* ML feature vector

### ML Engine

Produces:

* Predicted class
* Class probabilities
* Feature importance

### Risk Engine

Produces:

* Malware probability
* Static risk
* Final risk score
* Risk level
* Evidence summary

### Frontend

Produces:

* User-friendly dashboard
* Risk visualization
* Evidence cards
* Detailed analysis

---

# 👥 Team & Ownership

## 4-Member Team

| Role                    | Responsibility                                                        |
| ----------------------- | --------------------------------------------------------------------- |
| Frontend & Product Lead | User interface, dashboard and final report                            |
| Backend & API Lead      | API, APK upload, storage and pipeline integration                     |
| Static Analysis Lead    | APK analysis, permissions, APIs, purpose and evidence                 |
| ML & Risk Engine Lead   | ML model, feature pipeline, classification and contextual risk engine |

### Integrated Pipeline

```text
APK
 ↓
Static Analysis
 ↓
ML Feature Vector
 ↓
Random Forest
 ↓
Risk Engine
 ↓
Backend
 ↓
Frontend
 ↓
User Report
```

---

# 🚀 Development Roadmap

## Phase 1 — Research & Ideation

Problem understanding → requirements → architecture

## Phase 2 — Static Analysis

APK → manifest + code analysis → behavioral evidence

## Phase 3 — ML Pipeline

Features → preprocessing → Random Forest → classification

## Phase 4 — Risk Engine

ML assessment + static evidence → contextual risk score

## Phase 5 — Integration

Static Analyzer + ML + Risk Engine + Backend + Frontend

## Phase 6 — Validation

Test across multiple APKs and analyze false positives / false negatives.

## Phase 7 — Product Refinement

Improve usability, explainability, performance and reliability.

---

# 🧪 Validation Strategy

IntentGuard will be evaluated using:

### ML Validation

* Accuracy
* Precision
* Recall
* F1-score
* Confusion matrix
* Class-wise performance

### Static Analysis Validation

* Feature extraction consistency
* Analyzer/model feature alignment
* Permission detection
* API indicator detection
* Component detection

### Risk Engine Validation

* Consistency of risk scoring
* Explainability of risk levels
* False-positive analysis
* False-negative analysis
* Comparison across different APK categories

---

# ⚠️ Known Limitations

IntentGuard is currently a prototype and has several limitations.

### Dataset Limitation

The ML model is trained using a prepared subset of CICMalDroid 2020 and may not generalize perfectly to unseen malware families.

### Static Analysis Limitation

Static analysis cannot observe every runtime behavior of an APK.

### Feature Coverage

The training model contains 470 features, while the static analyzer's supported feature coverage is still being expanded and validated.

Unsupported features are currently handled according to the inference pipeline and should not be interpreted as evidence that those behaviors are absent from the APK.

### Risk Score Calibration

The current risk score is a prototype scoring mechanism and requires further validation using a larger and more diverse APK set.

---

# 🔐 Security & Privacy Considerations

IntentGuard is designed around **pre-installation analysis**.

The system should:

* Avoid installing analyzed APKs
* Treat uploaded APKs as untrusted input
* Validate uploaded files
* Calculate hashes for identification
* Use temporary storage where appropriate
* Automatically delete temporary APKs after processing
* Avoid collecting personal SMS/OTP content
* Avoid executing untrusted APKs directly on the host system

Future dynamic analysis should be isolated inside a dedicated sandbox environment.

---

# 🎯 Project Goal

IntentGuard aims to answer three simple questions:

### 1. What can this APK do?

**Static Analysis**

### 2. Does its behavior look suspicious?

**Machine Learning + Behavioral Evidence**

### 3. Why is it considered risky?

**Explainable Risk Engine**

```text
       WHAT CAN IT DO?
              ↓
      IS IT SUSPICIOUS?
              ↓
             WHY?
              ↓
      WHAT SHOULD I DO?
```

---

# 🌟 Key Message

## **Don't Just Detect the Threat. Explain the Risk.**

IntentGuard aims to make Android APK security analysis:

**Understandable • Explainable • Contextual • Evidence-Based**

The ultimate goal is to help users make a more informed decision **before installing an Android APK**.

---

# ⚠️ Disclaimer

IntentGuard is a security-analysis prototype.

Its risk score is **not a probability** and is not a guarantee that an APK is safe or malicious.

The system is intended to provide security evidence and risk assessment to support — **not replace** — user judgment and professional security analysis.

---

# 📌 Project Status

### Current Core Prototype

* ✅ Static APK analysis
* ✅ 470-feature ML vector generation
* ✅ ML classification
* ✅ Random Forest model
* ✅ Class probability output
* ✅ Feature importance
* ✅ Risk Engine
* ✅ Explainable evidence
* 🔄 Backend integration
* 🔄 Frontend integration
* 🔄 End-to-end testing
* 🔄 Risk-score refinement

---

# 🙌 Team IntentGuard

### **Analyze. Classify. Explain.**

> **Know the risk before you install.**
