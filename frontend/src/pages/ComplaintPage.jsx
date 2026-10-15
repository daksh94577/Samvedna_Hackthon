import { errMsg } from "@/lib/api";
import React, { useEffect, useRef, useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import { useIntakeStore } from "@/pages/IntakeStore";
import { useParams } from "react-router-dom";
import { api, API } from "@/lib/api";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import { saveAs } from "file-saver";
import { Download, FileText, Paperclip, Package, Mail, Trash2 } from "lucide-react";

export default function ComplaintPage() {
    const { caseId: paramCase } = useParams();
    const s = useIntakeStore();
    const caseId = paramCase || s.case_id;
    const [draft, setDraft] = useState(null);
    const [tab, setTab] = useState("english");
    const [attachments, setAttachments] = useState([]);
    const [busy, setBusy] = useState(false);
    const fileRef = useRef(null);

    useEffect(() => {
        if (!caseId) return;
        api.get(`/cases/${caseId}/draft`).then((r) => setDraft(r.data)).catch(() => toast.error("Could not load draft"));
        api.get(`/cases/${caseId}/attachments`).then((r) => setAttachments(r.data)).catch(() => {});
    }, [caseId]);

    const downloadPDF = () => {
        if (!draft) return;
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const text = tab === "english" ? draft.english : draft.english + "\n\n---\n(Hindi version is in the DOCX for proper Devanagari rendering.)";
        const lines = doc.splitTextToSize(text, 520);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(lines, 40, 50);
        doc.save(`Samvedna-Complaint-${caseId}.pdf`);
    };

    const downloadDOCX = async () => {
        if (!draft) return;
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ text: `Samvedna / संवेदना — Complaint Draft #${caseId}`, heading: HeadingLevel.TITLE }),
                    new Paragraph(""),
                    new Paragraph({ text: "English", heading: HeadingLevel.HEADING_1 }),
                    ...draft.english.split("\n").map((l) => new Paragraph({ children: [new TextRun(l)] })),
                    new Paragraph(""),
                    new Paragraph({ text: "हिंदी", heading: HeadingLevel.HEADING_1 }),
                    ...draft.hindi.split("\n").map((l) => new Paragraph({ children: [new TextRun(l)] })),
                ],
            }],
        });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Samvedna-Complaint-${caseId}.docx`);
    };

    const addAttachments = async (e) => {
        const files = Array.from(e.target.files || []);
        setBusy(true);
        try {
            for (const f of files) {
                if (f.size > 5 * 1024 * 1024) {
                    toast.error(`${f.name} too large (max 5 MB)`);
                    continue;
                }
                const b64 = await new Promise((res) => {
                    const r = new FileReader();
                    r.onloadend = () => res(String(r.result).split(",")[1] || "");
                    r.readAsDataURL(f);
                });
                const r = await api.post(`/cases/${caseId}/attachments`, {
                    filename: f.name,
                    content_type: f.type || "application/octet-stream",
                    data_b64: b64,
                });
                setAttachments((xs) => [...xs, r.data]);
            }
            toast.success("Encrypted & attached");
        } catch (err) {
            toast.error(errMsg(err, "Upload failed"));
        } finally {
            setBusy(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    const downloadAttachment = async (att) => {
        try {
            const r = await api.get(`/cases/${caseId}/attachments/${att.id}`);
            const bin = atob(r.data.data_b64);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            saveAs(new Blob([bytes], { type: r.data.content_type }), r.data.filename);
        } catch {
            toast.error("Could not decrypt attachment");
        }
    };

    const exportPack = async () => {
        try {
            const token = localStorage.getItem("samvedna_token");
            const res = await fetch(`${API}/cases/${caseId}/export`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error("export failed");
            const blob = await res.blob();
            saveAs(blob, `Samvedna-${caseId}.zip`);
            toast.success("Evidence pack downloaded");
        } catch {
            toast.error("Export failed");
        }
    };

    const emailLegalAid = () => {
        const subject = encodeURIComponent(`Samvedna Case #${caseId} — Evidence pack enclosed`);
        const body = encodeURIComponent(
            `Namaste,\n\nI am sharing the evidence pack for Samvedna case #${caseId} under the SC/ST (PoA) Act, 1989.\n\n` +
            `Attach the downloaded Samvedna-${caseId}.zip file to this email before sending.\n\n` +
            `Case summary and bilingual complaint draft are inside the zip.\n\nRegards,\nSamvedna / संवेदना`
        );
        window.location.href = `mailto:nalsa-dc@nic.in?cc=&subject=${subject}&body=${body}`;
    };

    return (
        <MobileFrame showBack>
            <div className="px-5 pt-5 pb-28 animate-fade-up">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Complaint Draft</div>
                <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">Bilingual Draft</h2>
                <div className="hindi text-sm text-brown">शिकायत मसौदा</div>

                {!draft ? (
                    <div className="mt-6 text-muted-foreground text-sm">Generating draft…</div>
                ) : (
                    <>
                        <div className="mt-4 inline-flex bg-white border border-sand rounded-full p-1 text-sm">
                            <button data-testid="draft-tab-en" className={`px-4 py-1.5 rounded-full font-medium ${tab === "english" ? "bg-olive text-white" : "text-brown"}`} onClick={() => setTab("english")}>English</button>
                            <button data-testid="draft-tab-hi" className={`px-4 py-1.5 rounded-full font-medium ${tab === "hindi" ? "bg-olive text-white" : "text-brown"}`} onClick={() => setTab("hindi")}>हिंदी</button>
                        </div>
                        <div className="mt-4 bg-white border border-sand rounded-2xl p-4 whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90 max-h-[42vh] overflow-y-auto" data-testid="draft-body">
                            {tab === "english" ? draft.english : draft.hindi}
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <button data-testid="download-pdf" onClick={downloadPDF} className="press bg-gold hover:bg-gold-dark text-white rounded-full py-3 font-medium flex items-center justify-center gap-2">
                                <Download size={16}/> PDF
                            </button>
                            <button data-testid="download-docx" onClick={downloadDOCX} className="press bg-brown hover:bg-brown/90 text-white rounded-full py-3 font-medium flex items-center justify-center gap-2">
                                <FileText size={16}/> DOCX
                            </button>
                        </div>
                    </>
                )}

                {/* Attachments */}
                <div className="mt-5 bg-white border border-sand rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-serif font-bold text-olive flex items-center gap-2"><Paperclip size={16}/> Proof Attachments</div>
                            <div className="hindi text-[11px] text-muted-foreground">सबूत संलग्न</div>
                        </div>
                        <button
                            data-testid="add-attachment"
                            onClick={() => fileRef.current?.click()}
                            disabled={busy}
                            className="press bg-gold hover:bg-gold-dark text-white rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1"
                        >
                            + Attach
                        </button>
                        <input ref={fileRef} data-testid="attachment-input" type="file" accept="image/*,.pdf,.doc,.docx" multiple onChange={addAttachments} className="hidden" />
                    </div>
                    <div className="mt-3 space-y-2">
                        {attachments.map((a) => (
                            <div key={a.id} className="flex items-center gap-2 bg-cream border border-sand rounded-xl p-2 text-sm">
                                <FileText size={14} className="text-olive"/>
                                <div className="flex-1 min-w-0 truncate">{a.filename}</div>
                                <button data-testid={`dl-att-${a.id}`} onClick={() => downloadAttachment(a)} className="press text-xs text-olive underline">Decrypt & Save</button>
                            </div>
                        ))}
                        {attachments.length === 0 && (
                            <div className="text-[11px] text-muted-foreground">No proof attached yet. Add images or PDFs — they're AES-256 encrypted and only decrypted on your or your counsellor's device.</div>
                        )}
                    </div>
                </div>

                {/* Govt Export Pack */}
                <div className="mt-5 bg-olive text-white rounded-[20px] p-5">
                    <div className="font-serif font-bold text-lg flex items-center gap-2"><Package size={18}/> Govt Export Pack</div>
                    <div className="hindi text-cream/80 text-xs mt-0.5">सरकारी सबूत पैक</div>
                    <p className="text-sm text-cream/90 mt-2 leading-relaxed">
                        One tap bundles your bilingual complaint, audio, proof files and metadata into a single zip, ready to email to a legal-aid officer or NHAA desk.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <button data-testid="export-zip-btn" onClick={exportPack} className="press bg-gold hover:bg-gold-dark text-white rounded-full py-2.5 font-medium flex items-center justify-center gap-2">
                            <Download size={16}/> Download .zip
                        </button>
                        <button data-testid="email-handoff-btn" onClick={emailLegalAid} className="press bg-wa text-white rounded-full py-2.5 font-medium flex items-center justify-center gap-2">
                            <Mail size={16}/> Email Handoff
                        </button>
                    </div>
                </div>
            </div>
        </MobileFrame>
    );
}
