"use client";

export default function LoadingDots() {
    return (
        <div className="flex items-center gap-2 py-4" id="loading-dots">
            <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "var(--accent-violet)",
                            display: "inline-block",
                            animation: `bounce 1.2s ease-in-out infinite`,
                            animationDelay: `${i * 0.2}s`,
                        }}
                    />
                ))}
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Generating your notes…
            </span>
            <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
        </div>
    );
}
