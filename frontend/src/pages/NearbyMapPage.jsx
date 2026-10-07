import React, { useEffect, useMemo, useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import { api } from "@/lib/api";
import { MapPin, Phone, Navigation, Users, Scale, Heart } from "lucide-react";

const TYPES = {
    counsellor: { Icon: Users, label: "Counsellor", color: "#4A5A1E" },
    legal_aid: { Icon: Scale, label: "Legal Aid", color: "#7A4A12" },
    rehab: { Icon: Heart, label: "Rehab", color: "#C4694A" },
};

// Haversine distance in km
function haversine(a, b) {
    if (!a || !b || a.lat == null || b.lat == null) return null;
    const R = 6371;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const la1 = toRad(a.lat);
    const la2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}

export default function NearbyMapPage() {
    const [rows, setRows] = useState([]);
    const [me, setMe] = useState(null); // {lat, lng}
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        api.get("/support-directory").then((r) => setRows(r.data));
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (p) => setMe({ lat: p.coords.latitude, lng: p.coords.longitude }),
                () => setMe({ lat: 28.6139, lng: 77.2090 }), // default Delhi
                { enableHighAccuracy: false, timeout: 6000 }
            );
        } else {
            setMe({ lat: 28.6139, lng: 77.2090 });
        }
    }, []);

    const sorted = useMemo(() => {
        const base = filter === "all" ? rows : rows.filter((r) => r.type === filter);
        if (!me) return base;
        return [...base]
            .map((r) => ({ ...r, _dist: haversine(me, r) }))
            .sort((a, b) => (a._dist ?? 9e9) - (b._dist ?? 9e9));
    }, [rows, me, filter]);

    // Build OpenStreetMap static embed URL (no key needed)
    const mapSrc = useMemo(() => {
        if (!me) return null;
        const bb = `${me.lng - 2.5}%2C${me.lat - 2.5}%2C${me.lng + 2.5}%2C${me.lat + 2.5}`;
        const marker = `${me.lat}%2C${me.lng}`;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bb}&layer=mapnik&marker=${marker}`;
    }, [me]);

    return (
        <MobileFrame>
            <div className="px-5 pt-5 pb-24">
                <h2 className="font-serif font-black text-2xl text-olive">Nearby Help</h2>
                <div className="hindi text-sm text-brown">नज़दीकी मदद</div>

                <div className="mt-3 bg-white border border-sand rounded-2xl overflow-hidden" data-testid="nearby-map">
                    {mapSrc ? (
                        <iframe
                            title="Nearby map"
                            src={mapSrc}
                            className="w-full h-48 border-0"
                            loading="lazy"
                        />
                    ) : (
                        <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">Fetching your location…</div>
                    )}
                    <div className="px-3 py-2 border-t border-sand text-[11px] text-muted-foreground flex items-center gap-1">
                        <MapPin size={11} className="text-olive"/>
                        {me ? `${me.lat.toFixed(3)}, ${me.lng.toFixed(3)}` : "—"} · map © OpenStreetMap
                    </div>
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto">
                    {["all", "legal_aid", "rehab", "counsellor"].map((k) => (
                        <button
                            key={k}
                            data-testid={`nearby-filter-${k}`}
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
                    {sorted.map((r) => {
                        const T = TYPES[r.type] || TYPES.counsellor;
                        const Icon = T.Icon;
                        const dist = r._dist != null ? r._dist.toFixed(0) + " km" : "";
                        const dirHref = `https://www.openstreetmap.org/directions?from=${me?.lat},${me?.lng}&to=${r.lat},${r.lng}`;
                        return (
                            <div key={r.id} className="bg-white border border-sand rounded-2xl p-4 flex items-start gap-3" data-testid={`nearby-row-${r.id}`}>
                                <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: T.color }}>
                                    <Icon size={18}/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-serif font-bold text-olive truncate">{r.name}</div>
                                    <div className="text-[11px] text-muted-foreground">{T.label} · {r.city} · {dist}</div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <a href={`tel:${r.phone.replace(/\s+/g, "")}`} className="press bg-wa text-white rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1" data-testid={`nearby-call-${r.id}`}>
                                        <Phone size={12}/> Call
                                    </a>
                                    <a href={dirHref} target="_blank" rel="noreferrer" className="press border border-sand text-olive bg-white rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1" data-testid={`nearby-dir-${r.id}`}>
                                        <Navigation size={12}/> Route
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </MobileFrame>
    );
}
