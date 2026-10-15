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
