import { errMsg } from "@/lib/api";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import OTPInput from "@/components/OTPInput";
import { Volume2, MessageSquare, ShieldCheck, Mail, Smartphone } from "lucide-react";

export default function LoginPage() {
    const { lang, login, t } = useApp();
    const nav = useNavigate();
    const [step, setStep] = useState("details"); // details | mobile_otp | email_otp
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [channel, setChannel] = useState("sms");
    const [session, setSession] = useState(null);
    const [mobileOtp, setMobileOtp] = useState("");
    const [emailOtp, setEmailOtp] = useState("");
    const [resendIn, setResendIn] = useState(0);
    const [busy, setBusy] = useState(false);
    const [devInfo, setDevInfo] = useState(null);

    useEffect(() => {
        if (!resendIn) return;
        const id = setInterval(() => setResendIn((v) => Math.max(0, v - 1)), 1000);
        return () => clearInterval(id);
    }, [resendIn]);

    const speak = (txt) => {
        try {
            const u = new SpeechSynthesisUtterance(txt);
            u.lang = lang === "hi" ? "hi-IN" : "en-IN";
            window.speechSynthesis.speak(u);
        } catch {}
    };

    const sendOTP = async () => {
        if (!phone.match(/^\+?\d{10,15}$/)) return toast.error("Enter a valid phone with country code, e.g. +9199xxxxxxxx");
        if (!email.includes("@")) return toast.error("Enter a valid email");
        setBusy(true);
        try {
            const r = await api.post("/auth/request-otp", { phone, email, channel, language: lang || "en" });
            setSession(r.data.session_id);
            setStep("mobile_otp");
            setResendIn(30);
            if (r.data.dev_mode) {
                setDevInfo({ m: r.data.dev_mobile_otp, e: r.data.dev_email_otp });
                toast.success(`DEV MODE: Mobile OTP ${r.data.dev_mobile_otp} · Email OTP ${r.data.dev_email_otp}`, { duration: 10000 });
            } else {
                toast.success("OTPs sent to your mobile and email");
            }
        } catch (e) {
            toast.error(errMsg(e, "Failed to send OTP"));
        } finally {
            setBusy(false);
        }
    };

    const resend = async () => {
        setResendIn(30);
        await sendOTP();
    };

    const verifyMobile = async () => {
        if (mobileOtp.length !== 4) return toast.error("Enter 4-digit OTP");
        setBusy(true);
        try {
            await api.post("/auth/verify-mobile", { session_id: session, code: mobileOtp });
            setStep("email_otp");
            setResendIn(30);
            toast.success("Mobile verified · now verify email");
        } catch (e) {
            toast.error(errMsg(e, "Invalid OTP"));
        } finally {
            setBusy(false);
        }
    };

    const verifyEmail = async () => {
        if (emailOtp.length !== 4) return toast.error("Enter 4-digit OTP");
        setBusy(true);
        try {
            const r = await api.post("/auth/verify-email", { session_id: session, code: emailOtp });
            await login(r.data.token, r.data.user);
            toast.success("Welcome to Samvedna");
            nav("/home");
        } catch (e) {
            toast.error(errMsg(e, "Invalid OTP"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="samvedna-shell">
            <div className="frame cream-texture flex flex-col">
                <div className="px-5 pt-10 pb-6">
                    <h1 className="font-serif font-black text-3xl text-olive leading-tight">
                        Secure Login
                    </h1>
                    <div className="hindi text-brown font-serif text-lg -mt-1">सुरक्षित लॉगिन</div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium">
                        Two-step verification · Mobile + Email
                    </div>
                </div>

                <div className="px-5 flex-1">
                    {step === "details" && (
                        <div className="animate-fade-up space-y-4">
                            <div>
                                <label className="text-[13px] font-semibold text-olive flex items-center gap-2">
                                    <Smartphone size={14} /> Mobile Number
                                </label>
                                <input
                                    data-testid="input-phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+9199xxxxxxxx"
                                    className="mt-1 w-full bg-white border border-sand rounded-xl px-4 py-3 font-medium outline-none focus:border-olive"
                                />
                            </div>
                            <div>
                                <label className="text-[13px] font-semibold text-olive flex items-center gap-2">
                                    <Mail size={14} /> Email Address
                                </label>
                                <input
                                    data-testid="input-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="mt-1 w-full bg-white border border-sand rounded-xl px-4 py-3 font-medium outline-none focus:border-olive"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    data-testid="channel-sms"
                                    onClick={() => setChannel("sms")}
                                    className={`press border rounded-xl py-3 px-4 text-sm font-medium ${
                                        channel === "sms" ? "bg-olive text-white border-olive" : "bg-white border-sand text-brown"
                                    }`}
                                >
                                    SMS OTP
                                </button>
                                <button
                                    data-testid="channel-whatsapp"
                                    onClick={() => setChannel("whatsapp")}
                                    className={`press border rounded-xl py-3 px-4 text-sm font-medium flex items-center justify-center gap-1 ${
                                        channel === "whatsapp" ? "bg-wa text-white border-wa" : "bg-white border-sand text-brown"
                                    }`}
                                >
                                    <MessageSquare size={14} /> WhatsApp
                                </button>
                            </div>

                            <button
                                data-testid="send-otp-btn"
                                disabled={busy}
                                onClick={sendOTP}
                                className="press w-full bg-gold hover:bg-gold-dark disabled:opacity-60 text-white rounded-full py-3.5 font-medium"
                            >
                                {busy ? "Sending…" : "Send OTP / OTP भेजें"}
                            </button>
                        </div>
                    )}

                    {step === "mobile_otp" && (
                        <div className="animate-fade-up space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-serif font-bold text-lg text-olive">Verify Mobile</div>
                                    <div className="hindi text-xs text-muted-foreground">मोबाइल सत्यापित करें</div>
                                </div>
                                <button
                                    data-testid="audio-help-mobile"
                                    onClick={() => speak(t("enter_mobile_otp"))}
                                    className="press h-10 w-10 rounded-full bg-olive text-white flex items-center justify-center"
                                >
                                    <Volume2 size={16} />
                                </button>
                            </div>
                            <div className="text-sm text-muted-foreground">{t("enter_mobile_otp")}</div>
                            <OTPInput value={mobileOtp} onChange={setMobileOtp} testIdPrefix="otp-mobile" />
                            {devInfo && (
                                <div className="text-[11px] text-brown bg-cream border border-sand rounded-xl p-2 text-center">
                                    DEV · Mobile OTP: <span data-testid="dev-mobile-otp" className="font-bold">{devInfo.m}</span>
                                </div>
                            )}
                            <button
                                data-testid="verify-mobile-btn"
                                disabled={busy}
                                onClick={verifyMobile}
                                className="press w-full bg-gold hover:bg-gold-dark disabled:opacity-60 text-white rounded-full py-3.5 font-medium"
                            >
                                Verify / सत्यापित करें
                            </button>
                            <button
                                data-testid="resend-mobile"
                                disabled={resendIn > 0}
                                onClick={resend}
                                className="w-full text-sm text-brown disabled:opacity-50"
                            >
                                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
                            </button>
                        </div>
                    )}

                    {step === "email_otp" && (
                        <div className="animate-fade-up space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-serif font-bold text-lg text-olive">Verify Email</div>
                                    <div className="hindi text-xs text-muted-foreground">ईमेल सत्यापित करें</div>
                                </div>
                                <button
                                    onClick={() => speak(t("enter_email_otp"))}
                                    className="press h-10 w-10 rounded-full bg-olive text-white flex items-center justify-center"
                                >
                                    <Volume2 size={16} />
                                </button>
                            </div>
                            <div className="text-sm text-muted-foreground">{t("enter_email_otp")}</div>
                            <OTPInput value={emailOtp} onChange={setEmailOtp} testIdPrefix="otp-email" />
                            {devInfo && (
                                <div className="text-[11px] text-brown bg-cream border border-sand rounded-xl p-2 text-center">
                                    DEV · Email OTP: <span data-testid="dev-email-otp" className="font-bold">{devInfo.e}</span>
                                </div>
                            )}
                            <button
                                data-testid="verify-email-btn"
                                disabled={busy}
                                onClick={verifyEmail}
                                className="press w-full bg-gold hover:bg-gold-dark disabled:opacity-60 text-white rounded-full py-3.5 font-medium"
                            >
                                Verify & Enter / प्रवेश
                            </button>
                        </div>
                    )}
                </div>

                <div className="px-5 py-5">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <ShieldCheck size={14} className="text-olive" />
                        <span>Hashed OTP · 5-min expiry · 3 attempts max · Rate-limited</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
