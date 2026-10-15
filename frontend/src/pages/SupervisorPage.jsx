import React, { useEffect, useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import { api } from "@/lib/api";
import { Eye } from "lucide-react";

export default function SupervisorPage() {
    const [rows, setRows] = useState([]);
    useEffect(() => { api.get("/supervisor/audit-log").then((r) => setRows(r.data)).catch(() => {}); }, []);
    return (
        <MobileFrame showBack hideNav>
            <div className="px-5 pt-5 pb-10">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Supervisor</div>
                <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">Audit Log</h2>
                <div className="hindi text-sm text-brown">लेखा-जोखा</div>

                <div className="mt-4 space-y-2">
                    {rows.map((r) => (
                        <div key={r.id} className="bg-white border border-sand rounded-2xl p-3 text-sm flex items-start gap-3">
                            <Eye size={14} className="text-olive mt-1"/>
                            <div className="flex-1 min-w-0">
                                <div className="font-serif font-semibold text-olive">{r.action}</div>
                                <div className="text-[11px] text-muted-foreground">{new Date(r.timestamp).toLocaleString()} · user {r.user_id?.slice(0, 8)} · target {r.target?.slice(0, 8)}</div>
                            </div>
                        </div>
                    ))}
                    {rows.length === 0 && (
                        <div className="text-sm text-muted-foreground bg-white border border-sand rounded-2xl p-5 text-center">No audit entries yet.</div>
                    )}
                </div>
            </div>
        </MobileFrame>
    );
}
