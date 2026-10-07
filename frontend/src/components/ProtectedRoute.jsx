import React from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

export default function ProtectedRoute({ children, roles }) {
    const { user, loading } = useApp();
    if (loading) return <div className="samvedna-shell"><div className="frame flex items-center justify-center text-olive font-serif">Loading…</div></div>;
    if (!user) return <Navigate to="/" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/home" replace />;
    return children;
}
