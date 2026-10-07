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
