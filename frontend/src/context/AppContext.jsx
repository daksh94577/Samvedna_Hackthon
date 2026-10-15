import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setToken, clearToken, getToken } from "@/lib/api";
import { t } from "@/lib/i18n";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
    const [lang, setLang] = useState(localStorage.getItem("samvedna_lang") || "");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const translate = useCallback((key) => t(lang || "en", key), [lang]);

    const changeLang = (code) => {
        setLang(code);
        localStorage.setItem("samvedna_lang", code);
    };

    const loadMe = useCallback(async () => {
        if (!getToken()) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const r = await api.get("/me");
            setUser(r.data);
        } catch {
            clearToken();
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMe();
    }, [loadMe]);

    const login = async (token, u) => {
        setToken(token);
        setUser(u);
    };

    const logout = () => {
        clearToken();
        setUser(null);
    };

    return (
        <AppContext.Provider value={{ lang, setLang: changeLang, user, setUser, loading, t: translate, login, logout, refreshMe: loadMe }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useApp outside provider");
    return ctx;
};
