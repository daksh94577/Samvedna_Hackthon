import React, { useEffect, useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import { useIntakeStore } from "@/pages/IntakeStore";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import { saveAs } from "file-saver";
import { Download, FileText } from "lucide-react";

export default function ComplaintPage() {
    const { caseId: paramCase } = useParams();
    const s = useIntakeStore();
    const caseId = paramCase || s.case_id;
    const [draft, setDraft] = useState(null);
    const [tab, setTab] = useState("english");

    useEffect(() => {
        if (!caseId) return;
        api.get(`/cases/${caseId}/draft`)
            .then((r) => setDraft(r.data))
            .catch(() => toast.error("Could not load draft"));
    }, [caseId]);

    const downloadPDF = () => {
        if (!draft) return;
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const text = tab === "english" ? draft.english : draft.hindi;
        // Hindi may not render in default jsPDF fonts; fall back to english always available
        const useText = tab === "english" ? text : draft.english + "\n\n---\n(Hindi version is available in the DOCX download for proper Devanagari rendering.)";
        const lines = doc.splitTextToSize(useText, 520);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(lines, 40, 50);
        doc.save(`Samvedna-Complaint-${caseId}.pdf`);
    };

    const downloadDOCX = async () => {
        if (!draft) return;
        const doc = new Document({
            sections: [
                {
                    children: [
                        new Paragraph({ text: `Samvedna / संवेदना — Complaint Draft #${caseId}`, heading: HeadingLevel.TITLE }),
                        new Paragraph(""),
                        new Paragraph({ text: "English", heading: HeadingLevel.HEADING_1 }),
                        ...draft.english.split("\n").map((line) => new Paragraph({ children: [new TextRun(line)] })),
                        new Paragraph(""),
                        new Paragraph({ text: "हिंदी", heading: HeadingLevel.HEADING_1 }),
                        ...draft.hindi.split("\n").map((line) => new Paragraph({ children: [new TextRun(line)] })),
                    ],
                },
            ],
        });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Samvedna-Complaint-${caseId}.docx`);
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
                            <button
                                data-testid="draft-tab-en"
                                className={`px-4 py-1.5 rounded-full font-medium ${tab === "english" ? "bg-olive text-white" : "text-brown"}`}
                                onClick={() => setTab("english")}
                            >
                                English
                            </button>
                            <button
                                data-testid="draft-tab-hi"
                                className={`px-4 py-1.5 rounded-full font-medium ${tab === "hindi" ? "bg-olive text-white" : "text-brown"}`}
                                onClick={() => setTab("hindi")}
                            >
                                हिंदी
                            </button>
                        </div>

                        <div className="mt-4 bg-white border border-sand rounded-2xl p-4 whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90 max-h-[52vh] overflow-y-auto" data-testid="draft-body">
                            {tab === "english" ? draft.english : draft.hindi}
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <button
                                data-testid="download-pdf"
                                onClick={downloadPDF}
                                className="press bg-gold hover:bg-gold-dark text-white rounded-full py-3 font-medium flex items-center justify-center gap-2"
                            >
                                <Download size={16} /> PDF
                            </button>
                            <button
                                data-testid="download-docx"
                                onClick={downloadDOCX}
                                className="press bg-brown hover:bg-brown/90 text-white rounded-full py-3 font-medium flex items-center justify-center gap-2"
                            >
                                <FileText size={16} /> DOCX
                            </button>
                        </div>
                    </>
                )}
            </div>
        </MobileFrame>
    );
}
