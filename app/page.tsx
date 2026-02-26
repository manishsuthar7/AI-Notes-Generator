"use client";

import { useState, useRef } from "react";
import { Sparkles, Loader2, RotateCcw, BookOpen } from "lucide-react";
import SettingsPanel from "@/components/SettingsPanel";
import NotesOutput from "@/components/NotesOutput";
import FileUpload from "@/components/FileUpload";

const EXAMPLE_TEXT = `Today we're going to cover the fundamentals of machine learning. Machine learning is a subset of artificial intelligence that gives systems the ability to automatically learn and improve from experience without being explicitly programmed.

There are three main types of machine learning:
First, supervised learning, where we train models using labeled data. The algorithm learns to map inputs to correct outputs. Examples include email spam detection and image classification.
Second, unsupervised learning, where we find patterns in unlabeled data. Clustering algorithms like k-means group similar data points together. Principal Component Analysis reduces dimensionality.
Third, reinforcement learning, where an agent learns by interacting with an environment, receiving rewards or penalties. This is how AlphaGo learned to play chess.

The bias-variance tradeoff is a core concept. Bias is the error from oversimplified assumptions — high bias causes underfitting. Variance is sensitivity to fluctuations in training data — high variance causes overfitting. We want a sweet spot in the middle.

Gradient descent is the optimization algorithm that minimizes the loss function by iteratively updating model weights in the negative gradient direction. The learning rate controls the step size — too large and we overshoot, too small and training is slow.`;

export default function Home() {
    const [lectureText, setLectureText] = useState("");
    const [notes, setNotes] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [format, setFormat] = useState("bullet");
    const [tone, setTone] = useState("formal");
    const [detailLevel, setDetailLevel] = useState("detailed");
    const abortRef = useRef<AbortController | null>(null);

    const charCount = lectureText.length;
    const wordCount = lectureText.trim() ? lectureText.trim().split(/\s+/).length : 0;

    const handleGenerate = async () => {
        if (!lectureText.trim() || lectureText.trim().length < 10) {
            setError("Please enter at least 10 characters of lecture text.");
            return;
        }

        setError(null);
        setNotes("");
        setIsLoading(true);
        setIsStreaming(false);

        abortRef.current = new AbortController();

        try {
            const res = await fetch("/api/generate-notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lectureText, format, tone, detailLevel }),
                signal: abortRef.current.signal,
            });

            if (!res.ok) {
                // Safely parse error: server might return HTML (e.g. crash page) not JSON
                const contentType = res.headers.get("content-type") ?? "";
                if (contentType.includes("application/json")) {
                    const data = await res.json();
                    throw new Error(data.error || "Something went wrong.");
                } else {
                    // HTML error page — surface a friendlier message
                    const status = res.status;
                    if (status === 500) {
                        throw new Error(
                            "Server error — make sure OPENAI_API_KEY is set in your .env.local file, then restart the dev server."
                        );
                    }
                    throw new Error(`Request failed (HTTP ${status}). Check the server logs for details.`);
                }
            }

            if (!res.body) throw new Error("No response body.");

            setIsLoading(false);
            setIsStreaming(true);

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                accumulated += decoder.decode(value, { stream: true });
                setNotes(accumulated);
            }
        } catch (err: unknown) {
            if ((err as Error).name === "AbortError") return;
            setError(err instanceof Error ? err.message : "An error occurred.");
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
        }
    };

    const handleStop = () => {
        abortRef.current?.abort();
        setIsStreaming(false);
        setIsLoading(false);
    };

    const handleReset = () => {
        handleStop();
        setLectureText("");
        setNotes("");
        setError(null);
    };

    const handleLoadExample = () => {
        setLectureText(EXAMPLE_TEXT);
        setError(null);
    };

    const isWorking = isLoading || isStreaming;

    return (
        <main
            style={{
                minHeight: "100vh",
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Background orbs */}
            <div className="orb orb-1" />
            <div className="orb orb-2" />

            {/* Header */}
            <header
                style={{
                    position: "relative",
                    zIndex: 2,
                    padding: "24px 40px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 16,
                }}
            >
                <div className="flex items-center gap-3">
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
                        }}
                    >
                        <Sparkles size={20} color="white" />
                    </div>
                    <div>
                        <h1
                            className="gradient-text"
                            style={{ fontSize: "1.3rem", fontWeight: 800, lineHeight: 1.1 }}
                        >
                            AI Notes Generator
                        </h1>
                        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", letterSpacing: "0.04em" }}>
                            Lecture → Structured Notes · Powered by GPT-4o mini
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span
                        style={{
                            fontSize: "0.72rem",
                            color: "var(--text-muted)",
                            background: "rgba(124,58,237,0.06)",
                            border: "1px solid var(--border)",
                            padding: "4px 12px",
                            borderRadius: 9999,
                        }}
                    >
                        ✦ GPT-4o mini
                    </span>
                </div>
            </header>

            {/* Hero tagline */}
            <div
                style={{
                    position: "relative",
                    zIndex: 2,
                    textAlign: "center",
                    padding: "32px 20px 20px",
                }}
            >
                <h2
                    style={{
                        fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                        fontWeight: 800,
                        lineHeight: 1.15,
                        letterSpacing: "-0.02em",
                        marginBottom: 10,
                    }}
                >
                    Turn Any Lecture Into{" "}
                    <span className="gradient-text">Clean, Smart Notes</span>
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: 500, margin: "0 auto" }}>
                    Paste your lecture text below and watch AI structure it into perfectly
                    organised notes — instantly.
                </p>
            </div>

            {/* Main 2-panel layout */}
            <div
                style={{
                    position: "relative",
                    zIndex: 2,
                    flex: 1,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 20,
                    padding: "0 32px 40px",
                    maxWidth: 1400,
                    margin: "0 auto",
                    width: "100%",
                }}
                className="main-grid"
            >
                {/* ── Left Panel: Input ── */}
                <div className="glass-card rounded-2xl flex flex-col" style={{ minHeight: 540 }}>
                    {/* Panel header */}
                    <div
                        className="flex items-center justify-between px-5 py-4"
                        style={{ borderBottom: "1px solid var(--border)" }}
                    >
                        <div className="flex items-center gap-2">
                            <BookOpen size={15} style={{ color: "var(--accent-violet)" }} />
                            <span
                                style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}
                            >
                                Lecture Text
                            </span>
                        </div>
                        <button
                            id="btn-example"
                            onClick={handleLoadExample}
                            disabled={isWorking}
                            style={{
                                fontSize: "0.75rem",
                                color: "var(--accent-violet)",
                                background: "rgba(124,58,237,0.08)",
                                border: "1px solid rgba(124,58,237,0.2)",
                                padding: "4px 12px",
                                borderRadius: 9999,
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                        >
                            Try Example
                        </button>
                    </div>

                    {/* File upload */}
                    <div className="px-4 pt-3 pb-2">
                        <FileUpload
                            onTextExtracted={(text) => {
                                setLectureText(text);
                                setError(null);
                            }}
                            disabled={isWorking}
                        />
                    </div>

                    {/* Divider with label */}
                    <div
                        className="flex items-center gap-2 px-4 pb-1"
                        style={{ fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "0.08em" }}
                    >
                        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                        OR PASTE TEXT BELOW
                        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                    </div>

                    {/* Textarea */}
                    <div className="flex-1 flex flex-col px-4 pt-3 pb-3" style={{ minHeight: 0 }}>
                        <textarea
                            id="lecture-input"
                            className="lecture-textarea flex-1 rounded-xl p-4 text-sm w-full"
                            placeholder="Paste your lecture notes, transcript, or any educational text here…

For example: class notes, lecture recordings transcripts, textbook passages, or any study material you'd like converted into clean structured notes."
                            value={lectureText}
                            onChange={(e) => {
                                setLectureText(e.target.value);
                                if (error) setError(null);
                            }}
                            disabled={isWorking}
                            style={{ minHeight: 280 }}
                        />

                        {/* Stats */}
                        <div
                            className="flex items-center justify-between mt-2 px-1"
                            style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}
                        >
                            <span>{wordCount} words</span>
                            <span
                                style={{ color: charCount > 8000 ? "#ef4444" : "var(--text-muted)" }}
                            >
                                {charCount.toLocaleString()} / 10,000 chars
                            </span>
                        </div>

                        {/* Error */}
                        {error && (
                            <div
                                className="fade-in mt-2 px-3 py-2 rounded-lg"
                                style={{
                                    background: "rgba(239,68,68,0.08)",
                                    border: "1px solid rgba(239,68,68,0.25)",
                                    color: "#fca5a5",
                                    fontSize: "0.82rem",
                                }}
                            >
                                ⚠ {error}
                            </div>
                        )}
                    </div>

                    {/* Settings */}
                    <div
                        className="px-5 py-4"
                        style={{ borderTop: "1px solid var(--border)" }}
                    >
                        <SettingsPanel
                            format={format}
                            tone={tone}
                            detailLevel={detailLevel}
                            onFormatChange={setFormat}
                            onToneChange={setTone}
                            onDetailChange={setDetailLevel}
                            disabled={isWorking}
                        />
                    </div>

                    {/* Action buttons */}
                    <div
                        className="px-5 pb-5 flex gap-3"
                    >
                        {isWorking ? (
                            <>
                                <button
                                    id="btn-stop"
                                    onClick={handleStop}
                                    className="flex-1 rounded-xl py-3 flex items-center justify-center gap-2 btn-primary"
                                    style={{ fontSize: "0.9rem" }}
                                >
                                    <Loader2 size={16} className="spin" />
                                    Generating…
                                </button>
                                <button
                                    id="btn-cancel"
                                    onClick={handleStop}
                                    className="btn-secondary rounded-xl px-4 py-3"
                                    style={{ fontSize: "0.82rem" }}
                                    title="Stop generation"
                                >
                                    Stop
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    id="btn-generate"
                                    onClick={handleGenerate}
                                    disabled={!lectureText.trim()}
                                    className="flex-1 rounded-xl py-3 flex items-center justify-center gap-2 btn-primary"
                                    style={{ fontSize: "0.9rem" }}
                                >
                                    <Sparkles size={16} />
                                    Generate Notes
                                </button>
                                {(notes || lectureText) && (
                                    <button
                                        id="btn-reset"
                                        onClick={handleReset}
                                        className="btn-secondary rounded-xl px-4 py-3"
                                        title="Reset everything"
                                    >
                                        <RotateCcw size={15} />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* ── Right Panel: Output ── */}
                <NotesOutput
                    notes={notes}
                    isStreaming={isStreaming}
                    isLoading={isLoading}
                />
            </div>

            {/* Responsive styles */}
            <style jsx global>{`
        @media (max-width: 800px) {
          .main-grid {
            grid-template-columns: 1fr !important;
            padding: 0 16px 32px !important;
          }
        }
      `}</style>
        </main>
    );
}
