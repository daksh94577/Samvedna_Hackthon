import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MobileFrame from "@/components/MobileFrame";
import CaseTimeline from "@/components/CaseTimeline";
import SVIGauge, { levelColor } from "@/components/SVIGauge";
import { api } from "@/lib/api";
import { FileText, PhoneCall } from "lucide-react";

export default function TimelinePage() {
    const { caseId } = useParams();
    const nav = useNavigate();
    const [c, setC] = useState(null);

    useEffect(() => {
        api.get(`/cases/${caseId}`).then((r) => setC(r.data)).catch(() => {});
    }, [caseId]);

    return (
        <MobileFrame showBack>
            <div className="px-5 pt-5 pb-28 animate-fade-up">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Case</div>
                <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">#{c?.case_id || caseId}</h2>
                <div className="hindi text-sm text-brown">केस टाइमलाइन</div>

                {c && (
                    <>
                        <div className="mt-4 bg-white border border-sand rounded-2xl p-4 flex items-center gap-4">
                            <div className="flex-1">
                                <div className="text-[11px] uppercase text-brown">Current stage</div>
                                <div className="font-serif font-bold text-olive text-xl">{c.stage}</div>
                                <div className="text-[11px] text-muted-foreground">Updated {new Date(c.updated_at).toLocaleString()}</div>
                            </div>
                            <div
                                className="rounded-full px-3 py-1 text-xs text-white font-semibold"
                                style={{ backgroundColor: levelColor(c.assessment?.svi || 0).bg }}
                            >
                                SVI {Math.round(c.assessment?.svi || 0)} · {c.assessment?.level}
                            </div>
                        </div>

                        <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                            <CaseTimeline completed={c.stages_completed} current={c.stage} />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <button
                                data-testid="open-draft-btn"
                                onClick={() => nav(`/complaint/${c.case_id}`)}
                                className="press bg-white border border-sand rounded-2xl p-4 text-left"
                            >
                                <FileText className="text-olive" size={18} />
                                <div className="font-serif font-bold text-olive mt-2">Open Draft</div>
                            </button>
                            <a href="tel:14566" className="press bg-terracotta text-white rounded-2xl p-4 text-left">
                                <PhoneCall size={18} />
                                <div className="font-serif font-bold mt-2">Call 14566</div>
                            </a>
                        </div>
                    </>
                )}
            </div>
        </MobileFrame>
    );
}
