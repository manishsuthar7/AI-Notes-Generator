import { NextRequest } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
    try {
        const { lectureText, format, tone, detailLevel } = await req.json();

        if (!lectureText || lectureText.trim().length === 0) {
            return new Response(JSON.stringify({ error: "No lecture text provided" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return new Response(
                JSON.stringify({
                    error:
                        "OpenAI API key not configured. Please add OPENAI_API_KEY to .env.local",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const openai = new OpenAI({ apiKey });

        // Build the system prompt based on settings
        const formatInstructions: Record<string, string> = {
            bullet:
                "Use bullet points (•) for all lists and sub-points. Group related items under clear headings.",
            outline:
                "Use a numbered outline format (1. 1.1. 1.1.1.) with hierarchical indentation. Use Roman numerals for top-level sections.",
            cornell:
                "Use Cornell Notes format with three clear sections: 1) CUES/QUESTIONS column (key terms and questions), 2) NOTES column (detailed notes), and 3) SUMMARY section at the bottom.",
        };

        const toneInstructions: Record<string, string> = {
            formal:
                "Use formal academic language. Be precise and scholarly in tone.",
            casual:
                "Use a friendly, conversational tone. Make it easy to understand with relatable explanations.",
        };

        const detailInstructions: Record<string, string> = {
            brief:
                "Keep the notes concise and brief. Focus only on the most important points. Aim for roughly 30% the length of the input.",
            detailed:
                "Be comprehensive and thorough. Include detailed explanations, examples, and nuances. Aim for well-developed notes covering all aspects.",
        };

        const systemPrompt = `You are an expert academic note-taker and study guide creator. Transform the given lecture text into clean, well-organized Markdown notes.

Structure your notes with these sections:
## 📝 Summary
A brief overview paragraph of the main topic.

## 💡 Key Concepts
The most important ideas and concepts.

## 📖 Definitions
Key terms and their clear definitions.

## 🔬 Examples & Applications
Real-world examples or applications mentioned.

## 🎯 Key Takeaways
The most critical points to remember.

Formatting rules:
- ${formatInstructions[format] || formatInstructions.bullet}
- ${toneInstructions[tone] || toneInstructions.formal}
- ${detailInstructions[detailLevel] || detailInstructions.detailed}
- Use **bold** for key terms when first introduced
- Use proper Markdown headings (##, ###)
- Keep each section clearly separated
- Make the notes scannable and study-friendly`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            stream: true,
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: `Please convert the following lecture text into structured, organized study notes:\n\n${lectureText}`,
                },
            ],
            temperature: 0.4,
            max_tokens: 4000,
        });

        // Create a ReadableStream to stream the response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of response) {
                        const content = chunk.choices[0]?.delta?.content;
                        if (content) {
                            controller.enqueue(encoder.encode(content));
                        }
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (error: unknown) {
        console.error("Generate notes error:", error);
        const message =
            error instanceof Error ? error.message : "Failed to generate notes";
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
