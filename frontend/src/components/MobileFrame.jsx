import React from "react";
import BottomNav from "./BottomNav";
import Header from "./Header";

export default function MobileFrame({ children, showBack = false, title = null, hideNav = false, headerRight = null }) {
    return (
        <div className="samvedna-shell">
            <div className="frame cream-texture flex flex-col">
                <Header showBack={showBack} title={title} right={headerRight} />
                <main className="flex-1 overflow-y-auto">{children}</main>
                {!hideNav && <BottomNav />}
            </div>
        </div>
    );
}
