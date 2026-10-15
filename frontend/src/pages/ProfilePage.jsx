import React from "react";
import MobileFrame from "@/components/MobileFrame";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Shield, Globe2, User } from "lucide-react";
import { LANGUAGES } from "@/lib/i18n";

export default function ProfilePage() {
    const { user, logout, lang, setLang } = useApp();
    const nav = useNavigate();
    return (
        <MobileFrame>
            <div className="px-5 pt-5 pb-24">
                <h2 className="font-serif font-black text-2xl text-olive">Profile</h2>
                <div className="hindi text-sm text-brown">प्रोफाइल</div>

                <div className="mt-4 bg-white border border-sand rounded-2xl p-5 flex items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-olive text-white flex items-center justify-center">
                        <User size={24} />
                    </div>
                    <div className="min-w-0">
                        <div className="font-serif font-bold text-olive truncate">{user?.name || "Anonymous User"}</div>
                        <div className="text-[12px] text-muted-foreground truncate">{user?.email}</div>
                        <div className="text-[12px] text-muted-foreground truncate">{user?.masked_phone}</div>
                    </div>
                </div>

                <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-olive"><Globe2 size={16}/> <span className="font-serif font-bold">Language</span></div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        {LANGUAGES.map((l) => (
                            <button
                                key={l.code}
                                onClick={() => setLang(l.code)}
                                data-testid={`profile-lang-${l.code}`}
                                className={`press text-left px-3 py-2 rounded-xl text-sm border ${
                                    lang === l.code ? "bg-olive text-white border-olive" : "bg-cream border-sand text-brown"
                                }`}
                            >
                                {l.native}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-olive"><Shield size={16}/> <span className="font-serif font-bold">Privacy</span></div>
                    <div className="text-[12px] text-muted-foreground mt-2">AES-256 at rest · minimal data · consent-first voice · audit log of every view/action.</div>
                </div>

                <button
                    data-testid="logout-btn"
                    onClick={() => { logout(); nav("/"); }}
                    className="press mt-4 w-full border border-sand bg-white text-brown rounded-full py-3 font-medium flex items-center justify-center gap-2"
                >
                    <LogOut size={16}/> Logout
                </button>

                <button
                    data-testid="go-counsellor-btn"
                    onClick={() => nav("/counsellor")}
                    className="press mt-3 w-full bg-olive text-white rounded-full py-3 font-medium"
                >
                    Counsellor Portal
                </button>
            </div>
        </MobileFrame>
    );
}
