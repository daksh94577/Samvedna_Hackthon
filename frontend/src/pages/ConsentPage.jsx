import React from "react";
import MobileFrame from "@/components/MobileFrame";
import { useNavigate } from "react-router-dom";
import { intakeStore } from "@/pages/IntakeStore";
import { Mic, Keyboard, ShieldCheck } from "lucide-react";

export default function ConsentPage() {
    const nav = useNavigate();
    const pick = (voice) => {
        intakeStore.set({ voice_consent: voice, consent_at: new Date().toISOString() });
        nav("/intake/record");
    };
    return (
        <MobileFrame showBack>
            <div className="px-5 pt-5 pb-24 animate-fade-up">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Step 2 of 4</div>
                <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">Allow Voice Input</h2>
                <div className="hindi text-sm text-brown">आवाज़ से बताइए</div>

                <div className="mt-5 bg-white border border-sand rounded-[20px] p-5 shadow-sm">
                    <div className="h-12 w-12 rounded-2xl bg-cream border border-sand flex items-center justify-center text-olive">
                        <Mic size={22} />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-olive mt-3">We will listen with care</h3>
                    <p className="text-sm text-foreground/80 mt-1">
                        Your voice helps our AI understand distress signals (pitch tremor, pauses, energy) that text alone can miss.
                        Audio is encrypted at rest and visible only to the assigned counsellor.
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-3">
                        <ShieldCheck size={13} className="text-olive" />
                        AES-256 at rest · Role-based access · Audit-logged
                    </div>
                </div>

                <div className="mt-5 space-y-3">
                    <button
                        data-testid="allow-voice-btn"
                        onClick={() => pick(true)}
                        className="press w-full bg-gold hover:bg-gold-dark text-white rounded-full py-3.5 font-medium flex items-center justify-center gap-2"
                    >
                        <Mic size={18} /> Allow Voice Input / आवाज़ अनुमति दें
                    </button>
                    <button
                        data-testid="type-instead-btn"
                        onClick={() => pick(false)}
                        className="press w-full bg-brown hover:bg-brown/90 text-white rounded-full py-3.5 font-medium flex items-center justify-center gap-2"
                    >
                        <Keyboard size={18} /> Type Instead / लिखकर बताएँ
                    </button>
                </div>
            </div>
        </MobileFrame>
    );
}
