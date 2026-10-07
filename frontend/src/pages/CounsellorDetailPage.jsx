import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MobileFrame from "@/components/MobileFrame";
import { api } from "@/lib/api";
import { toast } from "sonner";
import SVIGauge from "@/components/SVIGauge";
import CaseTimeline from "@/components/CaseTimeline";
import { Check, Flag, Megaphone, NotebookPen, Play } from "lucide-react";

export default function CounsellorDetailPage() {
    const { caseId } = useParams();
    const nav = useNavigate();
    const [c, setC] = useState(null);
    const [note, setNote] = useState("");
    const [escalateTarget, setEscalateTarget] = useState("counselling");
    const [busy, setBusy] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);

    const load = () => api.get(`/cases/${caseId}`).then((r) => setC(r.data));

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [caseId]);

    const playAudio = async () => {
        try {
            const r = await api.get(`/cases/${caseId}/audio`);
            if (!r.data.audio_b64) return toast.info("No audio recorded for this case");
            const bin = atob(r.data.audio_b64);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            const blob = new Blob([bytes], { type: "audio/webm" });
            setAudioUrl(URL.createObjectURL(blob));
            toast.success("Audio decrypted · playing");
        } catch { toast.error("Failed to decrypt audio"); }
    };

    const accept = async () => {
        setBusy(true);
        try { await api.patch(`/cases/${caseId}`, { accept: true, stage: "Verified" }); toast.success("Accepted"); load(); }
        catch { toast.error("Failed"); } finally { setBusy(false); }
    };

    const addNote = async () => {
        if (!note.trim()) return;
        setBusy(true);
        try { await api.patch(`/cases/${caseId}`, { notes: note }); setNote(""); toast.success("Note saved"); load(); }
        catch { toast.error("Failed"); } finally { setBusy(false); }
    };

    const escalate = async () => {
        setBusy(true);
        try { await api.post(`/cases/${caseId}/escalate`, { target: escalateTarget, note: "escalated via portal" }); toast.success("Mock NHAA hand-off logged"); load(); }
        catch { toast.error("Failed"); } finally { setBusy(false); }
    };

    if (!c) return <MobileFrame showBack><div className="p-6">Loading…</div></MobileFrame>;

    return (
        <MobileFrame showBack hideNav>
            <div className="px-5 pt-5 pb-24 animate-fade-up">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Case #{c.case_id}</div>
                <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">{c.category}</h2>
                <div className="text-[11px] text-muted-foreground">{c.user_masked} · {new Date(c.created_at).toLocaleString()}</div>

                <div className="mt-4 bg-white border border-sand rounded-[20px] p-4">
                    <SVIGauge score={c.assessment?.svi} />
                </div>

                <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                    <div className="font-serif font-bold text-olive mb-2">Narrative</div>
                    <div className="text-sm text-foreground/85 whitespace-pre-wrap" data-testid="case-narrative">{c.narrative}</div>
                    {c.voice_consent && (
                        <div className="mt-3">
                            <button
                                data-testid="play-audio-btn"
                                onClick={playAudio}
                                className="press inline-flex items-center gap-2 bg-olive text-white rounded-full px-4 py-2 text-xs font-medium"
                            >
                                <Play size={14}/> Play Encrypted Audio
                            </button>
                            {audioUrl && (
                                <audio controls src={audioUrl} className="mt-3 w-full" data-testid="audio-player" />
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                    <div className="font-serif font-bold text-olive mb-2">SVI Factors</div>
                    <ul className="space-y-2">
                        {(c.assessment?.factors || []).map((f, i) => (
                            <li key={i} className="text-sm bg-cream border border-sand rounded-xl p-2">
                                <span className="font-semibold text-olive">{f.label}</span> · <span className="text-muted-foreground">{f.detail}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                    <div className="font-serif font-bold text-olive mb-2">Timeline</div>
                    <CaseTimeline completed={c.stages_completed} current={c.stage} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <button data-testid="accept-case" onClick={accept} disabled={busy} className="press bg-olive text-white rounded-full py-3 font-medium flex items-center justify-center gap-2">
                        <Check size={16}/> Accept
                    </button>
                    <button data-testid="open-case-draft" onClick={() => nav(`/complaint/${c.case_id}`)} className="press border border-sand bg-white text-brown rounded-full py-3 font-medium">Open Draft</button>
                </div>

                <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                    <div className="font-serif font-bold text-olive flex items-center gap-2"><NotebookPen size={16}/> Add Note</div>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} data-testid="counsellor-note" className="mt-2 w-full bg-cream border border-sand rounded-xl p-3 text-sm outline-none focus:border-olive" placeholder="Internal note…" />
                    <button data-testid="save-note-btn" onClick={addNote} disabled={busy} className="press mt-2 bg-gold hover:bg-gold-dark text-white rounded-full py-2 px-4 text-sm">Save Note</button>
                    <div className="mt-3 space-y-2">
                        {(c.notes || []).map((n, i) => (
                            <div key={i} className="text-[12px] bg-cream border border-sand rounded-xl p-2">
                                <div className="text-muted-foreground text-[10px]">{new Date(n.at).toLocaleString()}</div>
                                {n.text}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                    <div className="font-serif font-bold text-olive flex items-center gap-2"><Flag size={16}/> Escalate (Mock NHAA)</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {["law_enforcement", "counselling", "rehab"].map((k) => (
                            <button key={k} data-testid={`escalate-target-${k}`} onClick={() => setEscalateTarget(k)} className={`press px-3 py-1.5 rounded-full text-xs border ${escalateTarget === k ? "bg-olive text-white border-olive" : "bg-cream border-sand text-brown"}`}>
                                {k.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                    <button data-testid="escalate-btn" onClick={escalate} disabled={busy} className="press mt-3 bg-deepred text-white rounded-full py-2.5 px-5 text-sm font-medium flex items-center gap-2">
                        <Megaphone size={16}/> Submit Hand-off
                    </button>
                </div>
            </div>
        </MobileFrame>
    );
}
