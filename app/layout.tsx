import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "AI Notes Generator — Turn Lectures into Instant Notes",
    description:
        "Paste any lecture text and instantly get clean, structured notes powered by AI. Summary, key concepts, definitions, examples and takeaways — in seconds.",
    keywords: ["AI notes", "lecture notes", "study tool", "OpenAI", "note generator"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="antialiased">{children}</body>
        </html>
    );
}
