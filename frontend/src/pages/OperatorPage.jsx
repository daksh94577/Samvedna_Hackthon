import React, { useState, useRef } from "react";
import MobileFrame from "@/components/MobileFrame";
import SVIGauge from "@/components/SVIGauge";
import { api } from "@/lib/api";
import { Mic, Square, Headphones } from "lucide-react";

/** Operator Assist — live SVI meter while operator types or dictates call notes. */
export default function OperatorPage() {
    const [text, setText] = useState("");
    const [threat, setThreat] = useState(false);
    const [isolation, setIsolation] = useState(false);
    const [score, setScore] = useState({ svi: 0, level: "Low", factors: [] });
    const [listening, setListening] = useState(false);
    const recRef = useRef(null);
    const debRef = useRef(null);

    const rescore = (t) => {
        if (debRef.current) clearTimeout(debRef.current);
        debRef.current = setTimeout(async () => {
            try {
                const r = await api.post("/svi/live", { text: t, threat_present: threat, isolation });
                setScore(r.data);
            } catch {}
        }, 350);
    };

    const onText = (v) => {
        setText(v);
        rescore(v);
    };

    const toggleListen = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return alert("Speech recognition not supported here.");
        if (listening) {
            recRef.current?.stop();
            setListening(false);
            return;
        }
        const r = new SR();
        r.lang = "en-IN";
        r.continuous = true;
        r.interimResults = true;
        r.onresult = (e) => {
            let full = "";
            for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript + " ";
            onText(full.trim());
        };
        r.onend = () => setListening(false);
        try { r.start(); setListening(true); recRef.current = r; } catch {}
    };

    return (
        <MobileFrame showBack hideNav>
            <div className="px-5 pt-5 pb-10 animate-fade-up">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Operator Assist</div>
                <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1 flex items-center gap-2">
                    <Headphones size={20}/> Live SVI Meter
                </h2>
                <div className="hindi text-sm text-brown">सहायक · लाइव SVI</div>

                <div className="mt-4 bg-white border border-sand rounded-[20px] p-4">
                    <SVIGauge score={score.svi} />
                </div>

                <div className="mt-4">
                    <label className="text-[13px] font-semibold text-olive">Type or dictate call notes</label>
                    <textarea
                        data-testid="operator-text"
                        value={text}
                        onChange={(e) => onText(e.target.value)}
                        rows={5}
                        className="mt-1 w-full bg-white border border-sand rounded-2xl px-4 py-3 outline-none focus:border-olive"
                        placeholder="Caller says... they are being threatened and feel alone..."
                    />
                    <div className="mt-2 flex items-center justify-between">
                        <div className="flex gap-2">
                            <button
                                data-testid="operator-threat"
                                onClick={() => { setThreat((v) => !v); rescore(text); }}
                                className={`press px-3 py-1.5 rounded-full text-xs font-medium border ${threat ? "bg-deepred text-white border-deepred" : "bg-white border-sand text-brown"}`}
                            >Threat</button>
                            <button
                                data-testid="operator-isolation"
                                onClick={() => { setIsolation((v) => !v); rescore(text); }}
                                className={`press px-3 py-1.5 rounded-full text-xs font-medium border ${isolation ? "bg-terracotta text-white border-terracotta" : "bg-white border-sand text-brown"}`}
                            >Isolation</button>
                        </div>
                        <button
                            data-testid="operator-mic"
                            onClick={toggleListen}
                            className={`press flex items-center gap-2 rounded-full px-4 py-2 font-medium ${listening ? "bg-deepred text-white" : "bg-gold hover:bg-gold-dark text-white"}`}
                        >
                            {listening ? <Square size={14}/> : <Mic size={14}/>} {listening ? "Stop" : "Dictate"}
                        </button>
                    </div>
                </div>

                {score.factors?.length > 0 && (
                    <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                        <div className="font-serif font-bold text-olive">Live factors</div>
                        <ul className="mt-2 space-y-1 text-sm">
                            {score.factors.map((f, i) => (
                                <li key={i}><span className="font-semibold text-olive">{f.label}</span> <span className="text-muted-foreground">· {f.detail}</span></li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </MobileFrame>
    );
}
