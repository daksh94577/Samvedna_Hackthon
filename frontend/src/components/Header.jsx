import React from "react";
import { ChevronLeft, Languages } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { LANGUAGES } from "@/lib/i18n";

export default function Header({ showBack = false, title = null, right = null }) {
    const { lang, setLang } = useApp();
    const navigate = useNavigate();
    const [open, setOpen] = React.useState(false);
    const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

    return (
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-cream/85 border-b border-sand">
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                    {showBack && (
                        <button
                            data-testid="header-back"
                            onClick={() => navigate(-1)}
                            className="press -ml-1 p-1.5 rounded-full hover:bg-sand/40 text-olive"
                        >
                            <ChevronLeft size={22} />
                        </button>
                    )}
                    <div className="min-w-0">
                        <div className="font-serif font-bold text-olive text-[18px] leading-tight truncate">
                            {title || "Samvedna"} <span className="hindi text-brown">/ संवेदना</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground font-medium">
                            NHAA · Helpline 14566
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {right}
                    <button
                        data-testid="language-toggle"
                        onClick={() => setOpen((v) => !v)}
                        className="press flex items-center gap-1 border border-sand bg-white rounded-full py-1.5 px-3 text-xs font-medium text-olive"
                    >
                        <Languages size={14} />
                        {current.native}
                    </button>
                </div>
            </div>
            {open && (
                <div className="px-4 pb-3 animate-fade-up">
                    <div className="grid grid-cols-2 gap-2 bg-white border border-sand rounded-2xl p-2 shadow-sm">
                        {LANGUAGES.map((l) => (
                            <button
                                key={l.code}
                                data-testid={`lang-opt-${l.code}`}
                                onClick={() => {
                                    setLang(l.code);
                                    setOpen(false);
                                }}
                                className={`press text-left px-3 py-2 rounded-xl text-sm ${
                                    lang === l.code ? "bg-olive text-white" : "hover:bg-cream text-foreground"
                                }`}
                            >
                                <div className="font-medium">{l.native}</div>
                                <div className={`text-[11px] ${lang === l.code ? "text-white/70" : "text-muted-foreground"}`}>
                                    {l.label}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}
