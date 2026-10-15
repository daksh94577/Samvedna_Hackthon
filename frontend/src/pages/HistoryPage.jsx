import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "@/components/MobileFrame";
import { api } from "@/lib/api";
import { levelColor } from "@/components/SVIGauge";
import { ChevronRight } from "lucide-react";

export default function HistoryPage() {
    const [cases, setCases] = useState([]);
    const nav = useNavigate();
    useEffect(() => {
        api.get("/cases").then((r) => setCases(r.data)).catch(() => {});
    }, []);
    return (
        <MobileFrame>
            <div className="px-5 pt-5 pb-24">
                <h2 className="font-serif font-black text-2xl text-olive">Your Cases</h2>
                <div className="hindi text-sm text-brown">आपके केस</div>
                {cases.length === 0 && (
                    <div className="mt-6 text-sm text-muted-foreground bg-white border border-sand rounded-2xl p-5 text-center">
                        No cases yet. Start by describing a new problem.
                    </div>
                )}
                <div className="mt-4 space-y-3">
                    {cases.map((c) => (
                        <button
                            key={c.case_id}
                            data-testid={`case-row-${c.case_id}`}
                            onClick={() => nav(`/timeline/${c.case_id}`)}
                            className="press w-full text-left bg-white border border-sand rounded-2xl p-4 flex items-center gap-3"
                        >
                            <div
                                className="h-11 w-11 rounded-xl text-white flex items-center justify-center font-serif font-bold text-sm"
                                style={{ backgroundColor: levelColor(c.assessment?.svi || 0).bg }}
                            >
                                {Math.round(c.assessment?.svi || 0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-serif font-bold text-olive truncate">#{c.case_id} · {c.stage}</div>
                                <div className="text-[12px] text-muted-foreground truncate">{c.narrative}</div>
                            </div>
                            <ChevronRight size={16} className="text-muted-foreground" />
                        </button>
                    ))}
                </div>
            </div>
        </MobileFrame>
    );
}
