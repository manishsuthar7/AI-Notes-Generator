import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided." }, { status: 400 });
        }

        const ext = file.name.split(".").pop()?.toLowerCase();
        const allowedTypes = ["pdf", "doc", "docx"];

        if (!ext || !allowedTypes.includes(ext)) {
            return NextResponse.json(
                { error: "Unsupported file type. Please upload a PDF, DOC, or DOCX file." },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        let extractedText = "";

        if (ext === "pdf") {
            // Use pdf-parse via its lib path to avoid Next.js test-file loading issues
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pdfParse = require("pdf-parse/lib/pdf-parse.js");
            const data = await pdfParse(buffer);
            extractedText = data.text;
        } else if (ext === "docx" || ext === "doc") {
            const mammoth = await import("mammoth");
            const result = await mammoth.extractRawText({ buffer });
            extractedText = result.value;
        }

        // Normalise whitespace: collapse excessive blank lines and trim
        extractedText = extractedText
            .replace(/\r\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();

        if (!extractedText || extractedText.length < 10) {
            return NextResponse.json(
                { error: "Could not extract text from the file. It may be scanned/image-only or password-protected." },
                { status: 422 }
            );
        }

        return NextResponse.json({ text: extractedText });
    } catch (err: unknown) {
        console.error("parse-file error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to parse file." },
            { status: 500 }
        );
    }
}
