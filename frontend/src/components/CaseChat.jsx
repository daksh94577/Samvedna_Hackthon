import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { Send, Lock } from "lucide-react";

export default function CaseChat({ caseId }) {
    const { user } = useApp();
    const [msgs, setMsgs] = useState([]);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const scroller = useRef(null);

    const load = async () => {
        try {
            const r = await api.get(`/cases/${caseId}/chat`);
            setMsgs(r.data);
        } catch {}
    };

    useEffect(() => {
        load();
        const id = setInterval(load, 4000);
        return () => clearInterval(id);
        // eslint-disable-next-line
    }, [caseId]);

    useEffect(() => {
        if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
    }, [msgs]);

    const send = async () => {
        if (!text.trim()) return;
        setSending(true);
        try {
            const r = await api.post(`/cases/${caseId}/chat`, { text });
            setMsgs((xs) => [...xs, r.data]);
            setText("");
        } finally {
            setSending(false);
        }
    };

    const onKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <div className="bg-white border border-sand rounded-2xl p-4" data-testid="case-chat">
            <div className="flex items-center justify-between">
                <div>
                    <div className="font-serif font-bold text-olive">Case Chat</div>
                    <div className="hindi text-[11px] text-muted-foreground">सुरक्षित बातचीत</div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-wa">
                    <Lock size={11}/> AES-256 encrypted
                </div>
            </div>

            <div ref={scroller} className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1" data-testid="chat-scroller">
                {msgs.length === 0 && (
                    <div className="text-[12px] text-muted-foreground text-center py-6">
                        No messages yet. Start the conversation — your counsellor will see it instantly.
                    </div>
                )}
                {msgs.map((m) => {
                    const mine = m.author_id === user?.id;
                    return (
                        <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                            <div
                                data-testid={`chat-msg-${m.id}`}
                                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                                    mine ? "bg-olive text-white" : "bg-cream border border-sand text-foreground"
                                }`}
                            >
                                <div className={`text-[10px] mb-0.5 ${mine ? "text-cream/70" : "text-muted-foreground"}`}>
                                    {mine ? "You" : (m.author_role === "counsellor" || m.author_role === "supervisor" ? "Counsellor" : "Victim")}
                                    {" · "}{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                                <div className="whitespace-pre-wrap">{m.text}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-3 flex items-end gap-2">
                <textarea
                    data-testid="chat-input"
                    rows={1}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="Type a secure message…"
                    className="flex-1 bg-cream border border-sand rounded-xl px-3 py-2 text-sm outline-none focus:border-olive resize-none"
                />
                <button
                    data-testid="chat-send"
                    disabled={sending || !text.trim()}
                    onClick={send}
                    className="press bg-gold hover:bg-gold-dark text-white rounded-full h-10 w-10 flex items-center justify-center disabled:opacity-50"
                >
                    <Send size={16}/>
                </button>
            </div>
        </div>
    );
}
