"use client";

import React, { useState, useRef, useCallback } from "react";
import {
    Sparkles,
    FileUp,
    StopCircle,
    Loader2,
    BookOpen,
    Zap,
} from "lucide-react";
import SettingsPanel from "@/components/SettingsPanel";
import NotesOutput from "@/components/NotesOutput";
import LoadingDots from "@/components/LoadingDots";

const EXAMPLE_TEXT = `Machine learning is a subset of artificial intelligence that focuses on building systems that can learn from data and improve their performance over time without being explicitly programmed. The three main types of machine learning are supervised learning, unsupervised learning, and reinforcement learning.

Supervised learning involves training a model on labeled data, where the correct output is known. Common algorithms include linear regression for predicting continuous values, logistic regression for classification tasks, and neural networks for complex pattern recognition.

Unsupervised learning works with unlabeled data to discover hidden patterns or groupings. Clustering algorithms like K-means group similar data points together, while dimensionality reduction techniques like PCA help simplify complex datasets.

Reinforcement learning trains agents to make sequences of decisions by rewarding desired behaviors and penalizing undesired ones. This approach has been successfully applied in game playing, robotics, and autonomous vehicle navigation.

Key challenges in machine learning include overfitting (when a model performs well on training data but poorly on new data), underfitting (when a model is too simple to capture the underlying patterns), and the bias-variance tradeoff. Regularization techniques like L1 and L2 regularization help prevent overfitting by adding penalty terms to the loss function.`;

export default function HomePage() {
    const [lectureText, setLectureText] = useState("");
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [format, setFormat] = useState("bullet");
    const [tone, setTone] = useState("formal");
    const [detailLevel, setDetailLevel] = useState("detailed");
    const [toast, setToast] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const showToast = useCallback((message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    }, []);

    const wordCount = lectureText.trim()
        ? lectureText.trim().split(/\s+/).length
        : 0;
    const charCount = lectureText.length;

    const handleGenerate = async () => {
        if (!lectureText.trim()) {
            showToast("⚠️ Please enter some lecture text first.");
            return;
        }

        setIsLoading(true);
        setIsStreaming(false);
        setNotes("");

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const res = await fetch("/api/generate-notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lectureText, format, tone, detailLevel }),
                signal: controller.signal,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to generate notes");
            }

            if (!res.body) throw new Error("No response stream");

            setIsLoading(false);
            setIsStreaming(true);

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const text = decoder.decode(value, { stream: true });
                accumulated += text;
                setNotes(accumulated);
            }

            setIsStreaming(false);
            showToast("✅ Notes generated successfully!");
        } catch (error: unknown) {
            if (error instanceof Error && error.name === "AbortError") {
                showToast("⏹️ Generation stopped.");
            } else {
                const message =
                    error instanceof Error ? error.message : "An error occurred";
                showToast(`❌ ${message}`);
            }
            setIsLoading(false);
            setIsStreaming(false);
        }
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsStreaming(false);
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            showToast(`📄 Parsing ${file.name}...`);
            const res = await fetch("/api/parse-file", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setLectureText(data.text);
            showToast(`✅ Extracted text from ${file.name}`);
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : "Failed to parse file";
            showToast(`❌ ${message}`);
        }

        // Reset file input
        e.target.value = "";
    };

    return (
        <main
            style={{
                position: "relative",
                minHeight: "100vh",
                padding: "24px",
                maxWidth: "1400px",
                margin: "0 auto",
            }}
        >
            {/* Background Orbs */}
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />

            {/* Header */}
            <header
                style={{
                    textAlign: "center",
                    marginBottom: "40px",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                        marginBottom: "12px",
                    }}
                >
                    <BookOpen size={32} color="var(--accent-light)" />
                    <h1
                        className="gradient-text"
                        style={{
                            fontSize: "2.5rem",
                            fontWeight: 800,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        AI Notes Generator
                    </h1>
                    <Zap size={24} color="var(--accent)" />
                </div>
                <p
                    style={{
                        color: "var(--text-muted)",
                        fontSize: "1.05rem",
                        maxWidth: "500px",
                        margin: "0 auto",
                    }}
                >
                    Transform your lecture text into clean, structured study notes
                    instantly.
                </p>
            </header>

            {/* Main Grid */}
            <div
                className="main-grid"
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "24px",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                {/* Left Panel - Input */}
                <div className="glass-card" style={{ padding: "24px" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "16px",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "1rem",
                                fontWeight: 600,
                                color: "var(--foreground)",
                                margin: 0,
                            }}
                        >
                            📝 Lecture Text
                        </h2>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span
                                style={{
                                    fontSize: "0.75rem",
                                    color: "var(--text-muted)",
                                }}
                            >
                                {wordCount} words · {charCount.toLocaleString()} chars
                            </span>
                        </div>
                    </div>

                    <textarea
                        className="notes-textarea"
                        placeholder="Paste your lecture transcript, textbook passage, or any educational content here..."
                        value={lectureText}
                        onChange={(e) => {
                            if (e.target.value.length <= 10000) {
                                setLectureText(e.target.value);
                            }
                        }}
                        maxLength={10000}
                    />

                    {/* File Upload & Example */}
                    <div
                        style={{
                            display: "flex",
                            gap: "8px",
                            marginTop: "12px",
                            flexWrap: "wrap",
                        }}
                    >
                        <label
                            className="btn-secondary"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                cursor: "pointer",
                            }}
                        >
                            <FileUp size={14} />
                            Upload File
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleFileUpload}
                                style={{ display: "none" }}
                            />
                        </label>
                        <button
                            className="btn-secondary"
                            onClick={() => setLectureText(EXAMPLE_TEXT)}
                        >
                            📋 Try Example
                        </button>
                        {lectureText && (
                            <button
                                className="btn-secondary"
                                onClick={() => setLectureText("")}
                                style={{ color: "var(--danger)" }}
                            >
                                ✕ Clear
                            </button>
                        )}
                    </div>

                    {/* Settings */}
                    <div
                        style={{
                            marginTop: "20px",
                            paddingTop: "20px",
                            borderTop: "1px solid var(--card-border)",
                        }}
                    >
                        <SettingsPanel
                            format={format}
                            setFormat={setFormat}
                            tone={tone}
                            setTone={setTone}
                            detailLevel={detailLevel}
                            setDetailLevel={setDetailLevel}
                        />
                    </div>

                    {/* Generate Button */}
                    <div style={{ marginTop: "20px" }}>
                        {isStreaming ? (
                            <button
                                className="btn-primary"
                                onClick={handleStop}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    background:
                                        "linear-gradient(135deg, #ef4444, #dc2626)",
                                }}
                            >
                                <StopCircle size={18} />
                                Stop Generation
                            </button>
                        ) : (
                            <button
                                className="btn-primary pulse-glow"
                                onClick={handleGenerate}
                                disabled={isLoading || !lectureText.trim()}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2
                                            size={18}
                                            style={{ animation: "spin 1s linear infinite" }}
                                        />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        Generate Notes
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {isLoading && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginTop: "12px",
                                justifyContent: "center",
                            }}
                        >
                            <LoadingDots />
                            <span
                                style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                            >
                                AI is processing your text...
                            </span>
                        </div>
                    )}
                </div>

                {/* Right Panel - Output */}
                <NotesOutput notes={notes} isStreaming={isStreaming} />
            </div>

            {/* Toast Notification */}
            {toast && <div className="toast">{toast}</div>}

            {/* Spinner keyframe (for Loader2) */}
            <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
        </main>
    );
}
