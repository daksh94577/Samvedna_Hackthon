import React from "react";
import MobileFrame from "@/components/MobileFrame";
import { useNavigate } from "react-router-dom";
import { useIntakeStore } from "@/pages/IntakeStore";
import SVIGauge from "@/components/SVIGauge";
import { ScrollText, HeartHandshake, Info } from "lucide-react";

export default function AssessmentPage() {
    const nav = useNavigate();
    const s = useIntakeStore();
    const a = s.assessment;
    if (!a) {
        return (
            <MobileFrame showBack>
                <div className="p-6 text-center text-muted-foreground">No assessment yet. Please complete intake.</div>
            </MobileFrame>
        );
    }

    const whatMeans = {
        Critical: "This signals an urgent risk. Please call 14566 immediately — we will connect a senior counsellor and share your case with law enforcement.",
        High: "Your situation needs urgent attention. We strongly recommend speaking to a counsellor today and keeping proof safe.",
        Moderate: "There is clear distress. A counsellor review and formal complaint draft will help you move forward safely.",
        Low: "Your account is logged. We can still help you file a complaint and connect with support services if things escalate.",
    }[a.level];

    return (
        <MobileFrame showBack>
            <div className="px-5 pt-5 pb-28 animate-fade-up">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Step 4 of 4 · Assessment</div>
                <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">Your Assessment</h2>
                <div className="hindi text-sm text-brown">आपका आकलन</div>

                <div className="mt-4 bg-white border border-sand rounded-[20px] p-5 shadow-sm">
                    <SVIGauge score={a.svi} />
                    <div className="text-[11px] text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
                        <Info size={11} /> Triage, not diagnosis · Case #{s.case_id}
                    </div>
                </div>

                <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                    <div className="font-serif font-bold text-olive flex items-center gap-2"><ScrollText size={16} /> Top factors</div>
                    <div className="hindi text-[11px] text-muted-foreground">मुख्य कारक</div>
                    <ul className="mt-2 space-y-2">
                        {(a.factors || []).map((f, i) => (
                            <li key={i} className="flex items-start justify-between gap-3 bg-cream border border-sand rounded-xl p-3">
                                <div>
                                    <div className="text-sm font-semibold text-olive">{f.label}</div>
                                    <div className="text-[11px] text-muted-foreground">{f.detail}</div>
                                </div>
                                <div className="text-[11px] bg-white border border-sand rounded-full px-2 py-0.5 text-brown font-medium whitespace-nowrap">
                                    {f.signal}
                                </div>
                            </li>
                        ))}
                        {(!a.factors || a.factors.length === 0) && (
                            <li className="text-sm text-muted-foreground">No strong distress indicators detected.</li>
                        )}
                    </ul>
                </div>

                <div className="mt-4 bg-olive text-white rounded-[20px] p-5">
                    <div className="font-serif font-bold text-lg">What This Means For You</div>
                    <div className="hindi text-cream/80 text-xs mt-0.5">आपके लिए क्या मायने रखता है</div>
                    <p className="text-sm text-cream/90 mt-2 leading-relaxed">{whatMeans}</p>
                </div>

                <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                    <div className="font-serif font-bold text-olive flex items-center gap-2"><HeartHandshake size={16} /> Your Rights (informational)</div>
                    <p className="text-sm text-foreground/85 mt-2">
                        Under the <span className="font-semibold">SC/ST (Prevention of Atrocities) Act, 1989</span>, you are protected against caste-based intimidation, abuse and economic boycott. Legal aid is free under NALSA (Helpline 15100). This information does not replace legal counsel.
                    </p>
                </div>

                <button
                    data-testid="next-steps-btn"
                    onClick={() => nav("/intake/next-steps")}
                    className="press mt-5 w-full bg-gold hover:bg-gold-dark text-white rounded-full py-3.5 font-medium"
                >
                    See Next Steps / अगले कदम
                </button>
            </div>
        </MobileFrame>
    );
}
