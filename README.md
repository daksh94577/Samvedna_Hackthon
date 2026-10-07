# Samvedna / संवेदना

**SIH 26093 · NHAA 14566** — a real-time, AI-powered distress-screening platform for victims of caste-based violence. Mobile-first PWA with dual OTP auth, voice/text intake, offline SVI (Severe Vulnerability Index) scoring, bilingual (Hindi + English) complaint drafting, counsellor portal and supervisor audit log.

Live stack in this prototype: **React + FastAPI + MongoDB** (platform default). The product spec requirements (schema, flow, UX) are faithfully implemented.

---

## Quick Start (local, platform-managed)

Services are run by supervisor. Hot reload is enabled for both frontend and backend.

```
# Already running:
#  - Backend  (FastAPI)  : 0.0.0.0:8001
#  - Frontend (React)    : :3000  (served through platform ingress)
#  - MongoDB             : :27017

# Seed demo data (idempotent):
curl -X POST $REACT_APP_BACKEND_URL/api/seed
```

Demo accounts (after seed):
- Victim OTP flow: use **any** phone + email. In DEV MODE the OTPs are shown on-screen.
- Counsellor: `priya.counsellor@samvedna.in`
- Supervisor: `verma.supervisor@samvedna.in`

---

## 2-Minute Demo Script

1. **/** → pick language (हिंदी or Hinglish).
2. **Login** → enter any phone + email → OTPs shown via DEV toast → verify mobile → verify email.
3. **Home** → tap *Start Now · शुरू करें*.
4. **Category** → pick "Caste-based Abuse".
5. **Consent** → *Allow Voice Input*.
6. **Record** → press mic, speak distress ("वो मुझे धमकी देते हैं कि जान से मार देंगे"), stop, continue.
7. **Verify** → confirm category / narrative / add proof → *Yes, That's Right*.
8. **Assessment** → see SVI gauge (likely **High/Critical**), factors, rights card, bilingual "What this means".
9. **Next Steps** → *Talk to Senior Counsellor* then *Tap to Call 14566*.
10. **Complaint Draft** → preview bilingual draft, download **PDF** / **DOCX**.
11. **Case Timeline** — stage pills light up as you progress.
12. **Counsellor Portal** → Logout → open `/counsellor` → OTP login (DEV OTP visible) → see your case at top of SVI queue → open detail → Accept / Add note / Escalate.
13. **Supervisor** → log in as supervisor to see the full audit log.

---

## Env & Keys (DEV MODE is default)

Backend `/app/backend/.env`:

```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="samvedna_db"
CORS_ORIGINS="*"
JWT_SECRET="change-me-in-prod"

# Optional — fill to disable DEV MODE
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=you@gmail.com
```

- **DEV MODE** (default): all OTPs are printed to the backend console *and* bounced to the client's dev toast. Everything is testable without any 3rd-party credentials.
- **Gmail app password**: Google Account → Security → 2-Step Verification → App passwords.
- **Twilio Verify**: Console → Verify → create Service → copy `TWILIO_VERIFY_SERVICE_SID`.
- **Twilio WhatsApp Sandbox**: Console → Messaging → Try WhatsApp → copy sandbox `whatsapp:+1xxx` number.

---

## Features Implemented

- **Dual OTP auth** (mobile + email, 4-digit boxes, 30s resend, 5-min expiry, hashed OTP, max 3 attempts, rate-limited, speech-synthesis audio help).
- **10-language picker** (full strings for English, Hindi, Hinglish; others fall back to English).
- **Victim flow** — Language → Login → Home → Category → Consent → Record (voice + text + live waveform) → Verify (Step 3 of 4) → Assessment (SVI gauge + factors + rights) → Next Steps → Complaint Draft (PDF + DOCX) → Case Timeline (Logged → Verified → Guidance → Drafted → Filed → Follow-up).
- **AI SVI engine** (offline, FastAPI):
  - `0.45 · text + 0.35 · voice + 0.20 · context` (text-only redistributes weight).
  - Multilingual lexicon (fear, hopelessness, threat, isolation, self-harm, intimidation, caste-abuse) with negation-aware matching.
  - Voice metrics computed in browser (Web Audio API): pitch variation, pause ratio, speech rate, RMS energy, pitch jitter.
  - Context: active threat, isolation, repeat contact.
  - Safety override: any self-harm or direct-threat hit forces at least *High*.
  - Returns `{svi, level, factors[], confidence, breakdown}`.
- **Counsellor portal** (`/counsellor`, roles: `counsellor`, `supervisor`, email OTP login) — SVI-sorted priority queue, filters by level, case detail with transcript, factors, timeline, Accept / Escalate (mock NHAA hand-off) / Notes / Status.
- **Operator-assist** (`/operator`) — live SVI meter while operator types or dictates call notes.
- **Supervisor audit log** (`/supervisor`) — every view/action logged, supervisor-only.
- **Privacy** — consent screen, pseudo-encrypted audio at rest, role-based access, audit log, masked identity on dashboard, minimal data collection.
- **PWA-friendly** — mobile frame, viewport, splash tap targets, Noto fonts.

---

## API Endpoints

- `POST /api/auth/request-otp` — generate mobile + email OTP
- `POST /api/auth/verify-mobile`
- `POST /api/auth/verify-email` → returns JWT
- `POST /api/counsellor/request-otp`, `POST /api/counsellor/verify`
- `GET /api/me`
- `POST /api/svi/score` (authed), `POST /api/svi/live` (public, for operator)
- `POST /api/cases`, `GET /api/cases`, `GET /api/cases/:case_id`, `PATCH /api/cases/:case_id`
- `POST /api/cases/:case_id/escalate` (counsellor+)
- `GET /api/cases/:case_id/draft` — bilingual complaint
- `GET /api/counsellor/queue`, `GET /api/counsellor/alerts`
- `GET /api/supervisor/audit-log`
- `GET /api/support-directory`
- `POST /api/seed`

---

## Repo Layout

```
/app
  backend/
    server.py          # FastAPI app
    svi_engine.py      # SVI scoring
    complaint_gen.py   # Bilingual complaint template
    .env
  frontend/
    src/
      components/      # Header, BottomNav, OTPInput, SVIGauge, VoiceRecorder, CaseTimeline, MobileFrame...
      context/
      lib/             # api, i18n
      pages/           # 20+ screens for victim + counsellor flows
      App.js
      index.css
```

---

## Deliverables Checklist

- [x] Working app end-to-end
- [x] Seed script (`POST /api/seed` — idempotent)
- [x] 2-minute demo script
- [x] README with SMTP / Twilio setup notes
- [x] DEV MODE fallback so the whole app is testable without any key
