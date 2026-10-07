import React, { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

/**
 * Records audio using MediaRecorder, extracts voice metrics (pitch variation,
 * pause ratio, speech rate, RMS energy, pitch jitter) using Web Audio API,
 * and uses Web Speech API for live STT.
 */
export default function VoiceRecorder({ language = "en", onResult }) {
    const [recording, setRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState("");
    const [bars, setBars] = useState(Array(28).fill(0.15));
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const streamRef = useRef(null);
    const rafRef = useRef(null);
    const recognitionRef = useRef(null);
    const metricsRef = useRef({ rmsSamples: [], pitchSamples: [], silentFrames: 0, totalFrames: 0, wordCount: 0, startedAt: 0 });

    const langMap = { en: "en-IN", hi: "hi-IN", hinglish: "en-IN", bn: "bn-IN", mr: "mr-IN", gu: "gu-IN", pa: "pa-IN", ta: "ta-IN", te: "te-IN", kn: "kn-IN" };

    const start = async () => {
        setError("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const AC = window.AudioContext || window.webkitAudioContext;
            const ctx = new AC();
            audioCtxRef.current = ctx;
            const src = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 2048;
            src.connect(analyser);
            analyserRef.current = analyser;

            const mr = new MediaRecorder(stream);
            mediaRecorderRef.current = mr;
            chunksRef.current = [];
            mr.ondataavailable = (e) => chunksRef.current.push(e.data);
            mr.start();

            metricsRef.current = { rmsSamples: [], pitchSamples: [], silentFrames: 0, totalFrames: 0, wordCount: 0, startedAt: Date.now() };
            tick();
            setRecording(true);

            // Live STT
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SR) {
                const r = new SR();
                r.lang = langMap[language] || "en-IN";
                r.continuous = true;
                r.interimResults = true;
                r.onresult = (e) => {
                    let full = "";
                    for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript + " ";
                    const trimmed = full.trim();
                    setTranscript(trimmed);
                    metricsRef.current.wordCount = trimmed.split(/\s+/).filter(Boolean).length;
                };
                r.onerror = () => {};
                try { r.start(); } catch {}
                recognitionRef.current = r;
            }
        } catch (e) {
            setError(e.message || "Microphone access denied");
        }
    };

    const tick = () => {
        const an = analyserRef.current;
        if (!an) return;
        const buf = new Uint8Array(an.fftSize);
        const freqBuf = new Uint8Array(an.frequencyBinCount);
        const read = () => {
            an.getByteTimeDomainData(buf);
            an.getByteFrequencyData(freqBuf);
            // RMS
            let sum = 0;
            for (let i = 0; i < buf.length; i++) {
                const v = (buf[i] - 128) / 128;
                sum += v * v;
            }
            const rms = Math.sqrt(sum / buf.length);
            metricsRef.current.rmsSamples.push(rms);
            metricsRef.current.totalFrames++;
            if (rms < 0.015) metricsRef.current.silentFrames++;

            // Pseudo pitch: peak frequency bin index weighted
            let maxIdx = 0, maxVal = 0;
            for (let i = 2; i < 128; i++) {
                if (freqBuf[i] > maxVal) { maxVal = freqBuf[i]; maxIdx = i; }
            }
            if (maxVal > 60) metricsRef.current.pitchSamples.push(maxIdx);

            // Waveform bars
            const nextBars = [];
            const step = Math.floor(buf.length / 28);
            for (let i = 0; i < 28; i++) {
                let s = 0;
                for (let j = 0; j < step; j++) s += Math.abs(buf[i * step + j] - 128);
                nextBars.push(Math.min(1, (s / step) / 40));
            }
            setBars(nextBars);
            rafRef.current = requestAnimationFrame(read);
        };
        read();
    };

    const stop = async () => {
        try {
            cancelAnimationFrame(rafRef.current);
            recognitionRef.current?.stop();
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
                await new Promise((res) => (mediaRecorderRef.current.onstop = res));
            }
            streamRef.current?.getTracks().forEach((tr) => tr.stop());
            audioCtxRef.current?.close();

            // Compute metrics 0..1
            const m = metricsRef.current;
            const rms = m.rmsSamples;
            const avgRms = rms.length ? rms.reduce((a, b) => a + b, 0) / rms.length : 0;
            const maxRms = rms.length ? Math.max(...rms) : 0;
            const rmsNorm = Math.min(1, maxRms * 2.2);

            const pauseRatio = m.totalFrames ? m.silentFrames / m.totalFrames : 0;

            const pitches = m.pitchSamples;
            const pavg = pitches.length ? pitches.reduce((a, b) => a + b, 0) / pitches.length : 0;
            const pvar = pitches.length ? Math.sqrt(pitches.reduce((a, b) => a + (b - pavg) ** 2, 0) / pitches.length) : 0;
            const pitchVariation = Math.min(1, pvar / 30);
            let jitSum = 0;
            for (let i = 1; i < pitches.length; i++) jitSum += Math.abs(pitches[i] - pitches[i - 1]);
            const jitter = pitches.length > 1 ? jitSum / (pitches.length - 1) : 0;
            const pitchJitter = Math.min(1, jitter / 10);

            const durSec = Math.max(1, (Date.now() - m.startedAt) / 1000);
            const wps = m.wordCount / durSec;
            // Elevated/jittery when very fast (>2.5 wps) OR unusually slow (<0.6 wps)
            const speechRate = Math.min(1, Math.max(0, (wps > 2.5 ? (wps - 2.5) / 2.5 : (0.6 - wps) / 0.6)));

            const metrics = {
                pitch_variation: Number(pitchVariation.toFixed(3)),
                pause_ratio: Number(pauseRatio.toFixed(3)),
                speech_rate: Number(speechRate.toFixed(3)),
                rms_energy: Number(rmsNorm.toFixed(3)),
                pitch_jitter: Number(pitchJitter.toFixed(3)),
            };

            // Audio base64
            const blob = new Blob(chunksRef.current, { type: "audio/webm" });
            const b64 = await blobToB64(blob);

            onResult?.({ transcript, metrics, audio_b64: b64, duration_s: durSec });
            setRecording(false);
        } catch (e) {
            setError(e.message || "Error stopping recording");
            setRecording(false);
        }
    };

    const blobToB64 = (blob) =>
        new Promise((res) => {
            const r = new FileReader();
            r.onloadend = () => res(String(r.result).split(",")[1] || "");
            r.readAsDataURL(blob);
        });

    useEffect(() => () => {
        cancelAnimationFrame(rafRef.current);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        try { audioCtxRef.current?.close(); } catch {}
        try { recognitionRef.current?.stop(); } catch {}
    }, []);

    return (
        <div className="bg-white border border-sand rounded-[20px] p-5 shadow-sm">
            <div className="flex items-end justify-center gap-[3px] h-20">
                {bars.map((v, i) => (
                    <div
                        key={i}
                        className="wave-bar bg-olive rounded-full"
                        style={{
                            width: 4,
                            height: `${Math.max(6, v * 72)}px`,
                            opacity: recording ? 0.9 : 0.35,
                            transition: "height 90ms linear",
                        }}
                    />
                ))}
            </div>
            {transcript && (
                <div className="mt-3 bg-cream border border-sand rounded-xl p-3 text-sm text-foreground max-h-28 overflow-auto" data-testid="voice-transcript">
                    {transcript}
                </div>
            )}
            <div className="flex items-center justify-between mt-4">
                <div className="text-[11px] text-muted-foreground">
                    {recording ? "Recording… · सुन रहे हैं" : "Live waveform"}
                </div>
                {!recording ? (
                    <button
                        data-testid="voice-start"
                        onClick={start}
                        className="press flex items-center gap-2 bg-gold hover:bg-gold-dark text-white rounded-full py-3 px-5 font-medium transition-colors"
                    >
                        <Mic size={18} /> Tap to Record
                    </button>
                ) : (
                    <button
                        data-testid="voice-stop"
                        onClick={stop}
                        className="press flex items-center gap-2 bg-deepred text-white rounded-full py-3 px-5 font-medium"
                    >
                        <Square size={16} /> Stop
                    </button>
                )}
            </div>
            {error && <div className="text-xs text-deepred mt-2">{error}</div>}
        </div>
    );
}
