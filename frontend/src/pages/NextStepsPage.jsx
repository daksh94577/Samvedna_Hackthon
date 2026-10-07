import React from "react";
import MobileFrame from "@/components/MobileFrame";
import { useNavigate } from "react-router-dom";
import { useIntakeStore } from "@/pages/IntakeStore";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { PhoneCall, UserCheck, FileText, ClipboardList } from "lucide-react";

export default function NextStepsPage() {
    const nav = useNavigate();
    const s = useIntakeStore();

    const connectCounsellor = async () => {
        try {
            await api.patch(`/cases/${s.case_id}`, { stage: "Guidance", notes: "User requested senior counsellor" });
            toast.success("Senior counsellor notified · केस आगे बढ़ाया गया");
        } catch (e) {
            toast.error("Could not connect right now");
        }
    };

    return (
        <MobileFrame showBack>
            <div className="px-5 pt-5 pb-28 animate-fade-up">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Guidance</div>
                <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">Next Steps</h2>
                <div className="hindi text-sm text-brown">अगले कदम</div>

                <ol className="mt-4 space-y-3">
                    {[
                        { n: 1, title: "Secure yourself", body: "Move to a safe place or trusted neighbour; keep your phone charged." , hi: "सुरक्षित जगह पर जाएँ" },
                        { n: 2, title: "Preserve evidence", body: "Save messages, photos, medical reports — avoid washing clothes in physical cases.", hi: "सबूत सुरक्षित रखें" },
                        { n: 3, title: "Talk to a counsellor", body: "A senior counsellor can guide you in your language and prepare paperwork.", hi: "काउंसलर से बात करें" },
                        { n: 4, title: "File the drafted complaint", body: "We'll prepare a bilingual complaint you can take to the police station or legal aid centre.", hi: "मसौदा शिकायत दर्ज कराएँ" },
                    ].map((x) => (
                        <li key={x.n} className="bg-white border border-sand rounded-2xl p-4 flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-olive text-white flex items-center justify-center font-serif font-bold">{x.n}</div>
                            <div className="flex-1">
                                <div className="font-serif font-bold text-olive">{x.title}</div>
                                <div className="hindi text-[11px] text-muted-foreground">{x.hi}</div>
                                <div className="text-sm text-foreground/85 mt-1">{x.body}</div>
                            </div>
                        </li>
                    ))}
                </ol>

                <button
                    data-testid="talk-counsellor-btn"
                    onClick={connectCounsellor}
                    className="press mt-5 w-full bg-brown hover:bg-brown/90 text-white rounded-full py-3.5 font-medium flex items-center justify-center gap-2"
                >
                    <UserCheck size={18} /> Talk to Senior Counsellor
                </button>

                <a
                    data-testid="tap-call-14566"
                    href="tel:14566"
                    className="press mt-3 w-full bg-terracotta text-white rounded-[20px] py-4 px-5 font-medium flex items-center justify-between shadow-md"
                >
                    <div>
                        <div className="font-serif font-bold text-lg">Tap to Call 14566</div>
                        <div className="hindi text-xs opacity-80">14566 पर कॉल करें</div>
                    </div>
                    <PhoneCall />
                </a>

                <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                        data-testid="go-complaint-btn"
                        onClick={() => nav(`/intake/complaint`)}
                        className="press bg-white border border-sand rounded-2xl p-4 text-left"
                    >
                        <FileText className="text-olive" size={18} />
                        <div className="font-serif font-bold text-olive mt-2">Complaint Draft</div>
                        <div className="hindi text-[11px] text-muted-foreground">शिकायत मसौदा</div>
                    </button>
                    <button
                        data-testid="go-timeline-btn"
                        onClick={() => nav(`/timeline/${s.case_id}`)}
                        className="press bg-white border border-sand rounded-2xl p-4 text-left"
                    >
                        <ClipboardList className="text-olive" size={18} />
                        <div className="font-serif font-bold text-olive mt-2">Case Timeline</div>
                        <div className="hindi text-[11px] text-muted-foreground">केस टाइमलाइन</div>
                    </button>
                </div>
            </div>
        </MobileFrame>
    );
}
