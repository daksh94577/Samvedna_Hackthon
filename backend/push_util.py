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
