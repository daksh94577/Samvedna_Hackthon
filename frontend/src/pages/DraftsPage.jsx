import React, { useEffect, useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";

export default function DraftsPage() {
    const [cases, setCases] = useState([]);
    const nav = useNavigate();
    useEffect(() => { api.get("/cases").then((r) => setCases(r.data)); }, []);
    return (
        <MobileFrame>
            <div className="px-5 pt-5 pb-24">
                <h2 className="font-serif font-black text-2xl text-olive">Drafted Complaints</h2>
                <div className="hindi text-sm text-brown">शिकायत मसौदे</div>
                <div className="mt-4 space-y-3">
                    {cases.map((c) => (
                        <button
                            key={c.case_id}
                            onClick={() => nav(`/complaint/${c.case_id}`)}
                            className="press w-full text-left bg-white border border-sand rounded-2xl p-4 flex items-center gap-3"
                            data-testid={`draft-row-${c.case_id}`}
                        >
                            <div className="h-11 w-11 rounded-xl bg-olive text-white flex items-center justify-center">
                                <FileText size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-serif font-bold text-olive">#{c.case_id}</div>
                                <div className="text-[12px] text-muted-foreground truncate">{c.narrative}</div>
                            </div>
                        </button>
                    ))}
                    {cases.length === 0 && (
                        <div className="text-sm text-muted-foreground bg-white border border-sand rounded-2xl p-5 text-center">
                            No drafts yet.
                        </div>
                    )}
                </div>
            </div>
        </MobileFrame>
    );
}
