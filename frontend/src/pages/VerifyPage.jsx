import { errMsg } from "@/lib/api";
import React from "react";
import MobileFrame from "@/components/MobileFrame";
import { useNavigate } from "react-router-dom";
import { intakeStore, useIntakeStore } from "@/pages/IntakeStore";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { CheckCheck, Pencil, FilePlus } from "lucide-react";

const CAT_LABEL = {
    physical: "Physical Violence · शारीरिक हिंसा",
    caste: "Caste-based Abuse · जाति आधारित दुर्व्यवहार",
    property: "Property / Eviction · संपत्ति",
    social_boycott: "Social Boycott · सामाजिक बहिष्कार",
    sexual: "Sexual Violence · यौन हिंसा",
    discrimination: "Discrimination · भेदभाव",
};

export default function VerifyPage() {
    const nav = useNavigate();
    const s = useIntakeStore();
    const [busy, setBusy] = React.useState(false);

    const confirm = async () => {
        setBusy(true);
        try {
            const payload = {
                category: s.category,
                narrative: s.narrative,
                language: s.language,
                voice_metrics: s.voice_metrics,
                threat_present: s.threat_present,
                isolation: s.isolation,
                timeline: s.timeline,
                location: s.location,
                voice_consent: s.voice_consent,
                audio_b64: s.audio_b64,
                proof_files: s.proof_files,
            };
            const r = await api.post("/cases", payload);
            intakeStore.set({ assessment: r.data.assessment, case_id: r.data.case_id });
            // Advance stage
            try { await api.patch(`/cases/${r.data.case_id}`, { stage: "Verified" }); } catch {}
            nav("/intake/assessment");
        } catch (e) {
            toast.error(errMsg(e, "Could not submit case"));
        } finally {
            setBusy(false);
        }
    };

    const onProofChange = async (e) => {
        const files = Array.from(e.target.files || []);
        const encoded = await Promise.all(files.map((f) => new Promise((res) => {
            const r = new FileReader();
            r.onloadend = () => res({ name: f.name, size: f.size, type: f.type, data: String(r.result).slice(0, 200000) });
            r.readAsDataURL(f);
        })));
        intakeStore.setField("proof_files", encoded);
    };

    return (
        <MobileFrame showBack>
            <div className="px-5 pt-5 pb-28 animate-fade-up">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Step 3 of 4 · Fact check</div>
                <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">Does this look right?</h2>
                <div className="hindi text-sm text-brown">क्या विवरण सही है?</div>

                <div className="mt-4 space-y-3">
                    <div className="bg-white border border-sand rounded-2xl p-4">
                        <div className="text-[11px] font-semibold uppercase text-brown">Category</div>
                        <div className="font-serif text-olive font-semibold mt-0.5">{CAT_LABEL[s.category] || s.category}</div>
                    </div>
                    <div className="bg-white border border-sand rounded-2xl p-4">
                        <div className="text-[11px] font-semibold uppercase text-brown">Grievance narrative</div>
                        <div className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap" data-testid="verify-narrative">
                            {s.narrative || "—"}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white border border-sand rounded-2xl p-4">
                            <div className="text-[11px] font-semibold uppercase text-brown">When</div>
                            <div className="text-sm mt-1">{s.timeline || "—"}</div>
                        </div>
                        <div className="bg-white border border-sand rounded-2xl p-4">
                            <div className="text-[11px] font-semibold uppercase text-brown">Where</div>
                            <div className="text-sm mt-1">{s.location || "—"}</div>
                        </div>
                    </div>
                    <label className="bg-white border border-sand rounded-2xl p-4 flex items-center gap-3 cursor-pointer">
                        <div className="h-10 w-10 rounded-xl bg-cream border border-sand flex items-center justify-center text-olive">
                            <FilePlus size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-medium text-olive">Attach proof (optional)</div>
                            <div className="text-[11px] text-muted-foreground">Photos, documents · {s.proof_files?.length || 0} added</div>
                        </div>
                        <input data-testid="proof-input" type="file" accept="image/*,.pdf,.doc,.docx" multiple onChange={onProofChange} className="hidden" />
                    </label>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                        data-testid="clarify-btn"
                        onClick={() => nav("/intake/record")}
                        className="press border border-sand bg-white text-brown rounded-full py-3 font-medium flex items-center justify-center gap-2"
                    >
                        <Pencil size={16} /> Let Me Clarify
                    </button>
                    <button
                        data-testid="confirm-btn"
                        disabled={busy}
                        onClick={confirm}
                        className="press bg-gold hover:bg-gold-dark text-white rounded-full py-3 font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <CheckCheck size={16} /> Yes, That's Right
                    </button>
                </div>
            </div>
        </MobileFrame>
    );
}
