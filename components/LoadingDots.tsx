"use client";

import React from "react";

export default function LoadingDots() {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 0",
            }}
        >
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
                        animation: `dotBounce 1.4s ease-in-out ${i * 0.16}s infinite both`,
                    }}
                />
            ))}
            <style jsx>{`
        @keyframes dotBounce {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
        </div>
    );
}
