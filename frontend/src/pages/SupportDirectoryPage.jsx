import React, { useEffect, useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import { api } from "@/lib/api";
import { Phone, Scale, Heart, Users } from "lucide-react";

const TYPES = {
    counsellor: { Icon: Users, label: "Counsellor", color: "#4A5A1E" },
    legal_aid: { Icon: Scale, label: "Legal Aid", color: "#7A4A12" },
    rehab: { Icon: Heart, label: "Rehab", color: "#C4694A" },
};

export default function SupportDirectoryPage() {
    const [rows, setRows] = useState([]);
    const [filter, setFilter] = useState("all");
    useEffect(() => { api.get("/support-directory").then((r) => setRows(r.data)); }, []);
    const list = filter === "all" ? rows : rows.filter((r) => r.type === filter);
    return (
        <MobileFrame>
            <div className="px-5 pt-5 pb-24">
                <h2 className="font-serif font-black text-2xl text-olive">Support Directory</h2>
                <div className="hindi text-sm text-brown">सहायता निर्देशिका</div>
                <div className="mt-4 flex gap-2 overflow-x-auto">
                    {["all", "counsellor", "legal_aid", "rehab"].map((k) => (
                        <button
                            key={k}
                            data-testid={`filter-${k}`}
                            onClick={() => setFilter(k)}
                            className={`press px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
                                filter === k ? "bg-olive text-white border-olive" : "bg-white text-brown border-sand"
                            }`}
                        >
                            {k === "all" ? "All" : TYPES[k].label}
                        </button>
                    ))}
                </div>
                <div className="mt-4 space-y-3">
                    {list.map((r) => {
                        const T = TYPES[r.type] || TYPES.counsellor;
                        const Icon = T.Icon;
                        return (
                            <div key={r.id} className="bg-white border border-sand rounded-2xl p-4 flex items-start gap-3">
                                <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: T.color }}>
                                    <Icon size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-serif font-bold text-olive">{r.name}</div>
                                    <div className="text-[11px] text-muted-foreground">{T.label} · {r.city} · {r.lang.join(", ")}</div>
                                </div>
                                <a href={`tel:${r.phone.replace(/\s+/g, "")}`} className="press bg-wa text-white rounded-full px-3 py-2 text-xs font-medium flex items-center gap-1" data-testid={`call-${r.id}`}>
                                    <Phone size={14} /> Call
                                </a>
                            </div>
                        );
                    })}
                </div>
            </div>
        </MobileFrame>
    );
}
