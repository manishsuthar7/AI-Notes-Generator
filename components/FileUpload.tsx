"use client";

import { useRef, useState } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";

interface FileUploadProps {
    onTextExtracted: (text: string) => void;
    disabled?: boolean;
}

const ACCEPTED = ".pdf,.doc,.docx";
const MAX_MB = 10;

export default function FileUpload({ onTextExtracted, disabled }: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const processFile = async (file: File) => {
        setError(null);
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (!["pdf", "doc", "docx"].includes(ext ?? "")) {
            setError("Only PDF, DOC, or DOCX files are supported.");
            return;
        }
        if (file.size > MAX_MB * 1024 * 1024) {
            setError(`File is too large. Maximum size is ${MAX_MB} MB.`);
            return;
        }

        setFileName(file.name);
        setIsParsing(true);

        try {
            const form = new FormData();
            form.append("file", file);

            const res = await fetch("/api/parse-file", { method: "POST", body: form });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to parse file.");
            onTextExtracted(data.text);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to parse file.");
            setFileName(null);
        } finally {
            setIsParsing(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled || isParsing) return;
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
        // reset so same file can be re-uploaded
        e.target.value = "";
    };

    const handleClear = () => {
        setFileName(null);
        setError(null);
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Drop zone */}
            <div
                id="file-upload-zone"
                onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !disabled && !isParsing && inputRef.current?.click()}
                style={{
                    border: `1.5px dashed ${isDragging ? "var(--accent-violet)" : "var(--border)"}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: disabled || isParsing ? "not-allowed" : "pointer",
                    background: isDragging ? "rgba(124,58,237,0.07)" : "rgba(255,255,255,0.01)",
                    transition: "all 0.2s ease",
                    opacity: disabled ? 0.5 : 1,
                }}
            >
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: "rgba(124,58,237,0.1)",
                        border: "1px solid rgba(124,58,237,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    {isParsing ? (
                        <Loader2 size={16} style={{ color: "var(--accent-violet)" }} className="spin" />
                    ) : fileName ? (
                        <FileText size={16} style={{ color: "var(--accent-violet)" }} />
                    ) : (
                        <Upload size={16} style={{ color: "var(--accent-violet)" }} />
                    )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    {isParsing ? (
                        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                            Extracting text from <strong>{fileName}</strong>…
                        </p>
                    ) : fileName ? (
                        <p
                            style={{
                                fontSize: "0.82rem",
                                color: "var(--accent-violet)",
                                fontWeight: 500,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            ✓ {fileName}
                        </p>
                    ) : (
                        <>
                            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                                Upload PDF, DOC, or DOCX
                            </p>
                            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>
                                Drag & drop or click — up to {MAX_MB} MB
                            </p>
                        </>
                    )}
                </div>

                {fileName && !isParsing && (
                    <button
                        id="btn-clear-file"
                        onClick={(e) => { e.stopPropagation(); handleClear(); }}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--text-muted)",
                            padding: 4,
                            borderRadius: 4,
                            display: "flex",
                            flexShrink: 0,
                        }}
                        title="Clear file"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <p
                    className="fade-in"
                    style={{
                        fontSize: "0.78rem",
                        color: "#fca5a5",
                        background: "rgba(239,68,68,0.07)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: 8,
                        padding: "6px 10px",
                    }}
                >
                    ⚠ {error}
                </p>
            )}

            <input
                ref={inputRef}
                id="file-upload-input"
                type="file"
                accept={ACCEPTED}
                style={{ display: "none" }}
                onChange={handleChange}
                disabled={disabled || isParsing}
            />
        </div>
    );
}
