import React, { useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import { useNavigate } from "react-router-dom";
import { intakeStore, useIntakeStore } from "@/pages/IntakeStore";
import VoiceRecorder from "@/components/VoiceRecorder";
import { useApp } from "@/context/AppContext";
import { ArrowRight } from "lucide-react";

export default function IntakePage() {
    const nav = useNavigate();
    const { lang } = useApp();
    const s = useIntakeStore();
    const [text, setText] = useState(s.narrative || "");

    const onVoiceResult = ({ transcript, metrics, audio_b64 }) => {
        setText((t) => (t ? t + " " + transcript : transcript));
        intakeStore.set({ voice_metrics: metrics, audio_b64, language: lang || "en" });
    };

    const next = () => {
        intakeStore.set({ narrative: text, language: lang || "en" });
        nav("/intake/verify");
    };

    return (
        <MobileFrame showBack>
            <div className="px-5 pt-5 pb-24 animate-fade-up">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Step 2 of 4</div>
                <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">Tell us what happened</h2>
                <div className="hindi text-sm text-brown">हमें बताएँ</div>

                {s.voice_consent && (
                    <div className="mt-5">
                        <VoiceRecorder language={lang || "en"} onResult={onVoiceResult} />
                    </div>
                )}

                <div className="mt-5">
                    <label className="text-[13px] font-semibold text-olive">
                        Write or edit the narrative
                    </label>
                    <textarea
                        data-testid="narrative-textarea"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={6}
                        placeholder="Type what happened, in your own words..."
                        className="mt-1 w-full bg-white border border-sand rounded-2xl px-4 py-3 outline-none focus:border-olive"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                    <input
                        data-testid="input-timeline"
                        placeholder="When did it happen?"
                        value={s.timeline}
                        onChange={(e) => intakeStore.setField("timeline", e.target.value)}
                        className="bg-white border border-sand rounded-xl px-4 py-3 text-sm outline-none focus:border-olive"
                    />
                    <input
                        data-testid="input-location"
                        placeholder="Where?"
                        value={s.location}
                        onChange={(e) => intakeStore.setField("location", e.target.value)}
                        className="bg-white border border-sand rounded-xl px-4 py-3 text-sm outline-none focus:border-olive"
                    />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                        data-testid="toggle-threat"
                        onClick={() => intakeStore.setField("threat_present", !s.threat_present)}
                        className={`press border rounded-xl py-2.5 px-4 text-sm font-medium ${s.threat_present ? "bg-deepred text-white border-deepred" : "bg-white border-sand text-brown"}`}
                    >
                        Threat is active · धमकी जारी है
                    </button>
                    <button
                        data-testid="toggle-isolation"
                        onClick={() => intakeStore.setField("isolation", !s.isolation)}
                        className={`press border rounded-xl py-2.5 px-4 text-sm font-medium ${s.isolation ? "bg-terracotta text-white border-terracotta" : "bg-white border-sand text-brown"}`}
                    >
                        I feel isolated · अकेला
                    </button>
                </div>

                <button
                    data-testid="intake-next-btn"
                    onClick={next}
                    disabled={!text || text.length < 10}
                    className="press mt-6 w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-white rounded-full py-3.5 font-medium flex items-center justify-center gap-2"
                >
                    Continue / Aage Badhein <ArrowRight size={16} />
                </button>
            </div>
        </MobileFrame>
    );
}
