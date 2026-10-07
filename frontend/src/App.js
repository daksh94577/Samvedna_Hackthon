import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";
import { AppProvider, useApp } from "@/context/AppContext";
import { api } from "@/lib/api";

import LanguagePage from "@/pages/LanguagePage";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import CategoryPage from "@/pages/CategoryPage";
import ConsentPage from "@/pages/ConsentPage";
import IntakePage from "@/pages/IntakePage";
import VerifyPage from "@/pages/VerifyPage";
import AssessmentPage from "@/pages/AssessmentPage";
import NextStepsPage from "@/pages/NextStepsPage";
import ComplaintPage from "@/pages/ComplaintPage";
import TimelinePage from "@/pages/TimelinePage";
import HistoryPage from "@/pages/HistoryPage";
import SupportDirectoryPage from "@/pages/SupportDirectoryPage";
import DraftsPage from "@/pages/DraftsPage";
import ProfilePage from "@/pages/ProfilePage";
import CounsellorLoginPage from "@/pages/CounsellorLoginPage";
import CounsellorQueuePage from "@/pages/CounsellorQueuePage";
import CounsellorDetailPage from "@/pages/CounsellorDetailPage";
import OperatorPage from "@/pages/OperatorPage";
import SupervisorPage from "@/pages/SupervisorPage";
import ImpactPage from "@/pages/ImpactPage";
import NearbyMapPage from "@/pages/NearbyMapPage";
import ProtectedRoute from "@/components/ProtectedRoute";

function Boot() {
    useEffect(() => {
        // Fire-and-forget seed (idempotent)
        api.post("/seed").catch(() => {});
    }, []);
    return null;
}

function LandingRedirect() {
    const { user, lang } = useApp();
    if (user && user.role !== "victim") return <Navigate to="/counsellor" replace />;
    if (user) return <Navigate to="/home" replace />;
    if (lang) return <Navigate to="/login" replace />;
    return <LanguagePage />;
}

function App() {
    return (
        <AppProvider>
            <Boot />
            <Toaster position="top-center" theme="light" richColors closeButton />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingRedirect />} />
                    <Route path="/language" element={<LanguagePage />} />
                    <Route path="/login" element={<LoginPage />} />

                    <Route path="/home" element={<ProtectedRoute roles={["victim", "counsellor", "supervisor"]}><HomePage /></ProtectedRoute>} />
                    <Route path="/intake/category" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
                    <Route path="/intake/consent" element={<ProtectedRoute><ConsentPage /></ProtectedRoute>} />
                    <Route path="/intake/record" element={<ProtectedRoute><IntakePage /></ProtectedRoute>} />
                    <Route path="/intake/verify" element={<ProtectedRoute><VerifyPage /></ProtectedRoute>} />
                    <Route path="/intake/assessment" element={<ProtectedRoute><AssessmentPage /></ProtectedRoute>} />
                    <Route path="/intake/next-steps" element={<ProtectedRoute><NextStepsPage /></ProtectedRoute>} />
                    <Route path="/intake/complaint" element={<ProtectedRoute><ComplaintPage /></ProtectedRoute>} />
                    <Route path="/complaint/:caseId" element={<ProtectedRoute><ComplaintPage /></ProtectedRoute>} />
                    <Route path="/timeline/:caseId" element={<ProtectedRoute><TimelinePage /></ProtectedRoute>} />
                    <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                    <Route path="/drafts" element={<ProtectedRoute><DraftsPage /></ProtectedRoute>} />
                    <Route path="/support-directory" element={<ProtectedRoute><SupportDirectoryPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                    <Route path="/counsellor" element={<CounsellorGate />} />
                    <Route path="/counsellor/:caseId" element={<ProtectedRoute roles={["counsellor", "supervisor"]}><CounsellorDetailPage /></ProtectedRoute>} />
                    <Route path="/operator" element={<ProtectedRoute roles={["counsellor", "supervisor"]}><OperatorPage /></ProtectedRoute>} />
                    <Route path="/supervisor" element={<ProtectedRoute roles={["supervisor"]}><SupervisorPage /></ProtectedRoute>} />
                    <Route path="/impact" element={<ProtectedRoute roles={["supervisor"]}><ImpactPage /></ProtectedRoute>} />
                    <Route path="/nearby" element={<ProtectedRoute><NearbyMapPage /></ProtectedRoute>} />
                </Routes>
            </BrowserRouter>
        </AppProvider>
    );
}

function CounsellorGate() {
    const { user, loading } = useApp();
    if (loading) return <div className="samvedna-shell"><div className="frame flex items-center justify-center text-olive font-serif">Loading…</div></div>;
    if (user && (user.role === "counsellor" || user.role === "supervisor")) return <CounsellorQueuePage />;
    return <CounsellorLoginPage />;
}

export default App;
