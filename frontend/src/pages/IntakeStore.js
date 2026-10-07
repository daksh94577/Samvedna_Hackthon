// Simple global store for the multi-step intake flow using React state hook pattern
import { useSyncExternalStore } from "react";

const initial = {
    category: null,
    narrative: "",
    voice_metrics: null,
    audio_b64: null,
    language: "en",
    voice_consent: false,
    timeline: "",
    location: "",
    proof_files: [],
    threat_present: false,
    isolation: false,
    assessment: null,
    case_id: null,
};

let state = { ...initial };
const listeners = new Set();

function emit() {
    listeners.forEach((l) => l());
}

export const intakeStore = {
    get: () => state,
    set: (patch) => { state = { ...state, ...patch }; emit(); },
    setField: (k, v) => { state = { ...state, [k]: v }; emit(); },
    reset: () => { state = { ...initial }; emit(); },
    subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); },
};

export function useIntakeStore(selector = (s) => s) {
    return useSyncExternalStore(
        intakeStore.subscribe,
        () => selector(state),
        () => selector(initial),
    );
}
