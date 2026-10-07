import React, { useRef, useEffect } from "react";

export default function OTPInput({ value, onChange, length = 4, testIdPrefix = "otp" }) {
    const refs = useRef([]);

    useEffect(() => {
        if (refs.current[0]) refs.current[0].focus();
    }, []);

    const setDigit = (i, d) => {
        const only = d.replace(/\D/g, "").slice(-1);
        const chars = (value || "").padEnd(length, " ").split("");
        chars[i] = only || " ";
        const next = chars.join("").replace(/ /g, "").slice(0, length);
        onChange(next);
        if (only && i < length - 1) refs.current[i + 1]?.focus();
    };

    const onKey = (i, e) => {
        if (e.key === "Backspace") {
            if (!(value[i] || "") && i > 0) refs.current[i - 1]?.focus();
            else if (value[i]) {
                const chars = value.padEnd(length, " ").split("");
                chars[i] = " ";
                onChange(chars.join("").replace(/ /g, ""));
            }
        } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
        else if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
    };

    const onPaste = (e) => {
        const txt = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, length);
        if (txt) {
            e.preventDefault();
            onChange(txt);
            const idx = Math.min(txt.length, length - 1);
            refs.current[idx]?.focus();
        }
    };

    return (
        <div className="flex items-center justify-center gap-3">
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => (refs.current[i] = el)}
                    data-testid={`${testIdPrefix}-${i}`}
                    inputMode="numeric"
                    maxLength={1}
                    value={value[i] || ""}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => onKey(i, e)}
                    onPaste={onPaste}
                    className="w-12 h-14 text-center text-2xl font-serif font-bold bg-white border border-sand rounded-xl focus:border-olive focus:ring-2 focus:ring-olive/30 outline-none"
                />
            ))}
        </div>
    );
}
