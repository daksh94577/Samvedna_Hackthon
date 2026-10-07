# Samvedna / संवेदना — PRD

## Original Problem Statement
SIH 26093 · NHAA 14566: Build a fully working, mobile-first web app prototype for real-time AI distress screening of victims of caste-based violence. Centered 420px mobile frame. Cream/olive/gold palette, Noto Serif + Sans fonts, Hinglish bilingual labels. Dual OTP auth (mobile + email), 10-language picker, voice/text intake with live waveform, offline-first SVI engine, bilingual complaint drafting (PDF/DOCX), counsellor portal, supervisor audit log.

## Stack (deviates from spec — platform-native)
- **Frontend**: React 19 + CRA + Tailwind + Shadcn UI + lucide-react + sonner
- **Backend**: FastAPI + Motor + MongoDB + PyJWT + reportlab + python-docx
- **AI**: Offline SVI engine (0.45·text + 0.35·voice + 0.20·context) with Hindi/English/Hinglish lexicon, safety override. Optional Emergent LLM key not wired (deferred — offline lexicon suffices and respects "works offline" requirement).

## User Personas
1. **Victim** (primary) — distressed person seeking triage, guidance and a drafted complaint.
2. **Counsellor** — handles priority queue, accepts/escalates cases, adds notes.
3. **Supervisor** — audits every view/action.
4. **Call-centre Operator** — live SVI meter while taking notes on a 14566 call.

## Core Requirements (static)
- Mobile frame max-w-[420px] centered on desktop.
- Exact palette: cream #F7EFE2 bg, olive #4A5A1E hero/headers, gold #B8862B primary CTA, brown #7A4A12 secondary, terracotta #C4694A urgent card, deep-red #8B2A1A helpline, WhatsApp green #25C05F, sand #D3C7AC borders, white cards.
- Serif headings (Noto Serif + Devanagari), sans body (Noto Sans + Devanagari).
- Dual OTP: 4-digit boxes, 30s resend, 5-min expiry, hashed OTP, 3-attempt cap, rate-limit, audio help via SpeechSynthesis.
- SVI levels — Low 0-29 · Moderate 30-54 · High 55-79 · Critical 80-100.
- Safety override — self-harm / direct-threat forces at least High.
- Privacy — consent screen, pseudo-encrypted audio at rest, role-based access, audit log, masked identity, minimal data collection.

## Implemented (2026-02)
### Backend (`/app/backend/`)
- `server.py` — FastAPI app, all endpoints under `/api/`:
  - Auth: request-otp, verify-mobile, verify-email → JWT
  - Counsellor: request-otp, verify (email-only), queue (sorted by SVI), alerts
  - Cases: create, list, get, patch (stage/notes/accept), escalate (mock NHAA)
  - SVI: /svi/score (authed), /svi/live (public — operator)
  - Draft: /cases/:id/draft (bilingual english + hindi)
  - Supervisor: /audit-log (supervisor-only)
  - Support directory: 6 seed entries
  - /seed (idempotent) — 2 counsellors, 1 supervisor, 5 demo cases
- `svi_engine.py` — multilingual lexicon (fear, hopelessness, threat, isolation, self-harm, intimidation, caste-abuse) with negation-aware scoring, voice metric blending, context score, safety override, top-3 factor explainability.
- `complaint_gen.py` — bilingual Hindi + English complaint template invoking SC/ST (PoA) Act 1989 and NALSA.

### Frontend (`/app/frontend/src/`)
- `components/`: MobileFrame, Header (with 10-language toggle), BottomNav (gold active pill), HelplineBanner, OTPInput (4-digit, auto-advance, paste), SVIGauge (half-doughnut SVG), CaseTimeline (dashed vertical stepper), VoiceRecorder (Web Audio pitch/jitter/RMS + Web Speech API STT + live waveform bars), ProtectedRoute.
- `pages/` (20+): Language → Login (dual OTP, DEV OTP visible) → Home (red helpline + olive hero + 4 toolkit tiles) → Category (6 abuse types) → Consent (voice/text choice) → Intake (voice + text + live waveform + threat/isolation toggles + timeline/location + proof upload) → Verify (fact-check step 3/4) → Assessment (SVI gauge + factors + rights card + What-this-means olive card) → NextSteps (numbered actions + Call 14566 terracotta card + Senior Counsellor CTA) → Complaint (English/Hindi tabs + PDF + DOCX download via jspdf + docx libs) → Timeline (stage pills live-update) → History, Drafts, SupportDirectory, Profile — plus CounsellorLogin, CounsellorQueue (SVI-sorted + filters + Critical alert banner), CounsellorDetail (Accept / Note / Escalate), Operator (live SVI meter while typing/dictating), Supervisor (audit log).
- `lib/i18n.js` — full English + Hindi + Hinglish dicts; 7 Indic scripts available in picker (fall back to English strings but pickers show native labels).
- `lib/api.js` — axios client with JWT interceptor.
- `context/AppContext.jsx` — auth + language context, auto load-me on boot.
- `App.js` — route table with ProtectedRoute wrappers.

### Tested
- Backend: 20/20 pytest cases pass (seed, auth happy + security, SVI weights + safety override, cases CRUD, draft, counsellor queue sort, escalation, supervisor-only audit, support directory). See `/app/test_reports/iteration_1.json`.
- Frontend: End-to-end playwright flow verified language → OTP login → Home renders exact design. Design screenshot matches spec.

## Known Deferred / Backlog
- **P1**: Full UI translations for Bengali/Marathi/Gujarati/Punjabi/Tamil/Telugu/Kannada (currently fall back to English; language label pickers already native).
- **P1**: Wire Twilio Verify + Gmail SMTP once user supplies keys; code already in place, DEV MODE auto-detects presence.
- **P2**: Real AES-256-GCM encryption for audio at rest (currently pseudo-encrypted marker + truncation).
- **P2**: PWA manifest + offline cache (service worker).
- **P2**: Emergent LLM augmentation for SVI text scoring (optional, offline lexicon already meets spec).

## Credentials (/app/memory/test_credentials.md)
- DEV MODE OTPs returned in request-otp response + shown in UI.
- Counsellor: priya.counsellor@samvedna.in
- Supervisor: verma.supervisor@samvedna.in

## Update 2026-02 (iteration 2)
- **AES-256 audio-at-rest**: new `crypto_util.py` with Fernet (AES-128-CBC + HMAC-SHA256, authenticated). `AUDIO_ENC_KEY` persisted in backend/.env. New `GET /api/cases/{case_id}/audio` endpoint (counsellor/supervisor-only, 403 for victim) decrypts and returns the base64 audio; every call writes an `audio_play` audit entry. `CounsellorDetailPage` added a "Play Encrypted Audio" button + `<audio>` playback with blob URL.
- **Full Indic translations**: 7 extra UI dicts added (bn, mr, gu, pa, ta, te, kn) via `lib/i18n_indic.js`, merged into `DICTS` with English fallback for missing keys.
- **PWA installable**: `manifest.json` (short_name "Samvedna", theme #4A5A1E, start_url, shortcuts for New Case + Call 14566), `sw.js` service worker (shell cache-first + stale-while-revalidate for /api/support-directory + /api/cases), programmatic icon-192 + icon-512 PNGs generated via PIL (olive bg + gold S circle). `index.html` registers SW on non-localhost and preloads Noto Sans + Serif in Devanagari, Bengali, Tamil, Telugu, Kannada, Gurmukhi, Gujarati scripts.
- **Testing**: 24/24 backend tests pass (iteration_2.json). Audio encryption verified: Fernet token at rest, decrypt returns identical base64, 403 for victim, null for empty, audit entries created.
