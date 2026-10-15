import React from "react";
import { Check, Clock } from "lucide-react";

const STAGES = ["Logged", "Verified", "Guidance", "Drafted", "Filed", "Follow-up"];
const LABELS_HI = {
    Logged: "दर्ज",
    Verified: "सत्यापित",
    Guidance: "मार्गदर्शन",
    Drafted: "मसौदा",
    Filed: "दाखिल",
    "Follow-up": "अनुवर्ती",
};

export default function CaseTimeline({ completed = [], current = "Logged" }) {
    const idxCurrent = STAGES.indexOf(current);
    return (
        <div className="relative pl-7" data-testid="case-timeline">
            {STAGES.map((s, i) => {
                const done = completed.includes(s) || i < idxCurrent;
                const active = i === idxCurrent;
                return (
                    <div key={s} className="relative pb-6 last:pb-0">
                        {i < STAGES.length - 1 && (
                            <div className={`absolute left-[-18px] top-7 bottom-0 w-[2px] ${done ? "bg-wa" : "bg-sand"}`} style={{ borderStyle: "dashed" }} />
                        )}
                        <div
                            className={`absolute -left-[26px] top-0 h-7 w-7 rounded-full border-2 flex items-center justify-center ${
                                done ? "bg-wa border-wa text-white" : active ? "bg-gold border-gold text-white" : "bg-white border-sand text-brown"
                            }`}
                        >
                            {done ? <Check size={14} /> : <Clock size={14} />}
                        </div>
                        <div className={`font-serif font-semibold text-sm ${done || active ? "text-olive" : "text-muted-foreground"}`}>
                            {s}
                        </div>
                        <div className="hindi text-[11px] text-muted-foreground">{LABELS_HI[s]}</div>
                    </div>
                );
            })}
        </div>
    );
}
