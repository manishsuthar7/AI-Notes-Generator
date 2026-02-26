"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Download, CheckCheck } from "lucide-react";
import { useState } from "react";
import LoadingDots from "./LoadingDots";

interface NotesOutputProps {
    notes: string;
    isStreaming: boolean;
    isLoading: boolean;
}

export default function NotesOutput({ notes, isStreaming, isLoading }: NotesOutputProps) {
    const [copied, setCopied] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [toastHiding, setToastHiding] = useState(false);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setToastHiding(false);
        setToastVisible(true);
        setTimeout(() => {
            setToastHiding(true);
            setTimeout(() => setToastVisible(false), 350);
        }, 2200);
    };

    const handleCopy = async () => {
        if (!notes) return;
        await navigator.clipboard.writeText(notes);
        setCopied(true);
        showToast("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!notes) return;
        const blob = new Blob([notes], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `notes-${new Date().toISOString().slice(0, 10)}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("Downloaded as .md file!");
    };

    const isEmpty = !notes && !isLoading && !isStreaming;

    return (
        <div
            className="glass-card rounded-2xl flex flex-col h-full relative"
            style={{ minHeight: "500px" }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid var(--border)" }}
            >
                <div className="flex items-center gap-2">
                    <span style={{ fontSize: "1rem" }}>📝</span>
                    <h2
                        style={{
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            letterSpacing: "0.01em",
                        }}
                    >
                        Generated Notes
                    </h2>
                    {isStreaming && (
                        <span
                            style={{
                                fontSize: "0.7rem",
                                color: "var(--accent-violet)",
                                background: "rgba(124,58,237,0.12)",
                                padding: "2px 8px",
                                borderRadius: "9999px",
                                fontWeight: 600,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                            }}
                        >
                            LIVE
                        </span>
                    )}
                </div>

                {notes && (
                    <div className="flex gap-2">
                        <button
                            id="btn-copy"
                            className="btn-secondary rounded-lg px-3 py-1.5 flex items-center gap-1.5"
                            style={{ fontSize: "0.78rem" }}
                            onClick={handleCopy}
                            title="Copy to clipboard"
                        >
                            {copied ? (
                                <CheckCheck size={13} style={{ color: "var(--accent-violet)" }} />
                            ) : (
                                <Copy size={13} />
                            )}
                            {copied ? "Copied!" : "Copy"}
                        </button>
                        <button
                            id="btn-download"
                            className="btn-secondary rounded-lg px-3 py-1.5 flex items-center gap-1.5"
                            style={{ fontSize: "0.78rem" }}
                            onClick={handleDownload}
                            title="Download as Markdown"
                        >
                            <Download size={13} />
                            .md
                        </button>
                    </div>
                )}
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto px-5 py-5" style={{ minHeight: 0 }}>
                {isEmpty && (
                    <div
                        className="flex flex-col items-center justify-center h-full gap-4 fade-in"
                        style={{ minHeight: "360px" }}
                    >
                        <div
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: "16px",
                                background: "rgba(124,58,237,0.08)",
                                border: "1px solid var(--border)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.8rem",
                            }}
                        >
                            ✨
                        </div>
                        <p
                            style={{
                                color: "var(--text-muted)",
                                textAlign: "center",
                                fontSize: "0.9rem",
                                lineHeight: 1.6,
                                maxWidth: 280,
                            }}
                        >
                            Your AI-generated notes will appear here instantly as they&apos;re written.
                        </p>
                        <div className="flex gap-2 flex-wrap justify-center" style={{ marginTop: 4 }}>
                            {["Summary", "Key Concepts", "Definitions", "Takeaways"].map((tag) => (
                                <span
                                    key={tag}
                                    style={{
                                        fontSize: "0.72rem",
                                        padding: "3px 10px",
                                        borderRadius: "9999px",
                                        border: "1px solid var(--border)",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {isLoading && !notes && <LoadingDots />}

                {notes && (
                    <div className={`notes-output fade-in ${isStreaming ? "streaming-cursor" : ""}`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
                    </div>
                )}
            </div>

            {/* Toast */}
            {toastVisible && (
                <div
                    className={`toast ${toastHiding ? "hiding" : ""}`}
                    style={{
                        position: "fixed",
                        bottom: 24,
                        right: 24,
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-hover)",
                        borderRadius: 12,
                        padding: "10px 18px",
                        fontSize: "0.85rem",
                        color: "var(--text-primary)",
                        zIndex: 100,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <CheckCheck size={15} style={{ color: "var(--accent-violet)" }} />
                    {toastMsg}
                </div>
            )}
        </div>
    );
}
