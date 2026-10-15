// Web push helpers for Samvedna counsellor portal.
import { api } from "./api";

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
}

export async function enablePush() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Push not supported in this browser");
    }
    const reg = await navigator.serviceWorker.ready;
    const permission = await Notification.requestPermission();
    if (permission !== "granted") throw new Error("Notification permission denied");

    let publicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
    if (!publicKey) {
        const r = await api.get("/push/public-key");
        publicKey = r.data.public_key;
    }

    const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    await api.post("/push/subscribe", { subscription: sub.toJSON ? sub.toJSON() : sub });
    return sub;
}

export async function testPush() {
    const r = await api.post("/push/test");
    return r.data;
}

export async function isPushEnabled() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
}
