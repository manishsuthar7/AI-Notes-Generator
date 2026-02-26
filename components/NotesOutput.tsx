"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Download, CheckCircle } from "lucide-react";

interface NotesOutputProps {
    notes: string;
    isStreaming: boolean;
}

export default function NotesOutput({ notes, isStreaming }: NotesOutputProps) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
        if (!notes) return;
        try {
            await navigator.clipboard.writeText(notes);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const textarea = document.createElement("textarea");
            textarea.value = notes;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (!notes) return;
        const blob = new Blob([notes], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ai-notes-${new Date().toISOString().slice(0, 10)}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;

    return (
        <div
            className="glass-card fade-in"
            style={{
                padding: "24px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1.1rem" }}>✨</span>
                    <h2
                        style={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            color: "var(--foreground)",
                            margin: 0,
                        }}
                    >
                        Generated Notes
                    </h2>
                    {notes && (
                        <span
                            style={{
                                fontSize: "0.75rem",
                                color: "var(--text-muted)",
                                background: "rgba(124, 58, 237, 0.1)",
                                padding: "2px 8px",
                                borderRadius: "8px",
                            }}
                        >
                            {wordCount} words
                        </span>
                    )}
                </div>

                {notes && (
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            className="btn-secondary"
                            onClick={handleCopy}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                            }}
                        >
                            {copied ? (
                                <CheckCircle size={14} color="var(--success)" />
                            ) : (
                                <Copy size={14} />
                            )}
                            {copied ? "Copied!" : "Copy"}
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={handleDownload}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                            }}
                        >
                            <Download size={14} />
                            Download
                        </button>
                    </div>
                )}
            </div>

            {/* Output Area */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "4px",
                }}
            >
                {notes ? (
                    <div className={`markdown-output ${isStreaming ? "streaming-cursor" : ""}`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
                    </div>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            color: "var(--text-muted)",
                            textAlign: "center",
                            gap: "12px",
                            padding: "40px 20px",
                        }}
                    >
                        <span style={{ fontSize: "2.5rem", opacity: 0.4 }}>✨</span>
                        <p style={{ fontSize: "0.95rem", maxWidth: "280px" }}>
                            Your AI-generated notes will appear here. Paste text and click{" "}
                            <strong style={{ color: "var(--accent-light)" }}>Generate Notes</strong>.
                        </p>
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "6px",
                                justifyContent: "center",
                                marginTop: "8px",
                            }}
                        >
                            {["📋 Summary", "💡 Key Concepts", "📖 Definitions", "🎯 Takeaways"].map(
                                (tag) => (
                                    <span
                                        key={tag}
                                        style={{
                                            fontSize: "0.72rem",
                                            padding: "3px 10px",
                                            borderRadius: "12px",
                                            background: "rgba(124, 58, 237, 0.08)",
                                            color: "var(--text-muted)",
                                            border: "1px solid var(--card-border)",
                                        }}
                                    >
                                        {tag}
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
