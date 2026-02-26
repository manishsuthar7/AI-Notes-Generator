"use client";

import React from "react";

interface SettingsPanelProps {
    format: string;
    setFormat: (f: string) => void;
    tone: string;
    setTone: (t: string) => void;
    detailLevel: string;
    setDetailLevel: (d: string) => void;
}

const formats = [
    { value: "bullet", label: "• Bullet" },
    { value: "outline", label: "# Outline" },
    { value: "cornell", label: "📋 Cornell" },
];

const tones = [
    { value: "formal", label: "🎓 Formal" },
    { value: "casual", label: "💬 Casual" },
];

const detailLevels = [
    { value: "brief", label: "⚡ Brief" },
    { value: "detailed", label: "📖 Detailed" },
];

export default function SettingsPanel({
    format,
    setFormat,
    tone,
    setTone,
    detailLevel,
    setDetailLevel,
}: SettingsPanelProps) {
    return (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Format */}
            <div>
                <label
                    style={{
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "8px",
                        display: "block",
                    }}
                >
                    Format
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {formats.map((f) => (
                        <button
                            key={f.value}
                            className={`pill-btn ${format === f.value ? "active" : ""}`}
                            onClick={() => setFormat(f.value)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tone */}
            <div>
                <label
                    style={{
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "8px",
                        display: "block",
                    }}
                >
                    Tone
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {tones.map((t) => (
                        <button
                            key={t.value}
                            className={`pill-btn ${tone === t.value ? "active" : ""}`}
                            onClick={() => setTone(t.value)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Detail Level */}
            <div>
                <label
                    style={{
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "8px",
                        display: "block",
                    }}
                >
                    Detail Level
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {detailLevels.map((d) => (
                        <button
                            key={d.value}
                            className={`pill-btn ${detailLevel === d.value ? "active" : ""}`}
                            onClick={() => setDetailLevel(d.value)}
                        >
                            {d.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
