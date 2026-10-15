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

import dns.resolver as _r
_r.default_resolver = _r.Resolver(configure=False)
_r.default_resolver.nameservers = ['8.8.8.8','1.1.1.1']
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

