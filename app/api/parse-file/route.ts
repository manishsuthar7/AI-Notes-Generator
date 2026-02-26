import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = file.name.toLowerCase();
        let text = "";

        if (fileName.endsWith(".pdf")) {
            const data = await pdfParse(buffer);
            text = data.text;
        } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else if (fileName.endsWith(".txt")) {
            text = buffer.toString("utf-8");
        } else {
            return NextResponse.json(
                { error: "Unsupported file type. Please upload a PDF, DOC, DOCX, or TXT file." },
                { status: 400 }
            );
        }

        if (!text.trim()) {
            return NextResponse.json(
                { error: "Could not extract any text from the file." },
                { status: 400 }
            );
        }

        return NextResponse.json({ text: text.trim() });
    } catch (error: unknown) {
        console.error("Parse file error:", error);
        const message =
            error instanceof Error ? error.message : "Failed to parse file";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
