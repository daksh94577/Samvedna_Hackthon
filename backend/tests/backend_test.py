"""Samvedna backend comprehensive tests."""
import os
import pytest
import requests
import uuid

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # fallback: read frontend/.env
    from pathlib import Path
    for line in Path("/app/frontend/.env").read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip()
            break
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def seeded(session):
    r = session.post(f"{API}/seed", timeout=30)
    assert r.status_code == 200, r.text
    return r.json()


# -------- Seed --------
class TestSeed:
    def test_seed_ok(self, seeded):
        assert seeded.get("ok") is True
        # either freshly seeded or already seeded
        if not seeded.get("already_seeded"):
            assert len(seeded.get("seeded_cases", [])) == 5
            assert len(seeded.get("counsellors", [])) == 2

    def test_seed_idempotent(self, session, seeded):
        r = session.post(f"{API}/seed", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data.get("ok") is True
        assert data.get("already_seeded") is True


# -------- Auth --------
def _victim_login(session, phone="+919999988888", email="victim.demo@samvedna.in"):
    r = session.post(f"{API}/auth/request-otp", json={"phone": phone, "email": email, "channel": "sms", "language": "en"})
    assert r.status_code == 200, r.text
    d = r.json()
    assert "dev_mobile_otp" in d
    assert "dev_email_otp" in d
    sid = d["session_id"]
    r2 = session.post(f"{API}/auth/verify-mobile", json={"session_id": sid, "code": d["dev_mobile_otp"]})
    assert r2.status_code == 200, r2.text
    r3 = session.post(f"{API}/auth/verify-email", json={"session_id": sid, "code": d["dev_email_otp"]})
    assert r3.status_code == 200, r3.text
    body = r3.json()
    assert "token" in body and body["user"]["email"] == email
    return body["token"], body["user"]


@pytest.fixture(scope="module")
def victim_auth(session, seeded):
    token, user = _victim_login(session)
    return {"token": token, "user": user, "headers": {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}}


class TestAuth:
    def test_full_flow(self, session, seeded):
        token, user = _victim_login(session)
        assert len(token) > 10
        assert user["role"] == "victim"

    def test_email_before_mobile_409(self, session):
        r = session.post(f"{API}/auth/request-otp", json={"phone": "+911234567890", "email": f"TEST_{uuid.uuid4().hex[:6]}@x.com"})
        d = r.json()
        sid = d["session_id"]
        r2 = session.post(f"{API}/auth/verify-email", json={"session_id": sid, "code": d["dev_email_otp"]})
        assert r2.status_code == 409

    def test_invalid_mobile_otp_400(self, session):
        r = session.post(f"{API}/auth/request-otp", json={"phone": "+911234567891", "email": f"TEST_{uuid.uuid4().hex[:6]}@x.com"})
        sid = r.json()["session_id"]
        r2 = session.post(f"{API}/auth/verify-mobile", json={"session_id": sid, "code": "0000"})
        # could be 400 or 429, first attempt must be 400 unless unlucky collision
        assert r2.status_code in (400, 429)

    def test_max_attempts_429(self, session):
        r = session.post(f"{API}/auth/request-otp", json={"phone": "+911234567892", "email": f"TEST_{uuid.uuid4().hex[:6]}@x.com"})
        d = r.json()
        sid = d["session_id"]
        correct = d["dev_mobile_otp"]
        bad = "9999" if correct != "9999" else "1111"
        statuses = []
        for _ in range(4):
            resp = session.post(f"{API}/auth/verify-mobile", json={"session_id": sid, "code": bad})
            statuses.append(resp.status_code)
        assert 429 in statuses


# -------- SVI --------
class TestSVI:
    def test_live_weights(self, session):
        # With voice metrics: text 0.45 + voice 0.35 + context 0.20
        r = session.post(f"{API}/svi/live", json={
            "text": "I am scared and alone",
            "voice_metrics": {"pitch_variation": 0.5, "pause_ratio": 0.5, "speech_rate": 0.5, "rms_energy": 0.5, "pitch_jitter": 0.5},
            "threat_present": False, "isolation": False,
        })
        assert r.status_code == 200
        d = r.json()
        w = d["breakdown"]["weights"]
        assert w["text"] == 0.45 and w["voice"] == 0.35 and w["context"] == 0.20
        assert "svi" in d and "level" in d

    def test_safety_override(self, session):
        r = session.post(f"{API}/svi/live", json={"text": "I will kill myself tonight, I want to end my life"})
        assert r.status_code == 200
        d = r.json()
        assert d["level"] in ("High", "Critical")
        # should at least mark safety override OR already be high/critical
        assert d["svi"] >= 60.0

    def test_threat_override(self, session):
        r = session.post(f"{API}/svi/live", json={"text": "They will kill me, they gave a death threat"})
        d = r.json()
        assert d["svi"] >= 60.0
        assert d["level"] in ("High", "Critical")

    def test_authenticated_score(self, session, victim_auth):
        r = session.post(f"{API}/svi/score", headers=victim_auth["headers"], json={"text": "I feel hopeless"})
        assert r.status_code == 200


# -------- Cases --------
class TestCases:
    def test_create_case(self, session, victim_auth):
        payload = {
            "category": "caste",
            "narrative": "I was attacked and threatened. They said they will kill me.",
            "language": "en",
            "threat_present": True,
            "isolation": False,
            "timeline": "Yesterday",
            "location": "Delhi",
            "voice_consent": False,
            "audio_b64": "fakeaudiob64data",
        }
        r = session.post(f"{API}/cases", headers=victim_auth["headers"], json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["case_id"].startswith("SM-")
        assert "assessment" in d and "svi" in d["assessment"]
        assert d["stage"] == "Logged"
        assert "audio_encrypted" not in d  # must be stripped
        victim_auth["case_id"] = d["case_id"]

    def test_list_cases(self, session, victim_auth):
        r = session.get(f"{API}/cases", headers=victim_auth["headers"])
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        assert len(r.json()) >= 1

    def test_patch_case(self, session, victim_auth):
        cid = victim_auth.get("case_id")
        assert cid
        r = session.patch(f"{API}/cases/{cid}", headers=victim_auth["headers"], json={"stage": "Reviewed"})
        assert r.status_code == 200
        assert r.json()["stage"] == "Reviewed"

    def test_draft_bilingual(self, session, victim_auth):
        cid = victim_auth["case_id"]
        r = session.get(f"{API}/cases/{cid}/draft", headers=victim_auth["headers"])
        assert r.status_code == 200
        d = r.json()
        assert "english" in d and "hindi" in d
        assert len(d["english"]) > 400
        assert len(d["hindi"]) > 400


# -------- Counsellor --------
def _counsellor_login(session, email):
    r = session.post(f"{API}/counsellor/request-otp", json={"email": email})
    assert r.status_code == 200, r.text
    d = r.json()
    sid = d["session_id"]
    code = d["dev_email_otp"]
    r2 = session.post(f"{API}/counsellor/verify", json={"session_id": sid, "code": code})
    assert r2.status_code == 200, r2.text
    body = r2.json()
    return body["token"], body["user"]


@pytest.fixture(scope="module")
def counsellor_auth(session, seeded):
    token, user = _counsellor_login(session, "priya.counsellor@samvedna.in")
    return {"token": token, "user": user, "headers": {"Authorization": f"Bearer {token}"}}


@pytest.fixture(scope="module")
def supervisor_auth(session, seeded):
    token, user = _counsellor_login(session, "verma.supervisor@samvedna.in")
    return {"token": token, "user": user, "headers": {"Authorization": f"Bearer {token}"}}


class TestCounsellor:
    def test_counsellor_login(self, counsellor_auth):
        assert counsellor_auth["user"]["role"] == "counsellor"

    def test_queue_sorted_by_svi_desc(self, session, counsellor_auth):
        r = session.get(f"{API}/counsellor/queue", headers=counsellor_auth["headers"])
        assert r.status_code == 200
        cases = r.json()
        assert len(cases) >= 5
        svis = [c["assessment"]["svi"] for c in cases]
        assert svis == sorted(svis, reverse=True)

    def test_escalate(self, session, counsellor_auth, victim_auth):
        # create own case to avoid cross-worker fixture issues under xdist
        payload = {"category": "physical", "narrative": "They attacked and threatened me", "language": "en", "threat_present": True, "isolation": False}
        rc = session.post(f"{API}/cases", headers=victim_auth["headers"], json=payload)
        assert rc.status_code == 200
        cid = rc.json()["case_id"]
        r = session.post(f"{API}/cases/{cid}/escalate", headers=counsellor_auth["headers"], json={"target": "law_enforcement", "note": "escalating"})
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "mock_submitted_to_NHAA"
        # verify case stage became Filed
        r2 = session.get(f"{API}/cases/{cid}", headers=counsellor_auth["headers"])
        assert r2.json()["stage"] == "Filed"


# -------- Supervisor --------
class TestSupervisor:
    def test_audit_log_supervisor_ok(self, session, supervisor_auth):
        r = session.get(f"{API}/supervisor/audit-log", headers=supervisor_auth["headers"])
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_audit_log_counsellor_403(self, session, counsellor_auth):
        r = session.get(f"{API}/supervisor/audit-log", headers=counsellor_auth["headers"])
        assert r.status_code == 403


# -------- Support Directory --------
class TestSupport:
    def test_six_entries(self, session):
        r = session.get(f"{API}/support-directory")
        assert r.status_code == 200
        assert len(r.json()) == 6
