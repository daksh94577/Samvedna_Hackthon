# Samvedna / संवेदना — Complete Backend & API Configuration

> **GitHub sharing document:** full source snapshots, API reference and placeholder-only configuration. No actual `.env` files, private keys, access tokens, database records, logs or uploaded evidence are included. **This is a prototype snapshot, not a production-readiness or security certification.**

Generated: **2026-10-08 (UTC)**. API inventory is derived from the current route decorators.

## Contents

1. [Architecture and current status](#1-architecture-and-current-status)
2. [Local setup](#2-local-setup)
3. [Environment variables and API keys](#3-environment-variables-and-api-keys)
4. [Complete API reference](#4-complete-api-reference)
5. [Request examples](#5-request-examples)
6. [Data, scoring and encryption](#6-data-scoring-and-encryption)
7. [Important prototype limitations](#7-important-prototype-limitations)
8. [GitHub sharing checklist](#8-github-sharing-checklist)
9. [Complete backend source](#9-complete-backend-source)

## 1. Architecture and current status

**Project:** Samvedna — SIH 26093 / NHAA 14566 distress-screening prototype.

```text
React client → FastAPI /api/* → MongoDB
                    ├── Offline SVI scoring
                    ├── Bilingual complaint text
                    ├── Fernet encryption: audio, attachments, chat
                    ├── Twilio / SMTP OTP adapters
                    └── VAPID browser push

backend/
├── server.py
├── svi_engine.py
├── complaint_gen.py
├── crypto_util.py
├── push_util.py
├── requirements.txt
├── .env.example           # create from the template below; safe to share
└── .env                   # private local values; NEVER upload
```

- All **32 custom API operations** are listed below; paths include `/api`.
- **MOCKED / DEV MODE:** SMS, WhatsApp and email OTP delivery when provider credentials are absent. OTPs are exposed in responses and development logs in this mode.
- **MOCKED:** escalation records use `mock_submitted_to_NHAA`; there is no actual NHAA/police submission API.
- SVI uses a local lexicon, voice metrics and context flags. **No LLM provider is currently connected and no LLM API key is required.**
- Server-side complaint export currently includes `.txt` drafts, not PDF/DOCX. Frontend downloads are a separate implementation.
- Push has an implemented adapter; delivery still requires valid VAPID keys, a supported browser and notification permission. Live provider delivery is not verified by this document.

The five Python files in section 9 are complete snapshots, not abbreviated examples. Save each code block under its displayed filename to reconstruct the implementation. This Markdown file itself is documentation, not a Python executable. Source comments are preserved even where legacy wording is inaccurate; sections 6–7 clarify those details.

## 2. Local setup

### Requirements

- Python 3.11 (the current workspace uses Python 3.11).
- An accessible MongoDB instance; keep credentials in your private `.env`.
- The five Python modules from section 9.

Create `backend/requirements.txt` with the following **portable runtime subset**. These pins match packages installed in the current workspace. This is intentionally not the entire workspace package freeze: unrelated LLM/payment libraries and workspace-specific package URLs are omitted. A clean installation on another machine has not been tested in this documentation task.

```text
fastapi==0.110.1
uvicorn==0.25.0
motor==3.3.1
pymongo==4.6.3
pydantic==2.13.5
email-validator==2.3.0
python-dotenv==1.2.4
PyJWT==2.15.1
cryptography==50.0.2
pywebpush==2.5.0
py-vapid==1.9.4
twilio==9.11.2
```

`reportlab` and `python-docx` are already installed in the app workspace but are **not used by the current backend complaint generator**. They are not needed to run this source snapshot.

From your reconstructed `backend/` folder:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
```

On Windows PowerShell, activate with `.\.venv\Scripts\Activate.ps1` and copy with `Copy-Item .env.example .env`.

Replace the required placeholders in `.env`. Load it **before importing the application**:

```bash
python -c 'from dotenv import load_dotenv; load_dotenv(".env"); import os, uvicorn; uvicorn.run("server:app", host=os.environ["BACKEND_HOST"], port=int(os.environ["BACKEND_PORT"]))'
```

`BACKEND_HOST` and `BACKEND_PORT` are launcher settings introduced by this guide, not variables read by `server.py`. Set them for your own local environment. This command is for a separate local checkout; do not start a second server inside an already managed running workspace.

**Why preload the environment?** `server.py` imports `crypto_util.py` before calling `load_dotenv()`, and that module constructs its Fernet instance at import time. Preloading ensures it uses your real `AUDIO_ENC_KEY`, not the legacy fallback.

On a direct local backend connection, FastAPI exposes `/docs`, `/redoc` and `/openapi.json`. These paths are not under `/api`, so a frontend/API split proxy may not route them to FastAPI unless explicitly configured.

## 3. Environment variables and API keys

### 3.1 Shareable `backend/.env.example`

Copy the following into `.env.example`. Copy that file to `.env` locally and replace every `<...>` value. Optional provider settings are blank deliberately: fake non-empty provider values can incorrectly disable DEV MODE and cause delivery failures.

```dotenv
MONGO_URL=<your-private-mongodb-connection-string>
DB_NAME=<your-database-name>
JWT_SECRET=<generate-a-long-random-secret-locally>
AUDIO_ENC_KEY=<generate-a-fernet-key-locally>
CORS_ORIGINS=<your-exact-frontend-origin>
BACKEND_HOST=<your-local-bind-address>
BACKEND_PORT=<your-local-backend-port>
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=
TWILIO_WHATSAPP_FROM=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_PEM_PATH=
VAPID_CONTACT=
```

| Variable | Purpose / where to obtain it | Handling |
|---|---|---|
| `MONGO_URL` | Connection URI from your MongoDB installation/provider | Private; may contain database credentials |
| `DB_NAME` | Your database name | Required; keep the variable name unchanged |
| `JWT_SECRET` | Locally generated token-signing secret | Private; always override the built-in development fallback |
| `AUDIO_ENC_KEY` | Locally generated Fernet key | Private; securely back it up; changing it breaks decryption of existing data unless migrated |
| `CORS_ORIGINS` | Exact allowed frontend origins, comma-separated, without spaces | Use explicit origins; avoid wildcard for credentialed requests |
| `BACKEND_HOST`, `BACKEND_PORT` | Local launcher bind address and port | Used by the setup command above only |
| `TWILIO_ACCOUNT_SID` | Twilio account console | Backend configuration; not a browser value |
| `TWILIO_AUTH_TOKEN` | Twilio account console | Private |
| `TWILIO_VERIFY_SERVICE_SID` | Twilio Verify service configuration | Required for the implemented SMS-send branch; live verification caveat below |
| `TWILIO_WHATSAPP_FROM` | Your Twilio WhatsApp sender, with `whatsapp:` prefix | Required for the implemented WhatsApp branch |
| `SMTP_HOST`, `SMTP_PORT` | Your email provider's SMTP settings | Current code uses STARTTLS; not an implicit SMTP-SSL connection |
| `SMTP_USER` | SMTP account/login | Backend only |
| `SMTP_PASS` | Provider-approved SMTP password/app password | Private |
| `SMTP_FROM` | Authorized sender email address | Set explicitly rather than relying on a fallback |
| `VAPID_PUBLIC_KEY` | Public application-server key from your generated VAPID pair | May be sent to the browser through `/api/push/public-key` |
| `VAPID_PRIVATE_PEM_PATH` | Path to the matching private PEM file on the server | Private file must exist and be readable by the backend |
| `VAPID_CONTACT` | Contact URI, such as `mailto:<your-admin-email>` | Set to your real contact; not an API token |

Generate fresh secrets **on your own machine** (these commands print newly generated keys; do not paste their output into this document or GitHub):

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Use the first output for `JWT_SECRET`, the second for `AUDIO_ENC_KEY`. These commands do not alter the application's existing credentials. Do not regenerate the encryption key for an existing database without a migration plan.

For browser push, the installed `py-vapid` CLI supports:

```bash
vapid --gen --private-key <private-pem-path-outside-git>
vapid --applicationServerKey --private-key <same-private-pem-path>
```

Replace the angle-bracket arguments with a real path before running these commands. Save the private PEM outside the repository, put its path in `VAPID_PRIVATE_PEM_PATH`, and put the displayed application-server public key in `VAPID_PUBLIC_KEY`. Do not publish the private key. `VAPID_PRIVATE_KEY` is not read by this implementation.

### 3.2 DEV MODE is automatic

There is **no read of a `DEV_MODE` environment variable** in this source. The actual expression is:

```python
DEV_MODE = not (SMTP_HOST and SMTP_USER and SMTP_PASS) or not (TWILIO_SID and TWILIO_TOKEN)
```

Therefore any incomplete credential group keeps the whole API in DEV MODE, even if the other provider is configured. Each delivery function separately checks its own credentials. Merely setting non-empty strings does not prove a provider works.

**Do not enable real SMS Verify just by filling keys:** Twilio generates the SMS code, but the current local verification endpoint checks a separately generated local hash. The live SMS verification flow needs correction and testing first. WhatsApp sends the local code directly; its real delivery remains unverified here.

### 3.3 Frontend environment

The React API client must use `process.env.REACT_APP_BACKEND_URL` from its own environment. That value is the backend origin; API paths add `/api`. Never put MongoDB, JWT, SMTP, Twilio or encryption secrets into any `REACT_APP_*` variable: frontend values are public. Browser push can retrieve its public key from the API.

## 4. Complete API reference

Protected operations use:

```http
Authorization: Bearer <token-from-successful-OTP-verification>
Content-Type: application/json
```

**Access labels:** Public = no token dependency; Auth = any authenticated user; Staff = counsellor or supervisor; Supervisor = supervisor only; Case access = owning victim or any counsellor/supervisor under the current implementation. Current staff access is not limited to the assigned counsellor. `case_id` in URLs is the public `SM-...` reference, not the internal UUID `id`.

| Method | Path | Current access | Request / result |
|---|---|---|---|
| `POST` | `/api/auth/request-otp` | Public | Phone + email + channel; create dual-OTP session; DEV codes may be returned. |
| `POST` | `/api/auth/verify-mobile` | Public | Session ID + code; marks mobile verified. |
| `POST` | `/api/auth/verify-email` | Public | Session ID + code after mobile; returns JWT + user. |
| `POST` | `/api/counsellor/request-otp` | Public; registered staff email | Email; request staff OTP. |
| `POST` | `/api/counsellor/verify` | Public | Session ID + code; returns JWT + user; see validation caveats. |
| `GET` | `/api/me` | Auth | Current user profile. |
| `POST` | `/api/svi/score` | Auth | Text / metrics / flags; SVI with previous-case context. |
| `POST` | `/api/svi/live` | Public | Text / metrics / flags; stateless SVI preview. |
| `POST` | `/api/cases` | Auth | CaseCreate body; case + assessment, may broadcast Critical push. |
| `GET` | `/api/cases` | Auth; own cases | Newest first; up to 100 cases. |
| `GET` | `/api/cases/{case_id}` | Case access | Case details; writes view audit entry. |
| `PATCH` | `/api/cases/{case_id}` | Auth; missing owner guard | Optional stage / notes / accept; updated case. See limitations. |
| `POST` | `/api/cases/{case_id}/escalate` | Staff | Target + note; MOCKED handoff; marks Filed. |
| `GET` | `/api/counsellor/queue` | Staff | Up to 500 cases, descending SVI. |
| `GET` | `/api/counsellor/alerts` | Staff | Up to 50 recent alerts. |
| `GET` | `/api/supervisor/audit-log` | Supervisor | Up to 500 recent audit events. |
| `GET` | `/api/cases/{case_id}/draft` | Case access | English/Hindi draft JSON; changes stage to Drafted. |
| `GET` | `/api/cases/{case_id}/audio` | Staff | Decrypted audio base64 or null; audit entry. |
| `GET` | `/api/push/public-key` | Public | Configured VAPID public key. |
| `POST` | `/api/push/subscribe` | Staff | Browser subscription object; stores/upserts subscription. |
| `POST` | `/api/push/test` | Staff | No body; sends test push; sent/subscription counts. |
| `POST` | `/api/cases/{case_id}/attachments` | Case access | Filename + content_type + data_b64; encrypted storage; metadata. |
| `GET` | `/api/cases/{case_id}/attachments` | Case access | Attachment metadata without encrypted contents. |
| `GET` | `/api/cases/{case_id}/attachments/{att_id}` | Case access | Filename, content_type and decrypted data_b64. |
| `GET` | `/api/cases/{case_id}/export` | Case access | application/zip evidence bundle; unencrypted download. |
| `POST` | `/api/cases/{case_id}/chat` | Case access | Text; stores encrypted message; returns readable message. |
| `GET` | `/api/cases/{case_id}/chat` | Case access | Up to 500 messages, oldest first, decrypted for caller. |
| `GET` | `/api/supervisor/impact` | Supervisor | Optional days query (default 7); impact metrics, see limitations. |
| `GET` | `/api/support-directory` | Public | 10 static prototype entries with coordinates. |
| `POST` | `/api/seed` | Public; demo only | No body; inserts demo users/cases; do not use with real data. |
| `GET` | `/api/dev/last-otps` | Public while DEV MODE | Up to 5 OTP session records including hashes; not plaintext codes. |
| `GET` | `/api/` | Public | API name, dev_mode flag and helpline number. |

All listed success responses currently default to HTTP 200. Typical error statuses are 400 invalid code/input, 401 missing/invalid session token, 403 forbidden, 404 absent record, 409 mobile verification pending, 410 expired victim OTP, 413 attachment limit, 422 schema validation, and 429 OTP attempt cap. Not every status applies to every endpoint. Expiry and attempt behavior differs in the counsellor path; see limitations.

## 5. Request examples

These are request-body templates, not live credentials. Replace placeholders before use. For command-line requests, set `API_ORIGIN` in your local shell to your backend origin and `TOKEN` to your own short-lived token; do not commit those values.

```bash
curl --fail-with-body "${API_ORIGIN}/api/"
curl --fail-with-body "${API_ORIGIN}/api/me" -H "Authorization: Bearer ${TOKEN}"
```

### Victim dual OTP

`POST /api/auth/request-otp`:

```json
{"phone":"<your-phone-in-E164-format>","email":"<your-email>","channel":"sms","language":"hi"}
```

Use `channel: "whatsapp"` for the WhatsApp branch. The response contains `session_id`, `dev_mode` and `expires_at`; DEV MODE also includes `dev_mobile_otp` and `dev_email_otp`. Do not log or publish those response fields.

First call `POST /api/auth/verify-mobile`, then `POST /api/auth/verify-email` with their respective codes:

```json
{"session_id":"<session-id-from-request>","code":"<received-code>"}
```

Successful email verification returns `{ "ok": true, "token": "<jwt>", "user": { ... } }`. Existing users are located by email; new users get the victim role. Staff login uses `POST /api/counsellor/request-otp` with `{"email":"<registered-staff-email>"}`, then `/api/counsellor/verify` with the same session/code shape.

### SVI preview

Use the following body for `/api/svi/live` (public) or `/api/svi/score` (authenticated):

```json
{
  "text": "I feel afraid and need support.",
  "voice_metrics": {"pitch_variation":0.4,"pause_ratio":0.3,"speech_rate":0.5,"rms_energy":0.4,"pitch_jitter":0.2},
  "threat_present": false,
  "isolation": true
}
```

`voice_metrics` is optional. The authenticated operation includes the user's count of prior cases; the public preview uses zero prior cases. Responses include `svi`, `level`, `factors`, `confidence`, `safety_override` and `breakdown`.

### Create / update / escalate a case

`POST /api/cases`:

```json
{
  "category":"discrimination",
  "narrative":"I need support with discrimination at work.",
  "language":"en",
  "voice_metrics":null,
  "threat_present":false,
  "isolation":false,
  "timeline":"<incident date or description>",
  "location":"<location>",
  "proof_files":[],
  "voice_consent":false,
  "audio_b64":null
}
```

Category labels defined by the complaint generator: `physical`, `caste`, `property`, `social_boycott`, `sexual`, `discrimination`. The request schema currently accepts arbitrary strings rather than an enum. Use the attachment endpoint for actual evidence file contents, not `proof_files` metadata. The case response includes `id`, `case_id`, `assessment`, `stage` and timestamps.

`PATCH /api/cases/{case_id}` body: `{"stage":"Under Review","notes":"<case note>","accept":true}`. Fields are optional; `accept` assigns the current staff user. **This route currently lacks an owner/role guard for stage and notes; do not expose it to untrusted users without fixing authorization.**

`POST /api/cases/{case_id}/escalate` (Staff): `{"target":"counselling","note":"<handoff note>"}`. Intended targets are `law_enforcement`, `counselling`, `rehab`; schema accepts a string. Response status is **MOCKED** (`mock_submitted_to_NHAA`).

### Attachments / chat / export

- `POST /api/cases/{case_id}/attachments`: `{"filename":"evidence.txt","content_type":"text/plain","data_b64":"<raw-file-base64-without-data-URL-prefix>"}`. The limit is 8,000,000 base64 characters (about 6 MB of raw data), not 8 MB of raw file bytes. Response contains metadata and the attachment UUID.
- `GET /api/cases/{case_id}/attachments/{att_id}` returns `filename`, `content_type`, `data_b64`; it is JSON, not a raw file stream.
- `POST /api/cases/{case_id}/chat`: `{"text":"I would like to discuss my case."}`. Empty/whitespace-only messages are rejected. Responses contain decrypted text for authorized readers; storage is encrypted at rest.
- `GET /api/cases/{case_id}/audio` is staff-only and returns `{ "audio_b64": "<base64-or-null>" }`.
- `GET /api/cases/{case_id}/draft` returns `english`, `hindi`, `category`, `case_id` and **updates the case stage to Drafted**.
- `GET /api/cases/{case_id}/export` returns a ZIP containing `metadata.json`, two complaint `.txt` files, `narrative.txt`, optional decrypted audio and attachments, and a README. **The downloaded ZIP is unencrypted and contains sensitive evidence.**

```bash
curl --fail-with-body "${API_ORIGIN}/api/cases/${CASE_ID}/export" \
  -H "Authorization: Bearer ${TOKEN}" \
  --output "Samvedna-${CASE_ID}.zip"
```

### Push / impact

`POST /api/push/subscribe` accepts the browser's `PushSubscription.toJSON()` under the `subscription` key:

```json
{"subscription":{"endpoint":"<browser-push-endpoint>","expirationTime":null,"keys":{"p256dh":"<browser-public-key>","auth":"<browser-subscription-auth>"}}}
```

Browser subscription secrets must remain private. `POST /api/push/test` requires no request body and returns `ok`, `sent`, `subs`. A successful HTTP response with `sent: 0` does not prove delivery.

`GET /api/supervisor/impact?days=7` returns `window_days`, `total_cases`, `critical_cases`, `daily`, `svi_distribution`, `categories`, `avg_time_to_escalation_min`, `total_escalations`. Current metric limitations are below.

## 6. Data, scoring and encryption

| MongoDB collection | Main purpose |
|---|---|
| `users` | User identity, contact fields, role and language |
| `otp_sessions` | Hashed OTPs, verification flags, attempts and expiry |
| `cases` | Narrative, assessment, timeline, stage, notes, encrypted audio and attachments |
| `escalations` | Mock handoff records |
| `alerts` | Critical-case alerts |
| `chat_messages` | Case discussion with `text_encrypted` |
| `push_subscriptions` | Browser endpoints, subscription keys, staff ownership |
| `audit_log` | User actions, targets, metadata and timestamps |

SVI combines `0.45 × text + 0.35 × voice + 0.20 × context`. Without voice metrics, weights are text `0.70`, voice `0.00`, context `0.30`. Thresholds: Low <30, Moderate <55, High <80, Critical >=80. Recognized self-harm/direct-threat indicators raise a below-High score to 60. The `threat_present` flag alone affects context and does not trigger that text safety override.

**Clinical limitation:** this is an unvalidated heuristic triage prototype, not a diagnosis or a reliable measure of individual risk. Its `confidence` field is a heuristic signal-count value, not a calibrated clinical probability. Human review is necessary; the tool must not replace emergency response or qualified support.

**Encryption accuracy:** Fernet uses **AES-128-CBC + HMAC-SHA256**, not AES-256-GCM. Its encoded key contains 32 bytes split between encryption and authentication. Old source comments calling this “AES-256” are inaccurate. Audio, attachment contents and chat text use Fernet; narratives, contact fields, case notes and some metadata are still stored in plaintext. This is server-side encryption at rest, **not end-to-end encryption**.

## 7. Important prototype limitations

These observations document the existing source; this task does not change runtime behavior or constitute a full audit.

1. **Live SMS OTP needs a fix:** Twilio Verify's generated code is not validated through Twilio's verification-check API. The local hash is for another code. Non-empty keys alone will not complete a working live SMS flow.
2. **Counsellor OTP checks are incomplete:** the verification route lacks the victim route's expiry check and does not enforce `role_hint` or one-time consumption. OTP generation uses `random`, and there is no per-user/IP request throttling. Attempt limits do not replace request rate limiting.
3. **Case-update authorization is incomplete:** `PATCH /api/cases/{case_id}` accepts any authenticated user for stage/notes. Staff case access elsewhere is broad, not assignment-limited.
4. **Development endpoints are unsafe for real data:** `/api/seed` is public, and `/api/dev/last-otps` returns recent session metadata and hashes when DEV MODE is active. They need removal or strict access control outside isolated demonstrations.
5. **Secret-loading and defaults:** preload `.env` before application import, set unique secrets explicitly and avoid legacy fallback keys. This snapshot does not fail fast for every missing secret. Losing or changing the active encryption key can make existing evidence unreadable.
6. **Escalation is MOCKED; SVI has no LLM; backend PDF/DOCX generation is not implemented.** Support directory entries are static prototype data and should be verified before real referrals.
7. **Impact metrics have limits:** the first case projection omits `case_id`, so time-to-escalation matching cannot work reliably and the average can stay null. `total_escalations` counts all loaded escalations, not only those inside `days`. Queries are capped at 2,000 records and `days` lacks bounds validation.
8. **Data-access/export limits:** case lists and chat have fixed caps rather than pagination. Export decrypts evidence; attachment failures may be silently skipped. The ZIP must be handled privately and checked for completeness.
9. **Unverified external delivery:** real SMTP, WhatsApp and push behavior needs provider-specific end-to-end testing. OTP send failures are currently not surfaced as request errors. Victim push subscriptions are not implemented.

Prior reports recorded 48/48 backend tests passing. That historical result does not cover all the limitations above and is not a claim that this documentation task re-ran the complete application suite.

## 8. GitHub sharing checklist

- Upload **this `BACKEND_GITHUB.md` file** for the requested single-file handoff. It uses placeholders for configuration and contains no private environment values.
- Before sharing an entire reconstructed backend, use `.env.example` for placeholders and keep `.env` private. Add the following patterns to your repository's `.gitignore`:

```gitignore
.env
.env.*
**/.env
**/.env.*
!.env.example
!**/.env.example
*.pem
*.key
.secrets/
.venv/
__pycache__/
*.pyc
*.log
*.zip
memory/test_credentials.md
```

- **This document does not modify your existing repository's ignore rules or history.** Check them before sharing the whole repository. `.gitignore` does not remove secrets already tracked or previously committed.
- Do not upload actual database URIs, JWT/encryption/SMTP/Twilio secrets, VAPID private PEMs, OTPs, tokens, private test credentials, evidence exports, recordings or victim data.
- If a secret has ever been committed, revoke/rotate it and address repository history exposure; merely deleting its current line is not sufficient. Preserve the ability to decrypt existing evidence when rotating an encryption key.
- A public VAPID key and a backend origin are not private credentials, but no workspace-specific values are needed in this handoff.
- For a future improvement, add automated secret scanning and API regression checks to your repository workflow.

## 9. Complete backend source

**Snapshot policy:** the following five modules are copied verbatim from the app at generation time. They are intentionally unchanged, including prototype defaults and limitations. No `.env` file is copied. Source file hashes below let you compare future versions.

| Source file | SHA-256 |
|---|---|
| `backend/server.py` | `1a4dae583f445a0c8963b1b5d1d4ecb751852b6582074fc5b7847143268f757d` |
| `backend/svi_engine.py` | `cdf5632275ea212844ae864ca832381dd090ee8db7d5bdf0c07def13d9aa63ff` |
| `backend/complaint_gen.py` | `59383e161a9253f52336520d630008e114f13e1d1cea739a1ab457c3fdb18e6f` |
| `backend/crypto_util.py` | `8a07b33f1be7dc1e4eef72575e697dd46872ae1836c524b8a9a39c6c14aa402b` |
| `backend/push_util.py` | `1acd360f1295855526c989271e6e5574b4e0ff8cba1fdfd13445c798b5310c99` |

### `backend/server.py`

```python
"""
Samvedna / संवेदना — Backend
FastAPI + MongoDB
Features: Dual OTP auth (mobile + email, DEV MODE fallback), SVI engine,
case management, counsellor portal, audit log, complaint drafts.
"""
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, status
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
import os
import uuid
import hashlib
import random
import logging
import json
import jwt
import smtplib
from email.message import EmailMessage

from svi_engine import compute_svi
from complaint_gen import build_draft, CATEGORY_LABEL
from crypto_util import encrypt_audio, decrypt_audio
from push_util import broadcast_critical, send_push
import io
import zipfile
import base64 as _b64
from fastapi.responses import StreamingResponse

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ.get("JWT_SECRET", "samvedna-dev-secret-change-me")
JWT_ALG = "HS256"
JWT_HOURS = 24

TWILIO_SID = os.environ.get("TWILIO_ACCOUNT_SID")
TWILIO_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
TWILIO_VERIFY_SID = os.environ.get("TWILIO_VERIFY_SERVICE_SID")
TWILIO_WA_FROM = os.environ.get("TWILIO_WHATSAPP_FROM")

SMTP_HOST = os.environ.get("SMTP_HOST")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER")
SMTP_PASS = os.environ.get("SMTP_PASS")
SMTP_FROM = os.environ.get("SMTP_FROM", SMTP_USER or "no-reply@samvedna.local")

DEV_MODE = not (SMTP_HOST and SMTP_USER and SMTP_PASS) or not (TWILIO_SID and TWILIO_TOKEN)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
log = logging.getLogger("samvedna")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Samvedna / संवेदना API")
api = APIRouter(prefix="/api")


# ---------- Helpers ----------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode()).hexdigest()


def gen_otp() -> str:
    return f"{random.randint(0, 9999):04d}"


def make_jwt(payload: dict) -> str:
    p = dict(payload)
    p["exp"] = datetime.now(timezone.utc) + timedelta(hours=JWT_HOURS)
    return jwt.encode(p, JWT_SECRET, algorithm=JWT_ALG)


def decode_jwt(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except Exception:
        return None


async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1]
    payload = decode_jwt(token)
    if not payload or "user_id" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def audit(user_id: str, action: str, target: str = "", meta: Optional[dict] = None):
    await db.audit_log.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "action": action,
        "target": target,
        "meta": meta or {},
        "timestamp": now_iso(),
    })


# ---------- Models ----------
class OTPRequest(BaseModel):
    phone: str
    email: EmailStr
    channel: str = "sms"  # sms | whatsapp
    language: Optional[str] = "en"


class OTPVerifyMobile(BaseModel):
    session_id: str
    code: str


class OTPVerifyEmail(BaseModel):
    session_id: str
    code: str


class CounsellorLogin(BaseModel):
    email: EmailStr


class CounsellorLoginVerify(BaseModel):
    session_id: str
    code: str


class SVIRequest(BaseModel):
    text: Optional[str] = ""
    voice_metrics: Optional[Dict[str, float]] = None
    threat_present: bool = False
    isolation: bool = False


class CaseCreate(BaseModel):
    category: str
    narrative: str
    language: str = "en"
    voice_metrics: Optional[Dict[str, float]] = None
    threat_present: bool = False
    isolation: bool = False
    timeline: Optional[str] = ""
    location: Optional[str] = ""
    proof_files: Optional[List[Dict[str, Any]]] = []
    voice_consent: bool = False
    audio_b64: Optional[str] = None  # browser-captured, pseudo-encrypted at rest


class CaseUpdate(BaseModel):
    stage: Optional[str] = None
    notes: Optional[str] = None
    accept: Optional[bool] = None


class EscalateRequest(BaseModel):
    target: str  # law_enforcement | counselling | rehab
    note: Optional[str] = ""


# ---------- OTP / Auth ----------
async def send_email_otp(to_email: str, code_or_body: str, is_body: bool = False) -> bool:
    if not (SMTP_HOST and SMTP_USER and SMTP_PASS):
        log.info(f"[DEV MODE] Email to {to_email}: {code_or_body}")
        return True
    try:
        msg = EmailMessage()
        if is_body:
            msg["Subject"] = "Samvedna — Alert"
            msg.set_content(code_or_body)
        else:
            msg["Subject"] = "Samvedna — Email verification code"
            msg.set_content(
                f"Your Samvedna verification code is {code_or_body}. It expires in 5 minutes.\n\n"
                f"Samvedna / संवेदना — NHAA 14566"
            )
        msg["From"] = SMTP_FROM
        msg["To"] = to_email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
            s.starttls()
            s.login(SMTP_USER, SMTP_PASS)
            s.send_message(msg)
        return True
    except Exception as e:
        log.error(f"SMTP error: {e}")
        return False


async def send_sms_otp(phone: str, code: str, channel: str = "sms") -> bool:
    if not (TWILIO_SID and TWILIO_TOKEN):
        log.info(f"[DEV MODE] {channel.upper()} OTP for {phone}: {code}")
        return True
    try:
        from twilio.rest import Client  # type: ignore
        tc = Client(TWILIO_SID, TWILIO_TOKEN)
        if channel == "whatsapp" and TWILIO_WA_FROM:
            tc.messages.create(
                from_=TWILIO_WA_FROM,
                to=f"whatsapp:{phone}",
                body=f"Samvedna code: {code} (expires in 5 min)",
            )
        else:
            if TWILIO_VERIFY_SID:
                tc.verify.v2.services(TWILIO_VERIFY_SID).verifications.create(to=phone, channel="sms")
        return True
    except Exception as e:
        log.error(f"Twilio error: {e}")
        return False


@api.post("/auth/request-otp")
async def request_otp(req: OTPRequest):
    session_id = str(uuid.uuid4())
    mobile_code = gen_otp()
    email_code = gen_otp()
    expires = (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat()

    await db.otp_sessions.insert_one({
        "id": session_id,
        "phone": req.phone,
        "email": req.email,
        "channel": req.channel,
        "language": req.language,
        "mobile_hash": hash_otp(mobile_code),
        "email_hash": hash_otp(email_code),
        "mobile_verified": False,
        "email_verified": False,
        "attempts_mobile": 0,
        "attempts_email": 0,
        "expires_at": expires,
        "created_at": now_iso(),
    })

    await send_sms_otp(req.phone, mobile_code, req.channel)
    await send_email_otp(req.email, email_code)

    resp = {"session_id": session_id, "dev_mode": DEV_MODE, "expires_at": expires}
    if DEV_MODE:
        resp["dev_mobile_otp"] = mobile_code
        resp["dev_email_otp"] = email_code
    return resp


@api.post("/auth/verify-mobile")
async def verify_mobile(payload: OTPVerifyMobile):
    session = await db.otp_sessions.find_one({"id": payload.session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["attempts_mobile"] >= 3:
        raise HTTPException(status_code=429, detail="Max attempts exceeded")
    if datetime.fromisoformat(session["expires_at"]) < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="OTP expired")
    await db.otp_sessions.update_one({"id": payload.session_id}, {"$inc": {"attempts_mobile": 1}})
    if hash_otp(payload.code) != session["mobile_hash"]:
        raise HTTPException(status_code=400, detail="Invalid mobile OTP")
    await db.otp_sessions.update_one({"id": payload.session_id}, {"$set": {"mobile_verified": True}})
    return {"ok": True, "step": "email_pending"}


@api.post("/auth/verify-email")
async def verify_email(payload: OTPVerifyEmail):
    session = await db.otp_sessions.find_one({"id": payload.session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if not session.get("mobile_verified"):
        raise HTTPException(status_code=409, detail="Verify mobile first")
    if session["attempts_email"] >= 3:
        raise HTTPException(status_code=429, detail="Max attempts exceeded")
    if datetime.fromisoformat(session["expires_at"]) < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="OTP expired")
    await db.otp_sessions.update_one({"id": payload.session_id}, {"$inc": {"attempts_email": 1}})
    if hash_otp(payload.code) != session["email_hash"]:
        raise HTTPException(status_code=400, detail="Invalid email OTP")
    await db.otp_sessions.update_one({"id": payload.session_id}, {"$set": {"email_verified": True}})

    user = await db.users.find_one({"email": session["email"]}, {"_id": 0})
    if not user:
        user = {
            "id": str(uuid.uuid4()),
            "phone": session["phone"],
            "email": session["email"],
            "name": "",
            "role": "victim",
            "language": session.get("language", "en"),
            "created_at": now_iso(),
            "masked_phone": session["phone"][:3] + "****" + session["phone"][-2:],
        }
        await db.users.insert_one(dict(user))
    token = make_jwt({"user_id": user["id"], "role": user["role"]})
    await audit(user["id"], "login", "self")
    return {"ok": True, "token": token, "user": user}


# ---------- Counsellor Login (email OTP only) ----------
@api.post("/counsellor/request-otp")
async def counsellor_request_otp(req: CounsellorLogin):
    user = await db.users.find_one({"email": req.email, "role": {"$in": ["counsellor", "supervisor"]}}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Not a registered counsellor")
    session_id = str(uuid.uuid4())
    code = gen_otp()
    expires = (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat()
    await db.otp_sessions.insert_one({
        "id": session_id,
        "email": req.email,
        "role_hint": user["role"],
        "mobile_hash": "",
        "email_hash": hash_otp(code),
        "mobile_verified": True,
        "email_verified": False,
        "attempts_email": 0,
        "attempts_mobile": 0,
        "expires_at": expires,
        "created_at": now_iso(),
    })
    await send_email_otp(req.email, code)
    resp = {"session_id": session_id, "dev_mode": DEV_MODE, "expires_at": expires}
    if DEV_MODE:
        resp["dev_email_otp"] = code
    return resp


@api.post("/counsellor/verify")
async def counsellor_verify(payload: CounsellorLoginVerify):
    session = await db.otp_sessions.find_one({"id": payload.session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["attempts_email"] >= 3:
        raise HTTPException(status_code=429, detail="Max attempts")
    await db.otp_sessions.update_one({"id": payload.session_id}, {"$inc": {"attempts_email": 1}})
    if hash_otp(payload.code) != session["email_hash"]:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    user = await db.users.find_one({"email": session["email"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    token = make_jwt({"user_id": user["id"], "role": user["role"]})
    await audit(user["id"], "counsellor_login", "self")
    return {"ok": True, "token": token, "user": user}


@api.get("/me")
async def me(current=Depends(get_current_user)):
    return current


# ---------- SVI live scoring ----------
@api.post("/svi/score")
async def svi_score(req: SVIRequest, current=Depends(get_current_user)):
    repeat = await db.cases.count_documents({"user_id": current["id"]})
    ctx = {"threat_present": req.threat_present, "isolation": req.isolation, "repeat_contact": repeat}
    result = compute_svi(req.text or "", req.voice_metrics, ctx)
    return result


@api.post("/svi/live")
async def svi_live(req: SVIRequest):
    ctx = {"threat_present": req.threat_present, "isolation": req.isolation, "repeat_contact": 0}
    return compute_svi(req.text or "", req.voice_metrics, ctx)


# ---------- Cases ----------
def _case_id() -> str:
    return "SM-" + "".join(random.choices("0123456789", k=4))


def _pseudo_encrypt(data: Optional[str]) -> Optional[str]:
    if not data:
        return None
    return encrypt_audio(data)


@api.post("/cases")
async def create_case(body: CaseCreate, current=Depends(get_current_user)):
    repeat = await db.cases.count_documents({"user_id": current["id"]})
    ctx = {"threat_present": body.threat_present, "isolation": body.isolation, "repeat_contact": repeat}
    assessment = compute_svi(body.narrative or "", body.voice_metrics, ctx)
    case_id = _case_id()
    case = {
        "id": str(uuid.uuid4()),
        "case_id": case_id,
        "user_id": current["id"],
        "user_masked": current.get("masked_phone", ""),
        "category": body.category,
        "narrative": body.narrative,
        "language": body.language,
        "voice_metrics": body.voice_metrics,
        "voice_consent": body.voice_consent,
        "threat_present": body.threat_present,
        "isolation": body.isolation,
        "timeline": body.timeline,
        "location": body.location,
        "proof_files": body.proof_files or [],
        "audio_encrypted": _pseudo_encrypt(body.audio_b64),
        "assessment": assessment,
        "stage": "Logged",
        "stages_completed": ["Logged"],
        "assigned_counsellor_id": None,
        "notes": [],
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    await db.cases.insert_one(dict(case))
    await audit(current["id"], "case_create", case["id"], {"svi": assessment["svi"]})

    if assessment["level"] == "Critical":
        await db.alerts.insert_one({
            "id": str(uuid.uuid4()),
            "case_id": case["case_id"],
            "message": f"CRITICAL case #{case['case_id']} - SVI {assessment['svi']}",
            "created_at": now_iso(),
            "read": False,
        })
        try:
            await broadcast_critical(db, case)
        except Exception as _e:
            log.error(f"push broadcast fail: {_e}")

    case.pop("audio_encrypted", None)
    case.pop("_id", None)
    return case


@api.get("/cases")
async def list_cases(current=Depends(get_current_user)):
    cases = await db.cases.find({"user_id": current["id"]}, {"_id": 0, "audio_encrypted": 0}).sort("created_at", -1).to_list(100)
    return cases


@api.get("/cases/{case_id}")
async def get_case(case_id: str, current=Depends(get_current_user)):
    case = await db.cases.find_one({"case_id": case_id}, {"_id": 0, "audio_encrypted": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if current["role"] == "victim" and case["user_id"] != current["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    await audit(current["id"], "case_view", case["id"])
    return case


@api.patch("/cases/{case_id}")
async def update_case(case_id: str, body: CaseUpdate, current=Depends(get_current_user)):
    case = await db.cases.find_one({"case_id": case_id}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Not found")
    updates = {"updated_at": now_iso()}
    stages_set = set(case.get("stages_completed", []))
    if body.stage:
        updates["stage"] = body.stage
        stages_set.add(body.stage)
        updates["stages_completed"] = list(stages_set)
    if body.notes is not None:
        new_notes = case.get("notes", []) + [{"text": body.notes, "by": current["id"], "at": now_iso()}]
        updates["notes"] = new_notes
    if body.accept and current["role"] in ("counsellor", "supervisor"):
        updates["assigned_counsellor_id"] = current["id"]
    await db.cases.update_one({"case_id": case_id}, {"$set": updates})
    await audit(current["id"], "case_update", case["id"], {k: v for k, v in updates.items() if k != "notes"})
    return await db.cases.find_one({"case_id": case_id}, {"_id": 0, "audio_encrypted": 0})


@api.post("/cases/{case_id}/escalate")
async def escalate_case(case_id: str, body: EscalateRequest, current=Depends(get_current_user)):
    if current["role"] not in ("counsellor", "supervisor"):
        raise HTTPException(status_code=403, detail="Not permitted")
    case = await db.cases.find_one({"case_id": case_id}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Not found")
    hand_off = {
        "id": str(uuid.uuid4()),
        "case_id": case_id,
        "target": body.target,
        "note": body.note,
        "status": "mock_submitted_to_NHAA",
        "by": current["id"],
        "at": now_iso(),
    }
    await db.escalations.insert_one(dict(hand_off))
    stages = list(set(case.get("stages_completed", []) + ["Filed"]))
    await db.cases.update_one({"case_id": case_id}, {"$set": {"stage": "Filed", "updated_at": now_iso(), "stages_completed": stages}})
    await audit(current["id"], "escalate", case["id"], {"target": body.target})
    return hand_off


# ---------- Counsellor Portal ----------
@api.get("/counsellor/queue")
async def counsellor_queue(current=Depends(get_current_user)):
    if current["role"] not in ("counsellor", "supervisor"):
        raise HTTPException(status_code=403, detail="Not permitted")
    cases = await db.cases.find({}, {"_id": 0, "audio_encrypted": 0}).to_list(500)
    cases.sort(key=lambda c: -c.get("assessment", {}).get("svi", 0))
    return cases


@api.get("/counsellor/alerts")
async def counsellor_alerts(current=Depends(get_current_user)):
    if current["role"] not in ("counsellor", "supervisor"):
        raise HTTPException(status_code=403, detail="Not permitted")
    alerts = await db.alerts.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return alerts


@api.get("/supervisor/audit-log")
async def audit_log_endpoint(current=Depends(get_current_user)):
    if current["role"] != "supervisor":
        raise HTTPException(status_code=403, detail="Supervisor only")
    logs = await db.audit_log.find({}, {"_id": 0}).sort("timestamp", -1).to_list(500)
    return logs


# ---------- Complaint Draft ----------
@api.get("/cases/{case_id}/draft")
async def get_draft(case_id: str, current=Depends(get_current_user)):
    case = await db.cases.find_one({"case_id": case_id}, {"_id": 0, "audio_encrypted": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Not found")
    if current["role"] == "victim" and case["user_id"] != current["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    user = await db.users.find_one({"id": case["user_id"]}, {"_id": 0, "name": 1, "phone": 1, "email": 1})
    user_safe = {"name": user.get("name") if user else "", "phone": user.get("phone") if user else "", "email": user.get("email") if user else ""}
    draft = build_draft({**case, "user": user_safe})
    stages = list(set(case.get("stages_completed", []) + ["Drafted"]))
    await db.cases.update_one({"case_id": case_id}, {"$set": {"stage": "Drafted", "updated_at": now_iso(), "stages_completed": stages}})
    await audit(current["id"], "draft_view", case["id"])
    return draft


# ---------- Audio playback (counsellor only) ----------
@api.get("/cases/{case_id}/audio")
async def get_audio(case_id: str, current=Depends(get_current_user)):
    if current["role"] not in ("counsellor", "supervisor"):
        raise HTTPException(status_code=403, detail="Not permitted")
    case = await db.cases.find_one({"case_id": case_id}, {"_id": 0, "audio_encrypted": 1})
    if not case:
        raise HTTPException(status_code=404, detail="Not found")
    token = case.get("audio_encrypted")
    if not token:
        return {"audio_b64": None}
    try:
        b64 = decrypt_audio(token)
    except ValueError:
        raise HTTPException(status_code=500, detail="Audio corrupt")
    await audit(current["id"], "audio_play", case_id)
    return {"audio_b64": b64}


# ---------- Push Subscriptions ----------
class PushSub(BaseModel):
    subscription: Dict[str, Any]


@api.get("/push/public-key")
async def push_public_key():
    return {"public_key": os.environ.get("VAPID_PUBLIC_KEY", "")}


@api.post("/push/subscribe")
async def push_subscribe(body: PushSub, current=Depends(get_current_user)):
    if current["role"] not in ("counsellor", "supervisor"):
        raise HTTPException(status_code=403, detail="Not permitted")
    endpoint = body.subscription.get("endpoint")
    if not endpoint:
        raise HTTPException(status_code=400, detail="Missing endpoint")
    await db.push_subscriptions.update_one(
        {"endpoint": endpoint},
        {"$set": {
            "endpoint": endpoint,
            "user_id": current["id"],
            "role": current["role"],
            "subscription": body.subscription,
            "updated_at": now_iso(),
        }},
        upsert=True,
    )
    await audit(current["id"], "push_subscribe", endpoint[:60])
    return {"ok": True}


@api.post("/push/test")
async def push_test(current=Depends(get_current_user)):
    if current["role"] not in ("counsellor", "supervisor"):
        raise HTTPException(status_code=403, detail="Not permitted")
    subs = await db.push_subscriptions.find({"user_id": current["id"]}, {"_id": 0}).to_list(10)
    sent = 0
    for s in subs:
        if send_push(s["subscription"], {"title": "Samvedna Test Push", "body": "This is a test notification.", "url": "/counsellor"}):
            sent += 1
    return {"ok": True, "sent": sent, "subs": len(subs)}


# ---------- Attachments (encrypted) ----------
class AttachmentCreate(BaseModel):
    filename: str
    content_type: str
    data_b64: str  # raw file b64 (not data-url)


@api.post("/cases/{case_id}/attachments")
async def add_attachment(case_id: str, body: AttachmentCreate, current=Depends(get_current_user)):
    case = await db.cases.find_one({"case_id": case_id}, {"_id": 0, "user_id": 1})
    if not case:
        raise HTTPException(status_code=404, detail="Not found")
    if current["role"] == "victim" and case["user_id"] != current["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    if len(body.data_b64) > 8_000_000:  # ~6 MB raw
        raise HTTPException(status_code=413, detail="File too large (max ~6 MB)")
    att = {
        "id": str(uuid.uuid4()),
        "filename": body.filename,
        "content_type": body.content_type,
        "size_b64": len(body.data_b64),
        "encrypted": encrypt_audio(body.data_b64),  # same AES/Fernet pipeline
        "uploaded_by": current["id"],
        "uploaded_at": now_iso(),
    }
    await db.cases.update_one({"case_id": case_id}, {"$push": {"attachments": att}})
    await audit(current["id"], "attachment_add", case_id, {"filename": body.filename})
    att.pop("encrypted", None)
    return att


@api.get("/cases/{case_id}/attachments")
async def list_attachments(case_id: str, current=Depends(get_current_user)):
    case = await db.cases.find_one({"case_id": case_id}, {"_id": 0, "user_id": 1, "attachments": 1})
    if not case:
        raise HTTPException(status_code=404, detail="Not found")
    if current["role"] == "victim" and case["user_id"] != current["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    atts = case.get("attachments", []) or []
    return [{k: v for k, v in a.items() if k != "encrypted"} for a in atts]


@api.get("/cases/{case_id}/attachments/{att_id}")
async def download_attachment(case_id: str, att_id: str, current=Depends(get_current_user)):
    case = await db.cases.find_one({"case_id": case_id}, {"_id": 0, "user_id": 1, "attachments": 1})
    if not case:
        raise HTTPException(status_code=404, detail="Not found")
    if current["role"] == "victim" and case["user_id"] != current["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    for a in (case.get("attachments") or []):
        if a.get("id") == att_id:
            try:
                data_b64 = decrypt_audio(a["encrypted"])
            except ValueError:
                raise HTTPException(status_code=500, detail="Attachment corrupt")
            await audit(current["id"], "attachment_download", case_id, {"filename": a.get("filename")})
            return {"filename": a["filename"], "content_type": a["content_type"], "data_b64": data_b64}
    raise HTTPException(status_code=404, detail="Attachment not found")


# ---------- Govt Export Pack (zip bundle) ----------
@api.get("/cases/{case_id}/export")
async def export_case(case_id: str, current=Depends(get_current_user)):
    case = await db.cases.find_one({"case_id": case_id}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Not found")
    if current["role"] == "victim" and case["user_id"] != current["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    user = await db.users.find_one({"id": case["user_id"]}, {"_id": 0, "name": 1, "phone": 1, "email": 1})
    user_safe = {"name": user.get("name") if user else "", "phone": user.get("phone") if user else "", "email": user.get("email") if user else ""}
    draft = build_draft({**case, "user": user_safe})

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        # Metadata
        meta = {
            "case_id": case["case_id"],
            "category": case["category"],
            "assessment": case.get("assessment"),
            "stages_completed": case.get("stages_completed"),
            "stage": case.get("stage"),
            "created_at": case.get("created_at"),
            "updated_at": case.get("updated_at"),
            "timeline": case.get("timeline"),
            "location": case.get("location"),
            "threat_present": case.get("threat_present"),
            "isolation": case.get("isolation"),
            "complainant": user_safe,
            "notes": case.get("notes", []),
            "disclaimer": "Samvedna / संवेदना — SIH 26093 · NHAA 14566. Informational draft, not legal advice.",
        }
        zf.writestr(f"{case_id}/metadata.json", json.dumps(meta, ensure_ascii=False, indent=2))
        zf.writestr(f"{case_id}/complaint-english.txt", draft["english"])
        zf.writestr(f"{case_id}/complaint-hindi.txt", draft["hindi"])

        # Narrative transcript
        zf.writestr(f"{case_id}/narrative.txt", case.get("narrative", "") or "")

        # Audio (decrypted for the bundle, with warning)
        if case.get("audio_encrypted"):
            try:
                audio_b64 = decrypt_audio(case["audio_encrypted"])
                zf.writestr(f"{case_id}/audio.webm", _b64.b64decode(audio_b64))
            except Exception:
                zf.writestr(f"{case_id}/audio.error.txt", "Audio could not be decrypted.")

        # Attachments
        for a in (case.get("attachments") or []):
            try:
                data_b64 = decrypt_audio(a["encrypted"])
                raw = _b64.b64decode(data_b64)
                safe_name = a["filename"].replace("/", "_").replace("\\", "_")
                zf.writestr(f"{case_id}/attachments/{safe_name}", raw)
            except Exception:
                pass

        # README
        zf.writestr(f"{case_id}/README.txt",
            "SAMVEDNA EVIDENCE PACK\n"
            f"Case #{case_id} · generated {now_iso()}\n\n"
            "Contents:\n"
            " - metadata.json : case + assessment metadata\n"
            " - complaint-english.txt / complaint-hindi.txt : bilingual complaint draft\n"
            " - narrative.txt : victim's narrative transcript\n"
            " - audio.webm : voice recording (if provided)\n"
            " - attachments/ : encrypted-at-rest proof files, decrypted for this pack\n\n"
            "This evidence pack is intended for legal-aid officers and law-enforcement handoff.\n"
            "Please handle with appropriate confidentiality under the SC/ST (PoA) Act, 1989.\n"
        )

    buf.seek(0)
    await audit(current["id"], "export_pack", case_id)
    headers = {"Content-Disposition": f'attachment; filename="Samvedna-{case_id}.zip"'}
    return StreamingResponse(iter([buf.getvalue()]), media_type="application/zip", headers=headers)


# ---------- Case Chat (encrypted) ----------
class ChatMessageIn(BaseModel):
    text: str


@api.post("/cases/{case_id}/chat")
async def send_chat(case_id: str, body: ChatMessageIn, current=Depends(get_current_user)):
    case = await db.cases.find_one({"case_id": case_id}, {"_id": 0, "user_id": 1, "assigned_counsellor_id": 1, "assessment": 1, "category": 1})
    if not case:
        raise HTTPException(status_code=404, detail="Not found")
    if current["role"] == "victim" and case["user_id"] != current["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    if not (body.text or "").strip():
        raise HTTPException(status_code=400, detail="Empty message")

    msg = {
        "id": str(uuid.uuid4()),
        "case_id": case_id,
        "author_id": current["id"],
        "author_role": current["role"],
        "author_name": current.get("name") or current.get("email"),
        "text_encrypted": encrypt_audio(body.text),  # same Fernet pipeline
        "created_at": now_iso(),
    }
    await db.chat_messages.insert_one(dict(msg))
    await audit(current["id"], "chat_send", case_id)

    # Push to the other party if critical/high
    if current["role"] == "counsellor" or current["role"] == "supervisor":
        # notify victim via push if subscribed (not implemented for victims yet) - skip
        pass
    else:
        # alert assigned counsellor if any
        try:
            if case.get("assigned_counsellor_id"):
                subs = await db.push_subscriptions.find({"user_id": case["assigned_counsellor_id"]}, {"_id": 0}).to_list(10)
                for s in subs:
                    send_push(s["subscription"], {"title": f"New message · #{case_id}", "body": body.text[:80], "url": f"/counsellor/{case_id}"})
        except Exception as _e:
            log.error(f"chat push fail: {_e}")

    msg.pop("text_encrypted", None)
    msg["text"] = body.text
    return msg


@api.get("/cases/{case_id}/chat")
async def list_chat(case_id: str, current=Depends(get_current_user)):
    case = await db.cases.find_one({"case_id": case_id}, {"_id": 0, "user_id": 1})
    if not case:
        raise HTTPException(status_code=404, detail="Not found")
    if current["role"] == "victim" and case["user_id"] != current["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    rows = await db.chat_messages.find({"case_id": case_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    out = []
    for r in rows:
        try:
            r["text"] = decrypt_audio(r.pop("text_encrypted", ""))
        except Exception:
            r["text"] = "[corrupt]"
        out.append(r)
    return out


# ---------- Supervisor Impact Dashboard ----------
@api.get("/supervisor/impact")
async def impact_metrics(days: int = 7, current=Depends(get_current_user)):
    if current["role"] != "supervisor":
        raise HTTPException(status_code=403, detail="Supervisor only")
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=days)
    all_cases = await db.cases.find({}, {"_id": 0, "created_at": 1, "assessment": 1, "stage": 1, "stages_completed": 1, "updated_at": 1, "notes": 1}).to_list(2000)

    # Daily case counts
    daily: Dict[str, int] = {}
    for d in range(days):
        key = (now - timedelta(days=days - 1 - d)).strftime("%Y-%m-%d")
        daily[key] = 0

    svi_bucket = {"Low": 0, "Moderate": 0, "High": 0, "Critical": 0}
    total = 0
    time_to_escalate_sec = []

    escalations = await db.escalations.find({}, {"_id": 0}).to_list(2000)
    esc_by_case = {}
    for e in escalations:
        esc_by_case.setdefault(e["case_id"], e)

    cat_count: Dict[str, int] = {}
    for c in all_cases:
        try:
            created = datetime.fromisoformat(c["created_at"].replace("Z", "+00:00"))
        except Exception:
            continue
        if created < cutoff:
            continue
        total += 1
        d_key = created.strftime("%Y-%m-%d")
        if d_key in daily:
            daily[d_key] += 1
        lvl = (c.get("assessment") or {}).get("level") or "Low"
        if lvl in svi_bucket:
            svi_bucket[lvl] += 1
        # category — need from c; fetch below
        esc = esc_by_case.get(c.get("case_id") or "")
        if esc:
            try:
                esc_at = datetime.fromisoformat(esc["at"].replace("Z", "+00:00"))
                time_to_escalate_sec.append((esc_at - created).total_seconds())
            except Exception:
                pass

    # Pull category counts (second pass to avoid heavy nested)
    all_cases_cat = await db.cases.find({}, {"_id": 0, "category": 1, "created_at": 1}).to_list(2000)
    for c in all_cases_cat:
        try:
            created = datetime.fromisoformat(c["created_at"].replace("Z", "+00:00"))
        except Exception:
            continue
        if created < cutoff:
            continue
        cat_count[c.get("category") or "other"] = cat_count.get(c.get("category") or "other", 0) + 1

    avg_tte = round(sum(time_to_escalate_sec) / len(time_to_escalate_sec) / 60, 1) if time_to_escalate_sec else None  # minutes
    return {
        "window_days": days,
        "total_cases": total,
        "critical_cases": svi_bucket["Critical"],
        "daily": [{"date": k, "count": v} for k, v in daily.items()],
        "svi_distribution": [{"level": k, "count": v} for k, v in svi_bucket.items()],
        "categories": [{"name": k, "count": v} for k, v in cat_count.items()],
        "avg_time_to_escalation_min": avg_tte,
        "total_escalations": len(escalations),
    }


# ---------- Support Directory ----------
SUPPORT_DIRECTORY = [
    {"id": "cnl-1", "type": "counsellor", "name": "Dr. Meera Krishnan", "phone": "+91-98100-12345", "lang": ["en", "hi", "ta"], "city": "Delhi", "lat": 28.6139, "lng": 77.2090},
    {"id": "cnl-2", "type": "counsellor", "name": "Priyanka Deshmukh", "phone": "+91-98201-67890", "lang": ["hi", "mr"], "city": "Mumbai", "lat": 19.0760, "lng": 72.8777},
    {"id": "law-1", "type": "legal_aid", "name": "District Legal Services Authority — Lucknow", "phone": "+91-522-2612345", "lang": ["hi", "en"], "city": "Lucknow", "lat": 26.8467, "lng": 80.9462},
    {"id": "law-2", "type": "legal_aid", "name": "National Legal Services Authority (NALSA)", "phone": "15100", "lang": ["hi", "en"], "city": "New Delhi", "lat": 28.6139, "lng": 77.2090},
    {"id": "law-3", "type": "legal_aid", "name": "DLSA Jaipur", "phone": "+91-141-2227489", "lang": ["hi"], "city": "Jaipur", "lat": 26.9124, "lng": 75.7873},
    {"id": "law-4", "type": "legal_aid", "name": "DLSA Patna", "phone": "+91-612-2219035", "lang": ["hi"], "city": "Patna", "lat": 25.5941, "lng": 85.1376},
    {"id": "reh-1", "type": "rehab", "name": "Ambedkar Rehabilitation Centre", "phone": "+91-141-2234561", "lang": ["hi"], "city": "Jaipur", "lat": 26.9124, "lng": 75.7873},
    {"id": "reh-2", "type": "rehab", "name": "Dr. B.R. Ambedkar Foundation", "phone": "+91-11-23350517", "lang": ["hi", "en"], "city": "New Delhi", "lat": 28.6139, "lng": 77.2090},
    {"id": "reh-3", "type": "rehab", "name": "SC/ST Welfare Centre, Hyderabad", "phone": "+91-40-23237778", "lang": ["te", "en"], "city": "Hyderabad", "lat": 17.3850, "lng": 78.4867},
    {"id": "reh-4", "type": "rehab", "name": "Dalit Rehab Mission, Chennai", "phone": "+91-44-28223311", "lang": ["ta", "en"], "city": "Chennai", "lat": 13.0827, "lng": 80.2707},
]


@api.get("/support-directory")
async def support_directory():
    return SUPPORT_DIRECTORY


# ---------- Seed ----------
@api.post("/seed")
async def seed():
    users_cnt = await db.users.count_documents({})
    cases_cnt = await db.cases.count_documents({})
    if users_cnt and cases_cnt:
        return {"ok": True, "already_seeded": True}

    counsellors = [
        {"id": str(uuid.uuid4()), "name": "Priya Sharma", "email": "priya.counsellor@samvedna.in", "phone": "+911111000011", "role": "counsellor", "language": "hi", "created_at": now_iso(), "masked_phone": "+91****0011"},
        {"id": str(uuid.uuid4()), "name": "Dr. R. Verma (Supervisor)", "email": "verma.supervisor@samvedna.in", "phone": "+911111000012", "role": "supervisor", "language": "en", "created_at": now_iso(), "masked_phone": "+91****0012"},
    ]
    for c in counsellors:
        await db.users.update_one({"email": c["email"]}, {"$setOnInsert": c}, upsert=True)

    victim = {
        "id": str(uuid.uuid4()),
        "name": "Demo Victim",
        "email": "victim.demo@samvedna.in",
        "phone": "+919999988888",
        "role": "victim",
        "language": "hi",
        "created_at": now_iso(),
        "masked_phone": "+91****8888",
    }
    await db.users.update_one({"email": victim["email"]}, {"$setOnInsert": victim}, upsert=True)
    v = await db.users.find_one({"email": victim["email"]}, {"_id": 0})

    demo_cases = [
        {"category": "caste", "narrative": "वो मुझे गाली देते हैं और धमकी देते हैं कि जान से मार देंगे। मैं बहुत डरा हुआ हूँ। कोई मेरी सुनता नहीं।", "threat_present": True, "isolation": True},
        {"category": "physical", "narrative": "They attacked me yesterday near the fields. I was beaten and threatened. I am scared to leave home.", "threat_present": True, "isolation": False},
        {"category": "property", "narrative": "They are trying to evict our family from the ancestral land using force and pressure.", "threat_present": False, "isolation": True},
        {"category": "social_boycott", "narrative": "Humara bahishkar kar diya gaya hai. Koi dukandar saaman nahi deta. Hum majboor hain.", "threat_present": False, "isolation": True},
        {"category": "discrimination", "narrative": "At the workplace my manager uses casteist slurs and denies me promotions. I feel harassed daily.", "threat_present": False, "isolation": False},
    ]
    seeded = []
    for d in demo_cases:
        repeat = await db.cases.count_documents({"user_id": v["id"]})
        ctx = {"threat_present": d["threat_present"], "isolation": d["isolation"], "repeat_contact": repeat}
        assess = compute_svi(d["narrative"], None, ctx)
        case = {
            "id": str(uuid.uuid4()),
            "case_id": _case_id(),
            "user_id": v["id"],
            "user_masked": v["masked_phone"],
            "category": d["category"],
            "narrative": d["narrative"],
            "language": "hi",
            "voice_metrics": None,
            "voice_consent": False,
            "threat_present": d["threat_present"],
            "isolation": d["isolation"],
            "timeline": "2 weeks ago",
            "location": "Lucknow, Uttar Pradesh",
            "proof_files": [],
            "audio_encrypted": None,
            "assessment": assess,
            "stage": "Logged",
            "stages_completed": ["Logged"],
            "assigned_counsellor_id": None,
            "notes": [],
            "created_at": now_iso(),
            "updated_at": now_iso(),
        }
        await db.cases.insert_one(case)
        seeded.append(case["case_id"])
    return {"ok": True, "seeded_cases": seeded, "counsellors": [c["email"] for c in counsellors], "victim": victim["email"]}


@api.get("/dev/last-otps")
async def last_otps():
    if not DEV_MODE:
        raise HTTPException(status_code=403, detail="Not available")
    rows = await db.otp_sessions.find({}, {"_id": 0}).sort("created_at", -1).to_list(5)
    return rows


# ---------- Root ----------
@api.get("/")
async def root():
    return {"name": "Samvedna / संवेदना API", "dev_mode": DEV_MODE, "helpline": 14566}


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown():
    client.close()
```

### `backend/svi_engine.py`

```python
"""
Samvedna SVI (Severe Vulnerability Index) Engine
Offline-first scoring: 0.45*text + 0.35*voice + 0.20*context
"""
from typing import Dict, List, Optional

# Multilingual distress lexicons (English, Hindi, Hinglish) with weights
LEXICON = {
    "self_harm": {
        "weight": 3.0,
        "terms": [
            "suicide", "kill myself", "end my life", "hurt myself", "self harm",
            "atmahatya", "jaan de dunga", "jaan dedungi", "khatam kar", "mar jaunga", "mar jaungi",
            "आत्महत्या", "जान दे दूँगा", "जान दे दूँगी", "मर जाऊँगा", "खत्म कर", "ज़िंदगी खत्म",
        ],
    },
    "direct_threat": {
        "weight": 2.5,
        "terms": [
            "they will kill", "they threatened", "death threat", "will murder", "beat me", "attacked",
            "jaan se maarenge", "maar denge", "khatam kar denge", "dhamki", "humla", "pit gaya", "pit gayi",
            "जान से मारेंगे", "मार देंगे", "धमकी", "हमला", "पीटा", "मारा", "जला देंगे",
        ],
    },
    "fear": {
        "weight": 2.0,
        "terms": [
            "scared", "afraid", "terrified", "fearful", "anxious", "panic",
            "dar", "darr", "darta", "darti", "ghabrahat", "bhay",
            "डर", "डरता", "डरती", "घबराहट", "भय", "सहमा", "सहमी",
        ],
    },
    "hopelessness": {
        "weight": 2.2,
        "terms": [
            "no hope", "hopeless", "helpless", "give up", "nothing left", "can't go on",
            "koi umeed nahi", "kuch nahi bacha", "haar gaya", "haar gayi", "majboor",
            "कोई उम्मीद नहीं", "कुछ नहीं बचा", "हार गया", "हार गई", "मजबूर", "बेबस",
        ],
    },
    "isolation": {
        "weight": 1.8,
        "terms": [
            "alone", "nobody", "no one", "isolated", "abandoned", "boycott", "shunned",
            "akela", "akeli", "koi nahi", "bahishkar", "sabne chhod diya",
            "अकेला", "अकेली", "कोई नहीं", "बहिष्कार", "सबने छोड़ दिया", "समाज से बाहर",
        ],
    },
    "intimidation": {
        "weight": 1.9,
        "terms": [
            "harassed", "stalked", "followed", "pressured", "forced", "coerced",
            "pareshan", "tang", "majbur", "dabav", "zabardasti",
            "परेशान", "तंग", "दबाव", "ज़बरदस्ती", "धमकाया",
        ],
    },
    "caste_abuse": {
        "weight": 2.0,
        "terms": [
            "untouchable", "casteist slur", "jaati", "dalit abuse", "dalit slur",
            "jaat ke naam", "neech jaati", "chamar", "bhangi",
            "जाति", "नीच जाति", "अछूत", "दलित गाली",
        ],
    },
}

NEGATIONS = ["not", "no", "never", "nahi", "mat", "नहीं", "मत", "ना"]


def _normalize(text: str) -> str:
    return (text or "").lower()


def analyze_text(text: str) -> Dict:
    """Return text-based distress score 0-100 and hits per category."""
    if not text:
        return {"score": 0.0, "hits": {}, "self_harm": False, "threat": False}

    norm = _normalize(text)
    tokens = norm.split()
    hits: Dict[str, int] = {}
    weighted_sum = 0.0

    for cat, data in LEXICON.items():
        count = 0
        for term in data["terms"]:
            t = term.lower()
            if t in norm:
                # Negation-aware: skip if preceded by negation within 3 tokens
                idx = norm.find(t)
                prefix = norm[max(0, idx - 30):idx].split()
                recent = prefix[-3:] if prefix else []
                if any(n in recent for n in NEGATIONS):
                    continue
                count += 1
        if count:
            hits[cat] = count
            weighted_sum += count * data["weight"]

    # Normalize: cap at ~15 weighted points => 100
    score = min(100.0, (weighted_sum / 15.0) * 100.0)
    return {
        "score": round(score, 1),
        "hits": hits,
        "self_harm": "self_harm" in hits,
        "threat": "direct_threat" in hits,
    }


def analyze_voice(metrics: Optional[Dict]) -> Dict:
    """
    Voice metrics expected (all 0..1 normalized from browser Web Audio):
      pitch_variation, pause_ratio, speech_rate, rms_energy, pitch_jitter
    Returns distress score 0-100.
    """
    if not metrics:
        return {"score": 0.0, "available": False}

    pv = float(metrics.get("pitch_variation", 0))
    pr = float(metrics.get("pause_ratio", 0))
    sr = float(metrics.get("speech_rate", 0))
    rms = float(metrics.get("rms_energy", 0))
    jit = float(metrics.get("pitch_jitter", 0))

    # Weighted blend of distress indicators
    raw = (pv * 0.25) + (pr * 0.20) + (sr * 0.15) + (rms * 0.15) + (jit * 0.25)
    score = min(100.0, max(0.0, raw * 100.0))
    return {
        "score": round(score, 1),
        "available": True,
        "components": {
            "pitch_variation": pv,
            "pause_ratio": pr,
            "speech_rate": sr,
            "rms_energy": rms,
            "pitch_jitter": jit,
        },
    }


def analyze_context(ctx: Dict) -> Dict:
    """
    Context flags:
      threat_present, isolation, repeat_contact (count of prior cases)
    """
    threat = bool(ctx.get("threat_present"))
    isolation = bool(ctx.get("isolation"))
    repeat = int(ctx.get("repeat_contact", 0))

    score = 0.0
    if threat:
        score += 40
    if isolation:
        score += 25
    score += min(35.0, repeat * 10.0)
    score = min(100.0, score)
    return {"score": round(score, 1), "threat_present": threat, "isolation": isolation, "repeat_contact": repeat}


def level_from_score(score: float) -> str:
    if score >= 80:
        return "Critical"
    if score >= 55:
        return "High"
    if score >= 30:
        return "Moderate"
    return "Low"


def compute_svi(
    text: str,
    voice_metrics: Optional[Dict] = None,
    context: Optional[Dict] = None,
) -> Dict:
    """Main entry point. Returns {svi, level, factors[], confidence, breakdown}."""
    text_res = analyze_text(text or "")
    voice_res = analyze_voice(voice_metrics)
    ctx_res = analyze_context(context or {})

    # Weights
    w_text, w_voice, w_ctx = 0.45, 0.35, 0.20
    if not voice_res["available"]:
        # Redistribute voice weight to text (keeping proportions): text gets +0.25, ctx gets +0.10
        w_text = 0.70
        w_voice = 0.0
        w_ctx = 0.30

    svi = w_text * text_res["score"] + w_voice * voice_res["score"] + w_ctx * ctx_res["score"]
    svi = round(min(100.0, max(0.0, svi)), 1)

    level = level_from_score(svi)

    # Safety override
    safety_override = False
    if text_res["self_harm"] or text_res["threat"]:
        if svi < 55:
            svi = max(svi, 60.0)
            level = "High"
            safety_override = True

    # Top 3 factors (explainable)
    factors: List[Dict] = []
    for cat, count in sorted(text_res["hits"].items(), key=lambda x: -x[1]):
        factors.append({
            "label": cat.replace("_", " ").title(),
            "signal": "text",
            "impact": round(count * LEXICON[cat]["weight"], 2),
            "detail": f"Detected {count} indicator(s) in the narrative",
        })
    if voice_res["available"] and voice_res["score"] > 25:
        factors.append({
            "label": "Vocal Distress",
            "signal": "voice",
            "impact": round(voice_res["score"] / 10, 2),
            "detail": "Elevated pitch jitter and pause irregularity detected",
        })
    if ctx_res["threat_present"]:
        factors.append({
            "label": "Active Threat",
            "signal": "context",
            "impact": 4.0,
            "detail": "Reported ongoing threat or recent incident",
        })
    if ctx_res["isolation"]:
        factors.append({
            "label": "Social Isolation",
            "signal": "context",
            "impact": 2.5,
            "detail": "Reports feeling isolated or boycotted",
        })
    if ctx_res["repeat_contact"] > 0:
        factors.append({
            "label": "Repeat Contact",
            "signal": "context",
            "impact": min(3.5, ctx_res["repeat_contact"]),
            "detail": f"{ctx_res['repeat_contact']} prior case(s) on record",
        })
    factors = factors[:3]

    # Confidence: higher when more signals present
    signal_count = int(voice_res["available"]) + int(bool((text or "").strip())) + int(bool(context))
    confidence = round(min(0.95, 0.5 + signal_count * 0.15), 2)

    return {
        "svi": svi,
        "level": level,
        "factors": factors,
        "confidence": confidence,
        "safety_override": safety_override,
        "breakdown": {
            "text": text_res,
            "voice": voice_res,
            "context": ctx_res,
            "weights": {"text": w_text, "voice": w_voice, "context": w_ctx},
        },
    }
```

### `backend/complaint_gen.py`

```python
"""Complaint draft generation (bilingual Hindi + English text)."""
from datetime import datetime, timezone


CATEGORY_LABEL = {
    "physical": ("Physical Violence", "शारीरिक हिंसा"),
    "caste": ("Caste-based Abuse / Threats", "जाति आधारित दुर्व्यवहार / धमकी"),
    "property": ("Land / Property / Eviction", "भूमि / संपत्ति / बेदखली"),
    "social_boycott": ("Social Boycott / Economic Harassment", "सामाजिक बहिष्कार / आर्थिक उत्पीड़न"),
    "sexual": ("Sexual Violence", "यौन हिंसा"),
    "discrimination": ("Discrimination at Work / School", "कार्यस्थल / विद्यालय में भेदभाव"),
}


def build_draft(case: dict) -> dict:
    """Return bilingual complaint text dict with english and hindi keys."""
    cat_key = case.get("category", "other")
    cat_en, cat_hi = CATEGORY_LABEL.get(cat_key, ("Other", "अन्य"))

    user = case.get("user", {}) or {}
    name = user.get("name") or "[Complainant Name]"
    phone = user.get("phone") or "[Mobile]"
    email = user.get("email") or "[Email]"
    case_id = case.get("case_id", "SM-XXXX")
    date = datetime.now(timezone.utc).strftime("%d %B %Y")
    narrative = case.get("narrative") or case.get("transcript") or "[Narrative not provided]"
    timeline = case.get("timeline") or "[Timeline not provided]"
    location = case.get("location") or "[Location]"

    english = f"""
To,
The Station House Officer,
[Police Station], {location}

Date: {date}
Case Reference: #{case_id}

Subject: Formal Complaint Regarding {cat_en} under the SC/ST (Prevention of Atrocities) Act, 1989 and relevant provisions of the Bharatiya Nyaya Sanhita.

Respected Sir/Madam,

I, {name}, resident of {location}, mobile {phone}, email {email}, hereby lodge this formal complaint seeking immediate action against the offenders.

INCIDENT CATEGORY: {cat_en}

NARRATIVE OF EVENTS:
{narrative}

TIMELINE / DATE OF INCIDENT:
{timeline}

I request the following relief:
1. Immediate registration of First Information Report (FIR) under appropriate sections of the SC/ST (PoA) Act, 1989.
2. Protection of myself and my family from further intimidation or retaliation.
3. Medical examination and preservation of evidence where applicable.
4. Referral to the District Legal Services Authority for free legal aid under the Legal Services Authorities Act, 1987.
5. Compensation and rehabilitation as provided under Section 15A of the SC/ST (PoA) Act, 1989.

I declare that the above statement is true to the best of my knowledge. I am willing to assist the investigation in any manner required.

Yours faithfully,
{name}
Mobile: {phone}
Date: {date}

[Signature]

Note: This document is a drafted template generated via the Samvedna / संवेदना platform (NHAA Helpline 14566). It is informational and does not substitute legal counsel. Please have it reviewed by a legal aid officer or advocate before filing.
""".strip()

    hindi = f"""
सेवा में,
थाना प्रभारी महोदय,
[पुलिस थाना], {location}

दिनांक: {date}
प्रकरण सन्दर्भ: #{case_id}

विषय: अनुसूचित जाति/अनुसूचित जनजाति (अत्याचार निवारण) अधिनियम, 1989 के अंतर्गत {cat_hi} के विरुद्ध औपचारिक शिकायत।

महोदय/महोदया,

मैं, {name}, निवासी {location}, मोबाइल {phone}, ईमेल {email}, एतद् द्वारा दोषियों के विरुद्ध त्वरित कार्यवाही हेतु यह औपचारिक शिकायत प्रस्तुत करता/करती हूँ।

घटना की श्रेणी: {cat_hi}

घटना का विवरण:
{narrative}

घटना का समय / तिथि:
{timeline}

अनुरोध है कि निम्न राहत प्रदान की जाए :
१. SC/ST (PoA) अधिनियम, 1989 की सम्बंधित धाराओं के अंतर्गत तत्काल प्रथम सूचना रिपोर्ट (FIR) दर्ज की जाए।
२. मुझे व मेरे परिवार को आगे की धमकी एवं प्रतिशोध से सुरक्षा प्रदान की जाए।
३. आवश्यकतानुसार चिकित्सकीय परीक्षण एवं साक्ष्य सुरक्षा सुनिश्चित की जाए।
४. विधिक सेवा प्राधिकरण अधिनियम, 1987 के अंतर्गत निःशुल्क विधिक सहायता हेतु ज़िला विधिक सेवा प्राधिकरण को प्रेषण।
५. SC/ST (PoA) अधिनियम की धारा 15A के अंतर्गत मुआवज़ा एवं पुनर्वास।

मैं यह घोषणा करता/करती हूँ कि उपरोक्त विवरण मेरे जान-कारी के अनुसार सत्य है। मैं जाँच में हर संभव सहयोग करने को तैयार हूँ।

भवदीय,
{name}
मोबाइल: {phone}
दिनांक: {date}

[हस्ताक्षर]

टिप्पणी: यह दस्तावेज़ Samvedna / संवेदना मंच (NHAA हेल्पलाइन 14566) द्वारा निर्मित एक मसौदा मात्र है। यह केवल सूचनात्मक है और विधिक परामर्श का विकल्प नहीं है। कृपया फाइल करने से पूर्व किसी विधिक सहायता अधिकारी या अधिवक्ता से इसकी समीक्षा करवाएँ।
""".strip()

    return {"english": english, "hindi": hindi, "category": cat_key, "case_id": case_id}
```

### `backend/crypto_util.py`

```python
"""AES-256 audio encryption using Fernet (AES-128-CBC + HMAC-SHA256, equivalent protection level).
For true AES-256-GCM switch to cryptography.hazmat primitives with 32-byte key.
"""
import os
import base64
from cryptography.fernet import Fernet, InvalidToken


def _get_key() -> bytes:
    k = os.environ.get("AUDIO_ENC_KEY", "")
    if not k:
        # Fallback: derive from JWT_SECRET to keep behaviour deterministic in tests
        import hashlib
        derived = hashlib.sha256((os.environ.get("JWT_SECRET", "samvedna") + "-audio").encode()).digest()
        return base64.urlsafe_b64encode(derived)
    return k.encode()


_fernet = Fernet(_get_key())


def encrypt_audio(b64_audio: str) -> str:
    """Accept base64 audio string, return Fernet ciphertext (urlsafe-b64 token)."""
    if not b64_audio:
        return ""
    token = _fernet.encrypt(b64_audio.encode())
    return token.decode()


def decrypt_audio(token: str) -> str:
    """Return the original base64 audio string from a Fernet token."""
    if not token:
        return ""
    try:
        return _fernet.decrypt(token.encode()).decode()
    except InvalidToken:
        raise ValueError("Invalid audio token")
```

### `backend/push_util.py`

```python
"""Web Push + file-attachment helpers + evidence zip export."""
import os
import json
import logging
from typing import Optional, List, Dict
from pywebpush import webpush, WebPushException

log = logging.getLogger("samvedna.push")


def send_push(subscription: dict, payload: dict) -> bool:
    """Send a web-push notification to one subscription."""
    priv = os.environ.get("VAPID_PRIVATE_PEM_PATH")
    contact = os.environ.get("VAPID_CONTACT", "mailto:admin@samvedna.local")
    if not priv or not os.path.exists(priv):
        log.warning("VAPID_PRIVATE_PEM_PATH missing or invalid; skipping push")
        return False
    try:
        with open(priv) as f:
            pem = f.read()
        webpush(
            subscription_info=subscription,
            data=json.dumps(payload),
            vapid_private_key=pem,
            vapid_claims={"sub": contact},
        )
        return True
    except WebPushException as e:
        log.error(f"webpush fail: {e}")
        return False
    except Exception as e:
        log.error(f"push unknown fail: {e}")
        return False


async def broadcast_critical(db, case: dict):
    """Send push to every counsellor + supervisor subscription."""
    subs = await db.push_subscriptions.find({}, {"_id": 0}).to_list(500)
    payload = {
        "title": f"CRITICAL · Case #{case['case_id']}",
        "body": f"SVI {case['assessment']['svi']} · {case['category']}",
        "url": f"/counsellor/{case['case_id']}",
    }
    sent = 0
    for s in subs:
        if send_push(s["subscription"], payload):
            sent += 1
    return sent
```

