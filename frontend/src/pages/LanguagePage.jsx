import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { LANGUAGES } from "@/lib/i18n";
import { Globe2, ShieldCheck, Volume2 } from "lucide-react";

export default function LanguagePage() {
    const { lang, setLang } = useApp();
    const nav = useNavigate();

    const choose = (code) => {
        setLang(code);
        nav("/login");
    };

    const speak = (text) => {
        try {
            const u = new SpeechSynthesisUtterance(text);
            u.lang = "en-IN";
            window.speechSynthesis.speak(u);
        } catch {}
    };

    return (
        <div className="samvedna-shell">
            <div className="frame cream-texture flex flex-col">
                <div className="px-5 pt-8 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-serif font-black text-3xl text-olive leading-tight">
                                Samvedna
                            </h1>
                            <div className="hindi text-brown font-serif text-xl -mt-1">संवेदना</div>
                            <div className="text-xs text-muted-foreground mt-1 font-medium">
                                NHAA · National Helpline Against Atrocities · 14566
                            </div>
                        </div>
                        <div className="h-14 w-14 rounded-2xl bg-olive text-cream flex items-center justify-center shadow-md">
                            <Globe2 size={26} />
                        </div>
                    </div>
                </div>

                <div className="px-5">
                    <div className="bg-olive text-white rounded-[20px] p-5 shadow-md">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="font-serif font-bold text-xl leading-snug">
                                    Choose your language
                                </div>
                                <div className="hindi text-cream/80 text-sm mt-1">अपनी भाषा चुनें</div>
                            </div>
                            <button
                                data-testid="audio-help"
                                onClick={() => speak("Choose your language. अपनी भाषा चुनें")}
                                className="press h-10 w-10 rounded-full bg-white/15 flex items-center justify-center ring-1 ring-white/20"
                            >
                                <Volume2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="px-5 py-5 grid grid-cols-2 gap-3">
                    {LANGUAGES.map((l) => (
                        <button
                            key={l.code}
                            data-testid={`choose-lang-${l.code}`}
                            onClick={() => choose(l.code)}
                            className={`press text-left bg-white border rounded-2xl p-4 transition-all hover:-translate-y-0.5 ${
                                lang === l.code ? "border-olive ring-2 ring-olive/20" : "border-sand"
                            }`}
                        >
                            <div className="font-serif font-bold text-lg text-olive">{l.native}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{l.label}</div>
                        </button>
                    ))}
                </div>

                <div className="px-5 pb-8 mt-auto">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <ShieldCheck size={14} className="text-olive" />
                        <span>Minimal data · AES-256 encryption at rest · Role-based access</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
