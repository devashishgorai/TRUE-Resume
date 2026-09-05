import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

type GeminiResult = {
  score: number;
  summary: string;
  improvements: string[];
  improvedResume: string;
};

function cleanJson(value: string) {
  return value.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return Response.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });

  const formData = await request.formData();
  const resume = formData.get("resume");
  const role = String(formData.get("role") || "General professional");

  if (!(resume instanceof File)) return Response.json({ error: "Please upload a resume file." }, { status: 400 });
  if (resume.size > 10 * 1024 * 1024) return Response.json({ error: "Please upload a file smaller than 10 MB." }, { status: 413 });

  const buffer = Buffer.from(await resume.arrayBuffer());
  const mimeType = resume.type || "application/octet-stream";
  const prompt = `You are an ATS resume specialist. Review this resume for the role: ${role}.

Return ONLY valid JSON with this exact shape:
{
  "score": number from 0 to 100,
  "summary": "one concise sentence",
  "improvements": ["5 specific, actionable improvements"],
  "improvedResume": "a polished plain-text resume draft using only facts found in the uploaded resume; never invent employers, dates, education, or metrics"
}

Evaluate keyword alignment, clarity, measurable impact, structure, and ATS readability. Keep the improved draft easy to copy into a document.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [{ text: prompt }, { inlineData: { data: buffer.toString("base64"), mimeType } }],
      config: { responseMimeType: "application/json", temperature: 0.2 },
    });
    const parsed = JSON.parse(cleanJson(response.text || "")) as GeminiResult;
    return Response.json({
      score: Math.max(0, Math.min(100, Math.round(parsed.score))),
      summary: parsed.summary,
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 6) : [],
      improvedResume: parsed.improvedResume,
    });
  } catch (error) {
    console.error("Gemini resume analysis failed", error);
    const message = error instanceof Error ? error.message : "Unknown Gemini error";
    const isJsonError = message.includes("JSON") || message.includes("Unexpected token");
    return Response.json({ error: isJsonError ? "Gemini returned an unexpected response. Please try again." : `Gemini request failed: ${message.slice(0, 180)}` }, { status: 502 });
  }
}
