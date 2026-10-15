import React from "react";
import { PhoneCall } from "lucide-react";

export default function HelplineBanner({ compact = false }) {
    return (
        <a
            data-testid="helpline-banner"
            href="tel:14566"
            className={`press block bg-deepred text-white ${compact ? "py-3 px-4 rounded-2xl" : "py-4 px-5 rounded-[20px]"} shadow-md`}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center ring-1 ring-white/20">
                        <PhoneCall size={18} />
                    </div>
                    <div>
                        <div className="text-xs opacity-80 font-medium">24/7 NHAA Helpline</div>
                        <div className="font-serif text-xl font-bold leading-tight">14566</div>
                    </div>
                </div>
                <div className="text-[11px] text-white/80 text-right font-medium">
                    Tap to Call<br />अभी कॉल करें
                </div>
            </div>
        </a>
    );
}
