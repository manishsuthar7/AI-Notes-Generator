"use client";

interface SettingsPanelProps {
    format: string;
    tone: string;
    detailLevel: string;
    onFormatChange: (v: string) => void;
    onToneChange: (v: string) => void;
    onDetailChange: (v: string) => void;
    disabled?: boolean;
}

const formats = [
    { value: "bullet", label: "• Bullet" },
    { value: "outline", label: "1. Outline" },
    { value: "cornell", label: "Cornell" },
];

const tones = [
    { value: "formal", label: "Formal" },
    { value: "casual", label: "Casual" },
];

const details = [
    { value: "brief", label: "Brief" },
    { value: "detailed", label: "Detailed" },
];

function PillGroup({
    label,
    options,
    value,
    onChange,
    disabled,
}: {
    label: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
}) {
    return (
        <div className="flex flex-col gap-2">
            <span
                style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}
            >
                {label}
            </span>
            <div className="flex gap-2 flex-wrap">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        className={`pill ${value === opt.value ? "active" : ""}`}
                        onClick={() => onChange(opt.value)}
                        disabled={disabled}
                        id={`pill-${label.toLowerCase()}-${opt.value}`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function SettingsPanel({
    format,
    tone,
    detailLevel,
    onFormatChange,
    onToneChange,
    onDetailChange,
    disabled,
}: SettingsPanelProps) {
    return (
        <div className="flex flex-col gap-4">
            <PillGroup
                label="Format"
                options={formats}
                value={format}
                onChange={onFormatChange}
                disabled={disabled}
            />
            <PillGroup
                label="Tone"
                options={tones}
                value={tone}
                onChange={onToneChange}
                disabled={disabled}
            />
            <PillGroup
                label="Detail"
                options={details}
                value={detailLevel}
                onChange={onDetailChange}
                disabled={disabled}
            />
        </div>
    );
}
