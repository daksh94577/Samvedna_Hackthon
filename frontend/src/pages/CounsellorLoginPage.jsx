import { errMsg } from "@/lib/api";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import OTPInput from "@/components/OTPInput";
import { toast } from "sonner";
import { Shield } from "lucide-react";

export default function CounsellorLoginPage() {
    const { login, user } = useApp();
    const nav = useNavigate();
    const [email, setEmail] = useState("priya.counsellor@samvedna.in");
    const [session, setSession] = useState(null);
    const [otp, setOtp] = useState("");
    const [resendIn, setResendIn] = useState(0);
    const [busy, setBusy] = useState(false);
    const [dev, setDev] = useState("");

    useEffect(() => {
        if (user && (user.role === "counsellor" || user.role === "supervisor")) nav("/counsellor");
    }, [user, nav]);

    useEffect(() => {
        if (!resendIn) return;
        const id = setInterval(() => setResendIn((v) => Math.max(0, v - 1)), 1000);
        return () => clearInterval(id);
    }, [resendIn]);

    const sendOtp = async () => {
        setBusy(true);
        try {
            const r = await api.post("/counsellor/request-otp", { email });
            setSession(r.data.session_id);
            setResendIn(30);
            if (r.data.dev_mode) {
                setDev(r.data.dev_email_otp);
                toast.success(`DEV MODE · OTP ${r.data.dev_email_otp}`, { duration: 10000 });
            }
        } catch (e) {
            toast.error(errMsg(e, "Not registered"));
        } finally {
            setBusy(false);
        }
    };

    const verify = async () => {
        setBusy(true);
        try {
            const r = await api.post("/counsellor/verify", { session_id: session, code: otp });
            await login(r.data.token, r.data.user);
            nav("/counsellor");
        } catch (e) {
            toast.error(errMsg(e, "Invalid OTP"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="samvedna-shell">
            <div className="frame cream-texture flex flex-col px-5 py-10">
                <div className="flex items-center gap-2 text-olive">
                    <Shield size={18}/> <span className="font-serif font-bold">Counsellor Portal</span>
                </div>
                <h1 className="font-serif font-black text-3xl text-olive leading-tight mt-6">Secure Access</h1>
                <div className="hindi text-sm text-brown">काउंसलर प्रवेश</div>

                {!session ? (
                    <>
                        <label className="mt-6 text-[13px] font-semibold text-olive">Email</label>
                        <input
                            data-testid="counsellor-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 bg-white border border-sand rounded-xl px-4 py-3 outline-none focus:border-olive"
                        />
                        <button
                            data-testid="counsellor-send-otp"
                            disabled={busy}
                            onClick={sendOtp}
                            className="press mt-4 bg-gold hover:bg-gold-dark text-white rounded-full py-3 font-medium disabled:opacity-60"
                        >
                            {busy ? "Sending…" : "Send OTP"}
                        </button>
                        <div className="mt-6 text-[11px] text-muted-foreground">
                            Demo accounts (after seed): priya.counsellor@samvedna.in · verma.supervisor@samvedna.in
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mt-6 text-sm text-muted-foreground">Enter the 4-digit code sent to {email}</div>
                        <div className="mt-3"><OTPInput value={otp} onChange={setOtp} testIdPrefix="counsellor-otp" /></div>
                        {dev && (
                            <div className="text-[11px] text-brown mt-2 bg-cream border border-sand rounded-xl p-2 text-center">
                                DEV OTP: <span data-testid="counsellor-dev-otp" className="font-bold">{dev}</span>
                            </div>
                        )}
                        <button
                            data-testid="counsellor-verify"
                            disabled={busy}
                            onClick={verify}
                            className="press mt-4 bg-gold hover:bg-gold-dark text-white rounded-full py-3 font-medium disabled:opacity-60"
                        >
                            Verify & Enter
                        </button>
                        <button
                            disabled={resendIn > 0}
                            onClick={sendOtp}
                            className="mt-3 text-sm text-brown disabled:opacity-50"
                        >
                            {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
