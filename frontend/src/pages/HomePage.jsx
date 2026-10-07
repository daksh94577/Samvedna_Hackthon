import React from "react";
import MobileFrame from "@/components/MobileFrame";
import HelplineBanner from "@/components/HelplineBanner";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { ArrowRight, ClipboardList, Users, FileText, History, Mic } from "lucide-react";

const Tile = ({ Icon, label, hi, to, testid }) => {
    const nav = useNavigate();
    return (
        <button
            data-testid={testid}
            onClick={() => nav(to)}
            className="press text-left bg-white border border-sand rounded-2xl p-4 flex flex-col gap-2 hover:-translate-y-0.5 transition-transform"
        >
            <div className="h-10 w-10 rounded-xl bg-cream border border-sand flex items-center justify-center text-olive">
                <Icon size={18} />
            </div>
            <div>
                <div className="font-serif font-bold text-olive leading-tight">{label}</div>
                <div className="hindi text-[11px] text-muted-foreground">{hi}</div>
            </div>
        </button>
    );
};

export default function HomePage() {
    const nav = useNavigate();
    const { user } = useApp();

    return (
        <MobileFrame>
            <div className="px-5 pt-4 pb-24">
                <HelplineBanner />
                <div className="mt-5 bg-olive text-white rounded-[20px] p-5 shadow-md relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 h-28 w-28 rounded-full bg-white/5" />
                    <div className="relative">
                        <div className="hindi text-cream/70 text-xs font-medium">नई समस्या बताएँ</div>
                        <div className="font-serif font-black text-2xl mt-1 leading-tight">
                            Describe a New Problem
                        </div>
                        <div className="text-sm text-cream/80 mt-1 max-w-[280px]">
                            Share what happened — voice or text. Our AI will triage urgency and guide you to the right help.
                        </div>
                        <button
                            data-testid="start-intake-btn"
                            onClick={() => nav("/intake/category")}
                            className="press mt-4 inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white rounded-full py-3 px-5 font-medium transition-colors"
                        >
                            <Mic size={16} /> Start Now · शुरू करें <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                <div className="mt-5">
                    <div className="font-serif font-bold text-olive text-lg">Your Toolkit</div>
                    <div className="hindi text-xs text-muted-foreground">आपका टूलकिट</div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <Tile Icon={ClipboardList} label="Case Timeline" hi="केस टाइमलाइन" to="/history" testid="tile-timeline" />
                    <Tile Icon={Users} label="Support Directory" hi="सहायता निर्देशिका" to="/support-directory" testid="tile-support" />
                    <Tile Icon={FileText} label="Drafted Complaints" hi="शिकायत मसौदे" to="/drafts" testid="tile-drafts" />
                    <Tile Icon={History} label="Query History" hi="पूर्व पूछताछ" to="/history" testid="tile-history" />
                </div>

                <div className="mt-6 bg-white border border-sand rounded-2xl p-4 text-[12px] text-muted-foreground">
                    Logged in as <span className="text-foreground font-medium">{user?.email}</span>
                </div>
            </div>
        </MobileFrame>
    );
}
