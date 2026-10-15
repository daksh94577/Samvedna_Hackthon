import React, { useEffect, useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { levelColor } from "@/components/SVIGauge";
import { AlertTriangle, Headphones, LogOut, Users, Bell, BellRing } from "lucide-react";
import { enablePush, isPushEnabled, testPush } from "@/lib/push";
import { toast } from "sonner";

export default function CounsellorQueuePage() {
    const { user, logout } = useApp();
    const nav = useNavigate();
    const [cases, setCases] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [filter, setFilter] = useState("all"); // all | Critical | High | Moderate | Low
    const [pushOn, setPushOn] = useState(false);

    useEffect(() => {
        api.get("/counsellor/queue").then((r) => setCases(r.data)).catch(() => {});
        api.get("/counsellor/alerts").then((r) => setAlerts(r.data)).catch(() => {});
        isPushEnabled().then(setPushOn);
    }, []);

    const togglePush = async () => {
        try {
            if (pushOn) {
                const r = await testPush();
                toast.success(`Test push sent to ${r.sent}/${r.subs} subscription(s)`);
            } else {
                await enablePush();
                setPushOn(true);
                toast.success("Push alerts enabled · critical cases will notify you");
            }
        } catch (e) {
            toast.error(e.message || "Push setup failed");
        }
    };

    const list = filter === "all" ? cases : cases.filter((c) => c.assessment?.level === filter);

    return (
        <MobileFrame hideNav>
            <div className="px-5 pt-5 pb-10">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">{user?.role?.toUpperCase()}</div>
                        <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">Priority Queue</h2>
                        <div className="hindi text-sm text-brown">प्राथमिकता सूची</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button data-testid="toggle-push" onClick={togglePush} className={`press text-xs rounded-full px-3 py-1.5 flex items-center gap-1 ${pushOn ? "bg-wa text-white" : "bg-white border border-sand text-brown"}`}>
                            {pushOn ? <BellRing size={13}/> : <Bell size={13}/>}
                            {pushOn ? "Test Alert" : "Enable Alerts"}
                        </button>
                        {user?.role === "supervisor" && (
                            <>
                                <button data-testid="go-impact" onClick={() => nav("/impact")} className="press text-xs bg-brown text-white rounded-full px-3 py-1.5">Impact</button>
                                <button data-testid="go-supervisor" onClick={() => nav("/supervisor")} className="press text-xs bg-olive text-white rounded-full px-3 py-1.5">Audit Log</button>
                            </>
                        )}
                        <button data-testid="go-operator" onClick={() => nav("/operator")} className="press text-xs border border-sand bg-white rounded-full px-3 py-1.5 text-brown flex items-center gap-1">
                            <Headphones size={13}/> Operator
                        </button>
                        <button data-testid="counsellor-logout" onClick={() => { logout(); nav("/counsellor"); }} className="press h-8 w-8 rounded-full bg-white border border-sand flex items-center justify-center text-brown">
                            <LogOut size={14}/>
                        </button>
                    </div>
                </div>

                {alerts.length > 0 && (
                    <div className="mt-4 bg-deepred text-white rounded-2xl p-4 flex items-center gap-3">
                        <AlertTriangle size={20} />
                        <div className="text-sm">
                            <div className="font-semibold">Critical alerts</div>
                            <div className="text-white/80 text-xs">{alerts.slice(0, 3).map((a) => a.message).join(" · ")}</div>
                        </div>
                    </div>
                )}

                <div className="mt-4 flex gap-2 overflow-x-auto">
                    {["all", "Critical", "High", "Moderate", "Low"].map((f) => (
                        <button
                            key={f}
                            data-testid={`q-filter-${f}`}
                            onClick={() => setFilter(f)}
                            className={`press px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
                                filter === f ? "bg-olive text-white border-olive" : "bg-white text-brown border-sand"
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Users size={13}/> {list.length} cases · sorted by SVI
                </div>

                <div className="mt-3 space-y-3">
                    {list.map((c) => (
                        <button
                            key={c.case_id}
                            data-testid={`q-row-${c.case_id}`}
                            onClick={() => nav(`/counsellor/${c.case_id}`)}
                            className="press w-full text-left bg-white border border-sand rounded-2xl p-4 flex items-center gap-3"
                        >
                            <div
                                className="h-12 w-12 rounded-xl text-white flex items-center justify-center font-serif font-bold"
                                style={{ backgroundColor: levelColor(c.assessment?.svi || 0).bg }}
                            >
                                {Math.round(c.assessment?.svi || 0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-serif font-bold text-olive">#{c.case_id} · {c.assessment?.level}</div>
                                <div className="text-[11px] text-muted-foreground">{c.category} · {c.user_masked} · {c.stage}</div>
                                <div className="text-[12px] text-foreground/80 line-clamp-1 mt-1">{c.narrative}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </MobileFrame>
    );
}
