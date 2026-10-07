// Multilingual voice helpers using Web Speech API.
export const LANG_TO_BCP47 = {
    en: "en-IN",
    hi: "hi-IN",
    hinglish: "en-IN",
    bn: "bn-IN",
    mr: "mr-IN",
    gu: "gu-IN",
    pa: "pa-IN",
    ta: "ta-IN",
    te: "te-IN",
    kn: "kn-IN",
};

export function speakText(text, langCode = "en") {
    try {
        if (!("speechSynthesis" in window)) return false;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = LANG_TO_BCP47[langCode] || "en-IN";
        u.rate = 0.95;
        u.pitch = 1;
        window.speechSynthesis.speak(u);
        return true;
    } catch (e) {
        return false;
    }
}

export function stopSpeaking() {
    try { window.speechSynthesis.cancel(); } catch (_) {}
}
