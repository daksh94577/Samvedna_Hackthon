import React from "react";

const levelColor = (score) => {
    if (score >= 80) return { bg: "#8B2A1A", label: "Critical" };
    if (score >= 55) return { bg: "#C4694A", label: "High" };
    if (score >= 30) return { bg: "#B8862B", label: "Moderate" };
    return { bg: "#25C05F", label: "Low" };
};

export default function SVIGauge({ score = 0 }) {
    const s = Math.max(0, Math.min(100, Number(score) || 0));
    const { bg, label } = levelColor(s);
    // half-doughnut using SVG arc
    const r = 70;
    const circ = Math.PI * r; // half circle
    const dash = (s / 100) * circ;

    return (
        <div className="relative w-full flex flex-col items-center">
            <svg viewBox="0 0 200 120" className="w-full max-w-[260px]">
                <path d="M 20 110 A 70 70 0 0 1 180 110" stroke="#D3C7AC" strokeWidth="16" fill="none" strokeLinecap="round" />
                <path
                    d="M 20 110 A 70 70 0 0 1 180 110"
                    stroke={bg}
                    strokeWidth="16"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circ}`}
                    style={{ transition: "stroke-dasharray 0.8s ease-out" }}
                />
            </svg>
            <div className="-mt-10 text-center">
                <div className="font-serif text-5xl font-black" style={{ color: bg }} data-testid="svi-score">
                    {Math.round(s)}
                </div>
                <div
                    className="inline-flex mt-1 rounded-full px-3 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: bg }}
                    data-testid="svi-level"
                >
                    {label}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">SVI 0–100 · Severe Vulnerability Index</div>
            </div>
        </div>
    );
}

export { levelColor };
