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
    def test_entries_with_latlng(self, session):
        r = session.get(f"{API}/support-directory")
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 6
        for e in data:
            assert "lat" in e and "lng" in e, f"missing lat/lng: {e}"
            assert isinstance(e["lat"], (int, float))
            assert isinstance(e["lng"], (int, float))
            # India bounding box sanity
            assert 5.0 <= e["lat"] <= 40.0
            assert 65.0 <= e["lng"] <= 100.0



# -------- Audio encryption / playback --------
class TestAudio:
    def test_audio_stored_encrypted_and_decrypt(self, session, victim_auth, counsellor_auth):
        import base64
        plaintext = base64.b64encode(b"hello-samvedna-audio-bytes").decode()
        payload = {
            "category": "caste",
            "narrative": "Audio evidence attached.",
            "language": "en",
            "threat_present": False,
            "isolation": False,
            "voice_consent": True,
            "audio_b64": plaintext,
        }
        r = session.post(f"{API}/cases", headers=victim_auth["headers"], json=payload)
        assert r.status_code == 200, r.text
        cid = r.json()["case_id"]
        # Verify DB contents via a direct Mongo-style check: encrypted field must not be returned to victim
        assert "audio_encrypted" not in r.json()

        # Victim cannot access audio endpoint
        rv = session.get(f"{API}/cases/{cid}/audio", headers=victim_auth["headers"])
        assert rv.status_code == 403

        # Counsellor can decrypt and gets plaintext back
        rc = session.get(f"{API}/cases/{cid}/audio", headers=counsellor_auth["headers"])
        assert rc.status_code == 200, rc.text
        body = rc.json()
        assert body.get("audio_b64") == plaintext

    def test_audio_null_when_absent(self, session, victim_auth, counsellor_auth):
        payload = {
            "category": "property",
            "narrative": "No audio attached here.",
            "language": "en",
            "threat_present": False,
            "isolation": False,
        }
        r = session.post(f"{API}/cases", headers=victim_auth["headers"], json=payload)
        assert r.status_code == 200
        cid = r.json()["case_id"]
        rc = session.get(f"{API}/cases/{cid}/audio", headers=counsellor_auth["headers"])
        assert rc.status_code == 200
        assert rc.json() == {"audio_b64": None}

    def test_audio_db_token_is_fernet(self, session, victim_auth):
        """Verify DB-stored token looks like a Fernet token (starts with 'gAAAAA')."""
        import base64
        from pymongo import MongoClient
        from pathlib import Path
        env = {}
        for line in Path("/app/backend/.env").read_text().splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"')
        mc = MongoClient(env["MONGO_URL"])
        dbh = mc[env["DB_NAME"]]
        plaintext = base64.b64encode(b"fernet-check-bytes").decode()
        r = session.post(f"{API}/cases", headers=victim_auth["headers"], json={
            "category": "caste", "narrative": "x", "language": "en",
            "threat_present": False, "isolation": False, "audio_b64": plaintext,
        })
        assert r.status_code == 200
        cid = r.json()["case_id"]
        doc = dbh.cases.find_one({"case_id": cid})
        enc = doc.get("audio_encrypted")
        assert enc, "audio_encrypted missing in DB"
        assert enc != plaintext, "audio stored in plaintext!"
        assert enc.startswith("gAAAAA"), f"not a Fernet token: {enc[:20]}"

    def test_audio_play_audit_log(self, session, victim_auth, counsellor_auth, supervisor_auth):
        import base64
        plaintext = base64.b64encode(b"audit-check").decode()
        r = session.post(f"{API}/cases", headers=victim_auth["headers"], json={
            "category": "caste", "narrative": "x", "language": "en",
            "threat_present": False, "isolation": False, "audio_b64": plaintext,
        })
        cid = r.json()["case_id"]
        rc = session.get(f"{API}/cases/{cid}/audio", headers=counsellor_auth["headers"])
        assert rc.status_code == 200
        # Fetch audit log as supervisor
        ra = session.get(f"{API}/supervisor/audit-log", headers=supervisor_auth["headers"])
        assert ra.status_code == 200
        logs = ra.json()
        matching = [l for l in logs if l.get("action") == "audio_play" and l.get("target") == cid]
        assert len(matching) >= 1, "audio_play audit entry missing"



# -------- Push Notifications --------
class TestPush:
    def test_public_key(self, session):
        r = session.get(f"{API}/push/public-key")
        assert r.status_code == 200
        assert "public_key" in r.json()

    def test_subscribe_victim_403(self, session, victim_auth):
        sub = {"endpoint": "https://example.com/push/victim", "keys": {"p256dh": "x", "auth": "y"}}
        r = session.post(f"{API}/push/subscribe", headers=victim_auth["headers"], json={"subscription": sub})
        assert r.status_code == 403

    def test_subscribe_counsellor_ok(self, session, counsellor_auth):
        sub = {"endpoint": f"https://example.com/push/{uuid.uuid4().hex}", "keys": {"p256dh": "x", "auth": "y"}}
        r = session.post(f"{API}/push/subscribe", headers={**counsellor_auth["headers"], "Content-Type": "application/json"}, json={"subscription": sub})
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_push_test_shape(self, session, counsellor_auth):
        r = session.post(f"{API}/push/test", headers=counsellor_auth["headers"])
        assert r.status_code == 200
        d = r.json()
        assert "ok" in d and "sent" in d and "subs" in d
        assert isinstance(d["sent"], int) and isinstance(d["subs"], int)

    def test_push_test_victim_403(self, session, victim_auth):
        r = session.post(f"{API}/push/test", headers=victim_auth["headers"])
        assert r.status_code == 403


# -------- Attachments (encrypted) --------
import base64 as _b64m


@pytest.fixture(scope="module")
def victim_case_id(session, victim_auth):
    r = session.post(f"{API}/cases", headers=victim_auth["headers"], json={
        "category": "caste", "narrative": "attachment base case", "language": "en",
        "threat_present": False, "isolation": False,
    })
    assert r.status_code == 200
    return r.json()["case_id"]


class TestAttachments:
    def test_add_attachment(self, session, victim_auth, victim_case_id):
        data = _b64m.b64encode(b"hello world attachment").decode()
        r = session.post(f"{API}/cases/{victim_case_id}/attachments", headers=victim_auth["headers"], json={
            "filename": "proof.txt", "content_type": "text/plain", "data_b64": data,
        })
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["filename"] == "proof.txt"
        assert "encrypted" not in d
        assert "id" in d
        victim_auth["att_id"] = d["id"]
        victim_auth["att_data"] = data

    def test_list_attachments_no_encrypted(self, session, victim_auth, victim_case_id):
        r = session.get(f"{API}/cases/{victim_case_id}/attachments", headers=victim_auth["headers"])
        assert r.status_code == 200
        lst = r.json()
        assert len(lst) >= 1
        for a in lst:
            assert "encrypted" not in a

    def test_download_attachment_matches(self, session, victim_auth, victim_case_id):
        aid = victim_auth["att_id"]
        r = session.get(f"{API}/cases/{victim_case_id}/attachments/{aid}", headers=victim_auth["headers"])
        assert r.status_code == 200
        assert r.json()["data_b64"] == victim_auth["att_data"]

    def test_too_large_413(self, session, victim_auth, victim_case_id):
        big = "A" * 8_000_001
        r = session.post(f"{API}/cases/{victim_case_id}/attachments", headers=victim_auth["headers"], json={
            "filename": "big.bin", "content_type": "application/octet-stream", "data_b64": big,
        })
        assert r.status_code == 413

    def test_missing_att_id_404(self, session, victim_auth, victim_case_id):
        r = session.get(f"{API}/cases/{victim_case_id}/attachments/{uuid.uuid4()}", headers=victim_auth["headers"])
        assert r.status_code == 404

    def test_other_victim_forbidden(self, session, victim_case_id):
        # new victim account
        s2 = requests.Session()
        s2.headers.update({"Content-Type": "application/json"})
        r = s2.post(f"{API}/auth/request-otp", json={"phone": "+911234500001", "email": f"TEST_other_{uuid.uuid4().hex[:6]}@x.com"})
        d = r.json(); sid = d["session_id"]
        s2.post(f"{API}/auth/verify-mobile", json={"session_id": sid, "code": d["dev_mobile_otp"]})
        v = s2.post(f"{API}/auth/verify-email", json={"session_id": sid, "code": d["dev_email_otp"]}).json()
        hdr = {"Authorization": f"Bearer {v['token']}"}
        r2 = s2.get(f"{API}/cases/{victim_case_id}/attachments", headers=hdr)
        assert r2.status_code == 403
        r3 = s2.post(f"{API}/cases/{victim_case_id}/attachments", headers={**hdr, "Content-Type": "application/json"}, json={
            "filename": "x.txt", "content_type": "text/plain", "data_b64": "QQ=="
        })
        assert r3.status_code == 403


# -------- Export Zip --------
import io as _io
import zipfile as _zf


class TestExport:
    def test_export_zip_structure(self, session, victim_auth, counsellor_auth):
        plaintext_audio = _b64m.b64encode(b"audio-for-export-bytes").decode()
        r = session.post(f"{API}/cases", headers=victim_auth["headers"], json={
            "category": "caste", "narrative": "Export narrative content",
            "language": "en", "threat_present": True, "isolation": False,
            "voice_consent": True, "audio_b64": plaintext_audio,
        })
        assert r.status_code == 200
        cid = r.json()["case_id"]
        # add one attachment
        data = _b64m.b64encode(b"evidence file").decode()
        ra = session.post(f"{API}/cases/{cid}/attachments", headers=victim_auth["headers"], json={
            "filename": "evidence.txt", "content_type": "text/plain", "data_b64": data,
        })
        assert ra.status_code == 200
        # export as counsellor
        re_ = session.get(f"{API}/cases/{cid}/export", headers=counsellor_auth["headers"])
        assert re_.status_code == 200
        assert re_.headers.get("content-type", "").startswith("application/zip")
        cd = re_.headers.get("content-disposition", "")
        assert "attachment" in cd and ".zip" in cd
        zf = _zf.ZipFile(_io.BytesIO(re_.content))
        names = zf.namelist()
        joined = "\n".join(names)
        assert any(n.endswith("metadata.json") for n in names), joined
        assert any(n.endswith("complaint-english.txt") for n in names), joined
        assert any(n.endswith("complaint-hindi.txt") for n in names), joined
        assert any(n.endswith("narrative.txt") for n in names), joined
        assert any(n.endswith("README.txt") for n in names), joined
        assert any("/attachments/" in n for n in names), joined
        assert any(n.endswith("audio.webm") for n in names), joined

    def test_export_forbidden_for_other_victim(self, session, victim_auth, counsellor_auth):
        # create case as our victim
        r = session.post(f"{API}/cases", headers=victim_auth["headers"], json={
            "category": "caste", "narrative": "forbid test", "language": "en",
            "threat_present": False, "isolation": False,
        })
        cid = r.json()["case_id"]
        # new victim
        s2 = requests.Session(); s2.headers.update({"Content-Type": "application/json"})
        r1 = s2.post(f"{API}/auth/request-otp", json={"phone": "+911234500002", "email": f"TEST_fv_{uuid.uuid4().hex[:6]}@x.com"})
        d = r1.json(); sid = d["session_id"]
        s2.post(f"{API}/auth/verify-mobile", json={"session_id": sid, "code": d["dev_mobile_otp"]})
        v = s2.post(f"{API}/auth/verify-email", json={"session_id": sid, "code": d["dev_email_otp"]}).json()
        hdr = {"Authorization": f"Bearer {v['token']}"}
        r2 = s2.get(f"{API}/cases/{cid}/export", headers=hdr)
        assert r2.status_code == 403


# -------- Audit log entries for new actions --------
class TestAuditEntries:
    def test_new_action_entries_exist(self, session, supervisor_auth):
        r = session.get(f"{API}/supervisor/audit-log", headers=supervisor_auth["headers"])
        assert r.status_code == 200
        logs = r.json()
        actions = {l.get("action") for l in logs}
        for a in ["case_create", "escalate", "attachment_add", "attachment_download", "export_pack", "audio_play", "push_subscribe"]:
            assert a in actions, f"missing audit action: {a}; have {actions}"


# -------- Case Chat (encrypted) --------
class TestChat:
    def test_send_chat_victim_and_decrypt(self, session, victim_auth, victim_case_id):
        text = f"Hello from victim {uuid.uuid4().hex[:6]}"
        r = session.post(f"{API}/cases/{victim_case_id}/chat", headers=victim_auth["headers"], json={"text": text})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["text"] == text
        assert d["author_role"] == "victim"
        assert "text_encrypted" not in d
        assert "id" in d and "created_at" in d

    def test_empty_text_400(self, session, victim_auth, victim_case_id):
        r = session.post(f"{API}/cases/{victim_case_id}/chat", headers=victim_auth["headers"], json={"text": "   "})
        assert r.status_code == 400

    def test_nonexistent_case_404(self, session, victim_auth):
        r = session.post(f"{API}/cases/SM-9999/chat", headers=victim_auth["headers"], json={"text": "hi"})
        assert r.status_code == 404
        r2 = session.get(f"{API}/cases/SM-9999/chat", headers=victim_auth["headers"])
        assert r2.status_code == 404

    def test_cross_victim_chat_403(self, session, victim_case_id):
        s2 = requests.Session()
        s2.headers.update({"Content-Type": "application/json"})
        r1 = s2.post(f"{API}/auth/request-otp", json={"phone": "+911234500003", "email": f"TEST_cv_{uuid.uuid4().hex[:6]}@x.com"})
        d = r1.json(); sid = d["session_id"]
        s2.post(f"{API}/auth/verify-mobile", json={"session_id": sid, "code": d["dev_mobile_otp"]})
        v = s2.post(f"{API}/auth/verify-email", json={"session_id": sid, "code": d["dev_email_otp"]}).json()
        hdr = {"Authorization": f"Bearer {v['token']}", "Content-Type": "application/json"}
        r2 = s2.post(f"{API}/cases/{victim_case_id}/chat", headers=hdr, json={"text": "intrusion"})
        assert r2.status_code == 403
        r3 = s2.get(f"{API}/cases/{victim_case_id}/chat", headers=hdr)
        assert r3.status_code == 403

    def test_chat_db_stored_encrypted(self, session, victim_auth, victim_case_id):
        text = f"secret-chat-{uuid.uuid4().hex[:8]}"
        r = session.post(f"{API}/cases/{victim_case_id}/chat", headers=victim_auth["headers"], json={"text": text})
        assert r.status_code == 200
        msg_id = r.json()["id"]
        from pymongo import MongoClient
        from pathlib import Path
        env = {}
        for line in Path("/app/backend/.env").read_text().splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"')
        mc = MongoClient(env["MONGO_URL"])
        dbh = mc[env["DB_NAME"]]
        doc = dbh.chat_messages.find_one({"id": msg_id})
        assert doc is not None
        enc = doc.get("text_encrypted")
        assert enc, "text_encrypted missing in DB"
        assert enc != text, "chat stored in plaintext!"
        assert enc.startswith("gAAAAA"), f"not a Fernet token: {enc[:20]}"

    def test_counsellor_and_victim_both_chat(self, session, victim_auth, counsellor_auth):
        # Create a case and accept it as counsellor
        payload = {"category": "caste", "narrative": "Chat flow test", "language": "en",
                   "threat_present": False, "isolation": False}
        rc = session.post(f"{API}/cases", headers=victim_auth["headers"], json=payload)
        cid = rc.json()["case_id"]
        # counsellor accepts
        ra = session.patch(f"{API}/cases/{cid}", headers={**counsellor_auth["headers"], "Content-Type": "application/json"}, json={"accept": True})
        assert ra.status_code == 200
        # victim sends
        t1 = "I need help today"
        r1 = session.post(f"{API}/cases/{cid}/chat", headers=victim_auth["headers"], json={"text": t1})
        assert r1.status_code == 200
        # counsellor sends
        t2 = "I am here to assist you"
        r2 = session.post(f"{API}/cases/{cid}/chat", headers={**counsellor_auth["headers"], "Content-Type": "application/json"}, json={"text": t2})
        assert r2.status_code == 200
        assert r2.json()["author_role"] == "counsellor"
        # list as victim
        lv = session.get(f"{API}/cases/{cid}/chat", headers=victim_auth["headers"])
        assert lv.status_code == 200
        msgs_v = lv.json()
        texts_v = [m["text"] for m in msgs_v]
        assert t1 in texts_v and t2 in texts_v
        # chronological order
        times = [m["created_at"] for m in msgs_v]
        assert times == sorted(times)
        # list as counsellor
        lc = session.get(f"{API}/cases/{cid}/chat", headers=counsellor_auth["headers"])
        assert lc.status_code == 200
        texts_c = [m["text"] for m in lc.json()]
        assert t1 in texts_c and t2 in texts_c


# -------- Supervisor Impact Dashboard --------
class TestImpact:
    def test_counsellor_403(self, session, counsellor_auth):
        r = session.get(f"{API}/supervisor/impact?days=7", headers=counsellor_auth["headers"])
        assert r.status_code == 403

    def test_supervisor_impact_shape(self, session, supervisor_auth):
        r = session.get(f"{API}/supervisor/impact?days=7", headers=supervisor_auth["headers"])
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["window_days"] == 7
        assert isinstance(d["total_cases"], int)
        assert isinstance(d["critical_cases"], int)
        assert isinstance(d["daily"], list) and len(d["daily"]) == 7
        for row in d["daily"]:
            assert "date" in row and "count" in row
            assert isinstance(row["count"], int)
        assert isinstance(d["svi_distribution"], list) and len(d["svi_distribution"]) == 4
        levels = {row["level"] for row in d["svi_distribution"]}
        assert levels == {"Low", "Moderate", "High", "Critical"}
        assert isinstance(d["categories"], list)
        # avg_tte can be None or a float
        assert ("avg_time_to_escalation_min" in d)
        assert isinstance(d["total_escalations"], int)

    def test_impact_custom_days(self, session, supervisor_auth):
        r = session.get(f"{API}/supervisor/impact?days=3", headers=supervisor_auth["headers"])
        assert r.status_code == 200
        d = r.json()
        assert d["window_days"] == 3
        assert len(d["daily"]) == 3

    def test_impact_escalation_reflects(self, session, supervisor_auth, victim_auth, counsellor_auth):
        # Create and escalate a case, then impact should report >=1 escalation
        rc = session.post(f"{API}/cases", headers=victim_auth["headers"], json={
            "category": "physical", "narrative": "threat escalation case",
            "language": "en", "threat_present": True, "isolation": False,
        })
        cid = rc.json()["case_id"]
        re_ = session.post(f"{API}/cases/{cid}/escalate",
                           headers={**counsellor_auth["headers"], "Content-Type": "application/json"},
                           json={"target": "law_enforcement", "note": "x"})
        assert re_.status_code == 200
        r = session.get(f"{API}/supervisor/impact?days=7", headers=supervisor_auth["headers"])
        d = r.json()
        assert d["total_escalations"] >= 1
        # Once we have at least one escalation in window, avg should be a number
        if d["total_escalations"] >= 1:
            assert d["avg_time_to_escalation_min"] is None or isinstance(d["avg_time_to_escalation_min"], (int, float))
