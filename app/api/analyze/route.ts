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

function getRoleKeywords(role: string) {
  const normalized = role.toLowerCase();
  if (normalized.includes("frontend")) return ["react", "next", "typescript", "javascript", "css", "html", "accessibility", "performance", "testing"];
  if (normalized.includes("backend")) return ["api", "node", "database", "sql", "postgres", "redis", "docker", "kubernetes", "aws", "scalability"];
  if (normalized.includes("product")) return ["product", "roadmap", "metrics", "experiment", "stakeholder", "launch", "retention", "growth", "strategy", "research"];
  if (normalized.includes("design")) return ["figma", "wireframe", "prototype", "research", "usability", "design system", "interaction", "visual", "accessibility", "journey"];
  if (normalized.includes("data")) return ["sql", "python", "excel", "tableau", "power bi", "analytics", "dashboard", "data", "statistics"];
  if (normalized.includes("marketing")) return ["marketing", "campaign", "seo", "content", "social media", "analytics", "brand", "growth", "conversion"];
  return ["experience", "skills", "leadership", "communication", "impact", "results"];
}

function buildFallbackAnalysis(role: string, resumeText: string): GeminiResult {
  const normalized = resumeText.toLowerCase();
  const keywords = getRoleKeywords(role);
  const matches = keywords.filter((keyword) => normalized.includes(keyword));
  const missing = keywords.filter((keyword) => !matches.includes(keyword));

  const score = Math.max(
    25,
    Math.min(
      92,
      34 + matches.length * 7 - Math.max(0, missing.length - 2) * 3 + Math.min(12, Math.floor(resumeText.length / 250)),
    ),
  );

  const improvementPool = [
    `Add more explicit ${keywords[0] || "role-specific"} keywords to improve ATS matching.`,
    "Quantify impact with numbers, percentages, or outcomes where possible.",
    "Tighten the summary so it mirrors the target role more closely.",
    "Reorder bullet points so the strongest achievements appear first.",
    "Use consistent section headings like Experience, Projects, Skills, and Education.",
    "Keep bullet points concise and action-oriented for faster scanning.",
  ];

  const improvedResume = [
    "Target Role:",
    role,
    "",
    "Summary",
    "Resume details could not be analyzed by Gemini, so this draft is based on local ATS heuristics.",
    "",
    "Suggested Improvements",
    ...missing.slice(0, 5).map((keyword) => `- Add evidence of ${keyword}.`),
    ...matches.slice(0, 3).map((keyword) => `- Keep showing ${keyword} examples prominently.`),
    "- Add measurable outcomes to your strongest bullets.",
  ].join("\n");

  return {
    score,
    summary: matches.length
      ? `Local analysis found ${matches.length} role-aligned keywords for ${role}.`
      : `Local analysis could not verify strong role alignment for ${role}, so the score is based on ATS heuristics.`,
    improvements: improvementPool.slice(0, 5),
    improvedResume,
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const formData = await request.formData();
  const resume = formData.get("resume");
  const role = String(formData.get("role") || "General professional");
  const resumeText = String(formData.get("resumeText") || "");

  if (!(resume instanceof File)) return Response.json({ error: "Please upload a resume file." }, { status: 400 });
  if (resume.size > 10 * 1024 * 1024) return Response.json({ error: "Please upload a file smaller than 10 MB." }, { status: 413 });

  const fallback = () => Response.json({ ...buildFallbackAnalysis(role, resumeText || `${resume.name} ${resume.type}`), analysisSource: "local" });

  if (!apiKey) {
    return fallback();
  }

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
      analysisSource: "gemini",
    });
  } catch (error) {
    console.error("Gemini resume analysis failed", error);
    return fallback();
  }
}
