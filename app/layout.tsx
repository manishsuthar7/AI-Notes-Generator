import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "AI Notes Generator — Instantly Create Structured Lecture Notes",
    description:
        "Paste your lecture text and let AI transform it into clean, organized study notes with summaries, key concepts, definitions, and takeaways. Powered by OpenAI GPT-4o.",
    keywords: [
        "AI notes",
        "lecture notes",
        "study notes",
        "OpenAI",
        "GPT-4",
        "note generator",
        "AI study tool",
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
