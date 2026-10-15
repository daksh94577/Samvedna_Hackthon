import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Compass, MessagesSquare, PhoneCall, UserCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function BottomNav() {
    const { t } = useApp();
    const nav = useNavigate();
    const { pathname } = useLocation();

    const items = [
        { key: "guidance", path: "/home", label: t("nav_guidance"), Icon: Compass, testid: "nav-guidance" },
        { key: "thread", path: "/history", label: t("nav_thread"), Icon: MessagesSquare, testid: "nav-thread" },
        { key: "helpline", path: "/support-directory", label: t("nav_helpline"), Icon: PhoneCall, testid: "nav-helpline" },
        { key: "profile", path: "/profile", label: t("nav_profile"), Icon: UserCircle2, testid: "nav-profile" },
    ];

    return (
        <nav className="sticky bottom-0 inset-x-0 z-40 bg-white border-t border-sand">
            <div className="grid grid-cols-4 px-2 py-2 gap-1">
                {items.map(({ key, path, label, Icon, testid }) => {
                    const active = pathname === path || (key === "guidance" && pathname === "/");
                    return (
                        <button
                            key={key}
                            data-testid={testid}
                            onClick={() => nav(path)}
                            className={`press flex flex-col items-center justify-center gap-1 py-2 rounded-full text-[11px] font-medium transition-colors ${
                                active ? "bg-gold text-white" : "text-brown hover:bg-cream"
                            }`}
                        >
                            <Icon size={18} />
                            {label}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
