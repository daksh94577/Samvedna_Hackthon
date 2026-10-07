import React, { useEffect, useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import { api } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, AlertOctagon, Timer, Flame } from "lucide-react";

const SVI_COLORS = { Low: "#25C05F", Moderate: "#B8862B", High: "#C4694A", Critical: "#8B2A1A" };

export default function ImpactPage() {
    const [data, setData] = useState(null);
    useEffect(() => {
        api.get("/supervisor/impact?days=7").then((r) => setData(r.data));
    }, []);

    if (!data) return <MobileFrame showBack hideNav><div className="p-6">Loading impact…</div></MobileFrame>;

    return (
        <MobileFrame showBack hideNav>
            <div className="px-5 pt-5 pb-10 animate-fade-up">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Supervisor</div>
                <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">Impact Dashboard</h2>
                <div className="hindi text-sm text-brown">सप्ताहिक रिपोर्ट · last 7 days</div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                    <Kpi Icon={TrendingUp} label="Total cases" sub="पिछले ७ दिन" value={data.total_cases} color="#4A5A1E" testid="kpi-total"/>
                    <Kpi Icon={AlertOctagon} label="Critical" sub="तत्काल" value={data.critical_cases} color="#8B2A1A" testid="kpi-critical"/>
                    <Kpi Icon={Flame} label="Escalations" sub="भेजे गए" value={data.total_escalations} color="#C4694A" testid="kpi-esc"/>
                    <Kpi Icon={Timer} label="Avg time-to-escalate" sub="मिनट" value={data.avg_time_to_escalation_min ?? "—"} suffix={data.avg_time_to_escalation_min != null ? " min" : ""} color="#7A4A12" testid="kpi-tte"/>
                </div>

                <Card title="Daily case volume" hi="रोज़ाना मामले" testid="chart-daily">
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={data.daily}>
                            <CartesianGrid stroke="#D3C7AC" strokeDasharray="3 3"/>
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#7A4A12" }} tickFormatter={(d) => d.slice(5)} />
                            <YAxis tick={{ fontSize: 10, fill: "#7A4A12" }} allowDecimals={false}/>
                            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, borderColor: "#D3C7AC" }}/>
                            <Bar dataKey="count" fill="#4A5A1E" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="SVI distribution" hi="गंभीरता वितरण" testid="chart-svi">
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={data.svi_distribution} dataKey="count" nameKey="level" outerRadius={70} innerRadius={38} paddingAngle={2}>
                                {data.svi_distribution.map((e, i) => <Cell key={i} fill={SVI_COLORS[e.level] || "#D3C7AC"}/>)}
                            </Pie>
                            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, borderColor: "#D3C7AC" }}/>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 mt-2">
                        {data.svi_distribution.map((e) => (
                            <div key={e.level} className="flex items-center gap-1 text-[11px] text-brown">
                                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: SVI_COLORS[e.level] }}/>
                                {e.level} · {e.count}
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Case categories" hi="श्रेणीवार" testid="chart-categories">
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart layout="vertical" data={data.categories}>
                            <CartesianGrid stroke="#D3C7AC" strokeDasharray="3 3"/>
                            <XAxis type="number" tick={{ fontSize: 10, fill: "#7A4A12" }} allowDecimals={false}/>
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#7A4A12" }} width={100}/>
                            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, borderColor: "#D3C7AC" }}/>
                            <Bar dataKey="count" fill="#B8862B" radius={[0, 6, 6, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </MobileFrame>
    );
}

function Kpi({ Icon, label, sub, value, color, suffix = "", testid }) {
    return (
        <div className="bg-white border border-sand rounded-2xl p-4" data-testid={testid}>
            <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: color }}>
                <Icon size={16}/>
            </div>
            <div className="font-serif font-black text-2xl text-olive mt-2 leading-none">{value}{suffix}</div>
            <div className="text-[11px] text-brown font-medium mt-1">{label}</div>
            <div className="hindi text-[10px] text-muted-foreground">{sub}</div>
        </div>
    );
}

function Card({ title, hi, children, testid }) {
    return (
        <div className="mt-4 bg-white border border-sand rounded-2xl p-4" data-testid={testid}>
            <div className="font-serif font-bold text-olive">{title}</div>
            <div className="hindi text-[11px] text-muted-foreground">{hi}</div>
            <div className="mt-2">{children}</div>
        </div>
    );
}
