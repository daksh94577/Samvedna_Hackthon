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

## Update 2026-02 (iteration 3)
- **Web Push**: `pywebpush` + `py-vapid` on backend. `/api/push/public-key`, `/api/push/subscribe` (counsellor/supervisor), `/api/push/test`. `push_util.py::broadcast_critical()` auto-fires when any new case has `assessment.level == "Critical"`. Service worker handles `push` + `notificationclick` events, opens `/counsellor/{case_id}`. Toggle UI in CounsellorQueuePage via `Enable Alerts / Test Alert` button.
- **Case Attachments**: new endpoints `POST /api/cases/{id}/attachments` (encrypted via same Fernet pipeline, 8 MB cap, stored in `attachments` array on the case doc), `GET .../attachments` (metadata-only), `GET .../attachments/{att_id}` (decrypt + return data_b64). ComplaintPage shows per-case list with "+ Attach" and "Decrypt & Save" buttons. Only owner / counsellor / supervisor can read; audit entries for every add/download.
- **Multilingual Voice readout**: new `lib/voice.js` with `speakText(text, langCode)` mapping 10 lang codes to BCP-47 voices. "Listen / Stop" button added on AssessmentPage (reads SVI + factors + "what this means") and NextStepsPage (reads all 4 numbered actions). Uses `SpeechSynthesisUtterance`.
- **Govt Export Pack**: new `GET /api/cases/{id}/export` returns `application/zip` streaming response with:
  - `metadata.json` — assessment, stages, timeline, location, complainant (safe fields), notes, disclaimer
  - `complaint-english.txt` + `complaint-hindi.txt` — bilingual draft
  - `narrative.txt` — raw transcript
  - `audio.webm` — decrypted recording (if any)
  - `attachments/` — decrypted proof files
  - `README.txt` — usage note + SC/ST (PoA) Act disclaimer
  ComplaintPage adds `Download .zip` + `Email Handoff` (opens mailto to nalsa-dc@nic.in with pre-filled subject/body).
- **Testing**: 38/38 backend tests pass (iteration_3.json). 14 new tests for push, attachments, export zip, RBAC, audit coverage. No regressions.

## Update 2026-02 (iteration 4)
- **Bug fix (regression)**: CategoryPage was calling `useIntakeStore((s) => s.setField)` but `setField` lives on the store object, not on state slice. Fixed by using `intakeStore.setField` directly and adding a `useIntakeActions()` convenience hook for future callers.
- **Encrypted Case Chat**: new `POST /api/cases/{id}/chat` + `GET /api/cases/{id}/chat`. Messages stored with Fernet-encrypted `text_encrypted` field (never plaintext in DB; verified via direct Mongo read). RBAC: owner-victim + counsellor/supervisor only. Victim→counsellor messages push-notify the assigned counsellor if subscribed. New `components/CaseChat.jsx` reusable (polling every 4s, left/right message bubbles, encrypted lock indicator). Embedded on both victim `TimelinePage` and `CounsellorDetailPage`.
- **Nearby Help Map**: `support-directory` payload now includes `lat`/`lng` for every entry (10 India org locations). New `/nearby` route and `NearbyMapPage` using OpenStreetMap embed (no API key), browser geolocation, haversine-sorted list, OSM directions link + Call button. Home page toolkit swapped "Support Directory" tile → "Nearby Help".
- **Impact Dashboard**: `GET /api/supervisor/impact?days=7` returns {total_cases, critical_cases, daily, svi_distribution, categories, avg_time_to_escalation_min, total_escalations}. New `/impact` supervisor-only route rendering recharts BarChart (daily volume), PieChart (SVI distribution with level colours), horizontal BarChart (categories), 4 KPI cards. CounsellorQueuePage adds an "Impact" button for supervisors.
- **Testing**: 48/48 backend tests pass (iteration_4.json). 10 new tests (Chat RBAC + encryption-at-rest + bidirectional + chronological; Impact RBAC + shape + 4 svi buckets + days-param + escalation count; Support directory lat/lng in India bounding box). Zero regressions.

## Update 2026-10-08 — Single-file GitHub backend handoff

### User request and completed scope
- User requested a separate GitHub-shareable file containing backend programming and API-key configuration, and explicitly chose `BACKEND_GITHUB.md` with complete code, endpoints, setup and placeholders rather than real secrets.
- Created `/app/BACKEND_GITHUB.md` (86,241 bytes) and an identical downloadable copy at `/app/frontend/public/BACKEND_GITHUB.md` (served at `/BACKEND_GITHUB.md` on the current preview origin).
- Document contains all five backend implementation modules verbatim, per-file SHA-256 hashes, all **32** custom API operations (correcting the handoff's count of 30), request examples, access rules, a portable runtime dependency subset, local launch instructions, and placeholders covering all **17** environment variables read by the backend. Two additional launcher variables are clearly distinguished.
- Real `.env` files, credentials, private keys, tokens, database records, uploads and evidence were not included. The existing repository's ignore rules/history were not changed; the document includes a safe `.gitignore` template and warns that already-tracked secrets remain tracked.
- No application logic, integrations, authentication credentials or database records were created or modified. No new authentication/provider integration was implemented.

### Verification performed for this documentation task
- External preview GET `/BACKEND_GITHUB.md`: HTTP 200; downloaded bytes match both local copies exactly.
- Extracted all five Python source blocks: exact source parity, valid AST syntax and matching SHA-256 hashes.
- Compared documented API table against `server.py` decorators: all 32 operations appear exactly once, with no invented routes.
- Compared environment template against all Python environment reads: 17/17 covered.
- Checked artifact against private values from existing environment files and private PEM markers: none present; Markdown fences/placeholders validated.
- External preview GET `/api/`: HTTP 200, correct application identity. Historical 48/48 application tests were not rerun for this documentation-only change; no clean-machine dependency installation or real provider delivery was tested.

### Current limitations clarified from source (not fixed in this task)
- OTP delivery without provider credentials is **MOCKED / DEV MODE**. Escalation is **MOCKED** (`mock_submitted_to_NHAA`); there is no real NHAA/police handoff integration.
- Live Twilio SMS Verify generates a different OTP from the locally stored hash; keys alone will not complete the live SMS flow.
- Counsellor verification lacks expiry, role-hint and one-time-consumption enforcement. Case PATCH lacks an owner guard for stage/notes. Public development/seed endpoints require restriction before use with real data. These are source observations, not a full security audit.
- `crypto_util.py` creates its Fernet instance before `server.py` loads `.env`; the documented local launcher preloads environment variables to avoid the fallback. Runtime was left unchanged.
- Encryption is **Fernet AES-128-CBC + HMAC-SHA256**, not AES-256-GCM. Audio, attachment contents and chat are encrypted at rest; narratives, identity fields and notes are not. This supersedes inaccurate historical “AES-256” wording above.
- Impact's first projection omits `case_id`, preventing reliable escalation matching; `total_escalations` is not restricted to the requested time window.
- Server-side ZIP complaints remain `.txt`; PDF/DOCX backend generation and LLM scoring remain unimplemented. The local SVI heuristic is not clinically validated.

### Prioritized next actions / backlog (supersedes historical deferred list)
- **Immediate user action:** Download/share only `BACKEND_GITHUB.md` as requested; do not publish actual environment files or evidence. Update both document copies whenever backend source changes.
- **P0 before real-world use:** Correct live OTP verification, staff session validation, case-update access controls and development endpoint exposure; remove secret fallbacks and make encryption-key loading explicit. These are outside the approved documentation-only scope.
- **P1:** Implement actual backend PDF/DOCX export; correct impact metric calculations; optionally add the previously discussed contextual LLM integration when requested, retaining human oversight.
- **P2:** Configure and verify actual SMS/WhatsApp/SMTP credentials after OTP fixes; modularize backend routers and add pagination as needed. PWA, translations and encrypted audio/chat/attachments are already implemented, not pending.
- **Suggested enhancement:** Automated secret scanning and API regression checks for the repository.

## Update 2026-10-08 — Frontend and remaining project GitHub package

### User request / completed scope
- User requested frontend code and the remaining project files shareable on GitHub, **excluding the already supplied backend**. Explicitly chose ZIP + `FRONTEND_GITHUB.md` with actual frontend code, icons/assets, dependencies, configuration and safe `.env.example`.
- Created `/app/SAMVEDNA_FRONTEND_GITHUB.zip` (433,243 bytes) and `/app/FRONTEND_GITHUB.md` (347,611 bytes), with identical downloadable copies in `frontend/public/` at `/SAMVEDNA_FRONTEND_GITHUB.zip` and `/FRONTEND_GITHUB.md` on the current preview origin.
- ZIP contains **119 files** under `samvedna-frontend/`: all **94 frontend source files**, **22 page components**, **46 UI library files**, **23 routes**, both PNG icons, manifest/service worker, original package.json/yarn.lock, CRACO/Tailwind/PostCSS/alias/UI configuration, and required development health helpers.
- Added export-only README/setup, public `.env.example`, safe `.gitignore`, project overview, complete declared package/service inventory, asset notes, filtered design tokens, prototype limitations and `EXPORT_MANIFEST.json` with SHA-256 checksums.
- Markdown contains **106 complete text implementation/configuration blocks** matching the ZIP. Actual PNG bytes and the full original Yarn lockfile are in the ZIP rather than repeated in Markdown. Remote Google Fonts and OpenStreetMap resources are documented, not vendored. Installed dependencies are not bundled.
- Every application source file, package manifest, lockfile and executable build configuration is unchanged. Only the **exported** `public/index.html` removes preview analytics/instrumentation; the running app's HTML is unchanged. Export README files replace generic/outdated documentation in the archive only.
- Excluded backend files, prior backend Markdown export, actual environment files, private credentials/PEMs, Git/workspace metadata, private memory/test reports, caches, node_modules/build output, user data and evidence. Actual repository ignore rules/history remain unchanged.
- No runtime application logic, database records, auth credentials or integrations were modified; no new provider setup was attempted.

### Verification
- All ZIP CRC/path-safety checks, unique entries and all manifest hashes passed. All 94 source files are present byte-for-byte; package/lock and other unchanged entries match originals.
- All 106 code blocks match archive payloads; all 23 route descriptions match App.js; both PNGs decode at their correct 192×192 / 512×512 dimensions.
- Checked known private values from current environment files, private PEM/key markers, current preview origin and preview analytics key: absent from the export.
- Both final external downloads returned HTTP 200 and are byte-identical to root/public copies. Existing frontend shell and `/api/` remain accessible (HTTP 200).
- Extracted ZIP and ran `yarn build` with Node 20.20.2 / Yarn 1.22.22 using a symlink to the existing workspace's installed dependencies: **exit 0**. One **pre-existing** `react-hooks/exhaustive-deps` warning remains in `CounsellorDetailPage.jsx` for `load`; documented rather than changing source in an export-only task.
- Final archive build inputs were compared against the successfully built extraction after documentation updates and are unchanged. No fresh dependency installation, full browser suite or live provider delivery test was performed; no such verification is claimed.

### Next actions / backlog
- **User next action:** Download/extract ZIP and add its contents to the desired GitHub repository. Keep `.gitignore`; merge it if combining with an existing repository. Set a private local `.env` from `.env.example` and connect the separately configured backend for API-dependent flows. Source sharing does not itself run the app.
- **P0 before real users:** Prior backend OTP/authorization hardening remains pending. Frontend source also retains automatic `/api/seed` on startup, non-user-partitioned API caches without logout clearing, and inaccurate encryption labels; documented, not fixed by packaging.
- **P1:** Backend PDF/DOCX generation and impact metrics remain pending; improve frontend Hindi PDF rendering and long-document pagination. Review the existing Hook dependency warning during a future code-change task.
- **P2:** Complete remaining hardcoded/fallback translations, verify directory contacts and live delivery after backend fixes. Optional contextual LLM scoring remains deferred. No backend code is included in this frontend export.
- **Suggested enhancement:** Repository secret scanning plus automated frontend build/API regression checks. Current OTP without provider credentials and NHAA escalation remain **MOCKED / DEV MODE**, as documented in both exports.
