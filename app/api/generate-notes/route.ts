import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { lectureText, format, tone, detailLevel } = await req.json();

        if (!lectureText || lectureText.trim().length < 10) {
            return NextResponse.json(
                { error: "Please provide lecture text (at least 10 characters)." },
                { status: 400 }
            );
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OpenAI API key not configured. Add OPENAI_API_KEY to .env.local" },
                { status: 500 }
            );
        }

        const formatInstructions: Record<string, string> = {
            bullet: "Use bullet points (•) for all main points and sub-points.",
            outline: "Use a numbered outline format (1. / 1.1 / 1.1.1) for hierarchy.",
            cornell:
                "Use Cornell Note format: a 'Cues' column (key questions/keywords) on the left and 'Notes' on the right, with a 'Summary' section at the bottom.",
        };

        const toneInstructions: Record<string, string> = {
            formal: "Use formal academic language.",
            casual: "Use clear, casual, approachable language like a friend explaining it.",
        };

        const detailInstructions: Record<string, string> = {
            brief: "Be concise — capture only the core ideas, keep each section short.",
            detailed:
                "Be thorough — include examples, elaborations, and supporting details.",
        };

        const systemPrompt = `You are an expert academic note-taker who transforms raw lecture text into beautifully structured, 
    clear Markdown notes. Your output should always be clean, scannable, and instantly useful for a student.

    Structure your notes with these exact sections when relevant:
    ## 📌 Summary
    ## 🔑 Key Concepts
    ## 📖 Definitions & Terminology
    ## 💡 Examples & Applications
    ## ✅ Key Takeaways

    Formatting rules:
    - ${formatInstructions[format] || formatInstructions.bullet}
    - ${toneInstructions[tone] || toneInstructions.formal}
    - ${detailInstructions[detailLevel] || detailInstructions.detailed}
    - Use **bold** for important terms
    - Use \`code blocks\` for technical terms, formulas, or code
    - Use > blockquotes for important quotes or facts
    - Keep headings clear and hierarchical
    - Output ONLY the notes — no preamble, no "Sure, here are your notes:" intro.`;

        const stream = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            stream: true,
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: `Please convert the following lecture text into clean structured notes:\n\n${lectureText}`,
                },
            ],
            temperature: 0.4,
            max_tokens: 2000,
        });

        const encoder = new TextEncoder();

        const readable = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const text = chunk.choices[0]?.delta?.content || "";
                    if (text) {
                        controller.enqueue(encoder.encode(text));
                    }
                }
                controller.close();
            },
        });

        return new Response(readable, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            },
        });
    } catch (error: unknown) {
        console.error("Generate notes error:", error);
        const message =
            error instanceof Error ? error.message : "An unexpected error occurred.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
