"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Image from "next/image";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type Role = { id: string; label: string; keywords: string[] };
type GeminiResult = { score: number; summary: string; improvements: string[]; improvedResume: string; analysisSource?: "gemini" | "local" };

const roles: Role[] = [
  { id: "frontend", label: "Frontend Developer", keywords: ["react", "next", "typescript", "javascript", "css", "html", "accessibility", "performance", "testing"] },
  { id: "backend", label: "Backend Engineer", keywords: ["api", "node", "database", "sql", "postgres", "redis", "docker", "kubernetes", "aws", "scalability"] },
  { id: "product", label: "Product Manager", keywords: ["product", "roadmap", "metrics", "experiment", "stakeholder", "launch", "retention", "growth", "strategy", "research"] },
  { id: "design", label: "UI/UX Designer", keywords: ["figma", "wireframe", "prototype", "research", "usability", "design system", "interaction", "visual", "accessibility", "journey"] },
  { id: "data", label: "Data Analyst", keywords: ["sql", "python", "excel", "tableau", "power bi", "analytics", "dashboard", "data", "statistics"] },
  { id: "marketing", label: "Marketing Manager", keywords: ["marketing", "campaign", "seo", "content", "social media", "analytics", "brand", "growth", "conversion"] },
];

const actionWords = ["built", "designed", "launched", "led", "managed", "improved", "optimized", "increased", "reduced", "scaled"];

function getScore(text: string, role: Role) {
  const normalized = text.toLowerCase();
  const matches = role.keywords.filter((keyword) => normalized.includes(keyword));
  const actions = actionWords.filter((word) => normalized.includes(word));
  const sections = ["summary", "skills", "experience", "education", "projects"].filter((word) => normalized.includes(word));
  const score = Math.min(99, Math.max(0, 28 + Math.round((matches.length / role.keywords.length) * 48) + Math.min(12, actions.length * 3) + Math.min(10, sections.length * 2) + (text.length > 200 ? 8 : 0)));
  return { score, matches, missing: role.keywords.filter((keyword) => !matches.includes(keyword)) };
}

function wrapText(text: string, maxCharacters: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (`${line} ${word}`.trim().length > maxCharacters) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = `${line} ${word}`.trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function downloadResumePdf(content: string, role: string) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  let logo;
  try {
    const logoBytes = await fetch("/metaicon.png").then((response) => response.arrayBuffer());
    logo = await pdf.embedPng(logoBytes);
  } catch {
    logo = undefined;
  }
  let page = pdf.addPage([612, 792]);
  let y = 622;
  const addPageIfNeeded = () => {
    if (y < 58) {
      page = pdf.addPage([612, 792]);
      y = 742;
    }
  };

  if (logo) page.drawImage(logo, { x: 278, y: 704, width: 56, height: 56 });
  page.drawText("Improved Resume", { x: 48, y: 682, size: 20, font: boldFont, color: rgb(0.08, 0.15, 0.45) });
  page.drawText(`ATS-ready draft for ${role}`, { x: 48, y: 664, size: 10, font, color: rgb(0.35, 0.4, 0.52) });
  page.drawLine({ start: { x: 48, y: 646 }, end: { x: 564, y: 646 }, thickness: 1, color: rgb(0.82, 0.85, 0.93) });
  for (const rawLine of content.replace(/\r/g, "").split("\n")) {
    const trimmedLine = rawLine.trim();
    const isBullet = /^[-*\u2022]\s+/.test(trimmedLine);
    const isHeading = /^#+\s/.test(trimmedLine) || (/^[A-Z][A-Z &/0-9-]{3,}$/.test(trimmedLine) && trimmedLine.length < 55);
    const cleanLine = trimmedLine.replace(/^#+\s*/, "").replace(/^[-*\u2022]\s*/, "").replace(/\*\*/g, "").trim();
    if (!cleanLine) { y -= 10; continue; }
    const wrappedLines = wrapText(cleanLine, isBullet ? 84 : 92);
    if (isHeading) y -= 6;
    for (const [index, line] of wrappedLines.entries()) {
      addPageIfNeeded();
      page.drawText(line, { x: isBullet ? 64 : 48, y, size: isHeading ? 10.5 : 10, font: isHeading ? boldFont : font, color: isHeading ? rgb(0.08, 0.15, 0.45) : rgb(0.1, 0.12, 0.18) });
      if (isBullet && index === 0) page.drawCircle({ x: 53, y: y + 3, size: 1.8, color: rgb(0.15, 0.28, 0.65) });
      y -= isHeading ? 17 : 15;
    }
    y -= isHeading ? 4 : 2;
  }
  const bytes = await pdf.save();
  const url = URL.createObjectURL(new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "improved-resume.pdf";
  link.click();
  URL.revokeObjectURL(url);
}

async function readResume(file: File) {
  const name = file.name.toLowerCase();
  const textFile = file.type.startsWith("text/") || [".txt", ".md", ".rtf", ".html", ".csv"].some((extension) => name.endsWith(extension));
  return textFile ? file.text() : `${file.name} ${file.type}`;
}

export default function Home() {
  const [roleId, setRoleId] = useState(roles[0].id);
  const [customRole, setCustomRole] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [geminiResult, setGeminiResult] = useState<GeminiResult | null>(null);
  const [analysisError, setAnalysisError] = useState("");
  const selectableRoles = [...roles, { id: "other", label: customRole.trim() || "Other role", keywords: ["experience", "skills", "leadership", "communication"] }];
  const role = selectableRoles.find((item) => item.id === roleId) ?? roles[0];
  const result = getScore(resumeText, role);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function analyzeWithGemini(uploaded: File, roleLabel: string) {
    setIsScanning(true);
    setAnalysisError("");
    try {
      const formData = new FormData();
      formData.append("resume", uploaded);
      formData.append("role", roleLabel);
      formData.append("resumeText", resumeText);
      const response = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");
      setGeminiResult(data as GeminiResult);
    } catch (error) {
      setGeminiResult(null);
      setAnalysisError(error instanceof Error ? error.message : "Gemini analysis failed. Please try again.");
    } finally {
      setIsScanning(false);
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const uploaded = event.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);
    setAnalysisError("");
    try {
      const text = await readResume(uploaded);
      setResumeText(text);
    } finally {
      void analyzeWithGemini(uploaded, role.label);
    }
  }

  function selectRole(id: string, button: HTMLButtonElement) {
    setRoleId(id);
    button.scrollIntoView({ behavior: "smooth", block: "center" });
    const nextRole = selectableRoles.find((item) => item.id === id);
    if (file && nextRole) void analyzeWithGemini(file, nextRole.label);
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#f6f0e4] text-[#101936]">
      <div className="pointer-events-none absolute -left-32 -top-40 h-[520px] w-[520px] rounded-full bg-[#2338ad]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-28 h-[480px] w-[480px] rounded-full bg-[#8eaaf4]/30 blur-3xl" />

      <header className={`sticky top-0 z-30 flex items-center justify-between overflow-hidden border-b px-6 py-4 transition-all duration-500 md:px-12 md:py-5 ${isScrolled ? "border-white/30 bg-[#18339d]/95 shadow-[0_10px_30px_rgba(25,48,145,0.22)] backdrop-blur-xl" : "border-[#5064c3]/25 bg-[linear-gradient(105deg,rgba(35,55,169,0.94),rgba(69,103,211,0.88),rgba(34,55,156,0.94))]"}`}>
        <div className="header-glow" />
        <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-xl text-white shadow-lg shadow-[#10236f]/25">✦</div><div><p className="text-xl font-bold tracking-tight text-white">ATS Prism</p><p className="text-xs font-medium uppercase tracking-[0.2em] text-white/65">Resume fit checker</p></div></div>
        <a className="hidden rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white/90 transition hover:border-white/70 hover:bg-white/15 sm:block" href="https://www.instagram.com/true.engineer/" target="_blank" rel="noreferrer">True Engineer</a>
      </header>

      <section className="relative z-10 flex flex-1 items-center justify-center px-5 pb-32 pt-6 md:px-10 md:pb-36">
        <div className="w-full max-w-4xl rounded-[36px] border border-white/90 bg-[#fffdf8]/90 p-5 shadow-[0_30px_90px_rgba(35,48,111,0.16)] backdrop-blur md:p-10">
          <div className="mx-auto max-w-5xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e8efff] px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#2445b5]"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Ready to scan</span>
            <h1 className="mt-6 whitespace-nowrap text-[clamp(1.75rem,4.5vw,3.5rem)] font-bold tracking-[-0.05em] text-[#101936]">Find your resume&apos;s role fit.</h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-[#68728d]">Choose the role you want, then drop your resume below to see a clear ATS score.</p>

            <label className="group mt-9 flex min-h-[290px] cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-[#b9c5ed] bg-[#f8f7f2] px-6 py-10 transition hover:border-[#294dc5] hover:bg-[#f3f5fc]">
              <input type="file" className="sr-only" accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.md,.html,.htm" onChange={handleUpload} />
              <Image src="/user.png" alt="Resume profile illustration" width={88} height={88} className="h-20 w-20 object-contain transition group-hover:-translate-y-1" />
              <p className="mt-6 text-xl font-bold text-[#172044]">{isScanning ? "Scanning your resume..." : file ? file.name : "Upload your resume"}</p>
              <p className="mt-2 text-sm text-[#7b849b]">PDF, DOCX, DOC, TXT or any resume format</p>
              <span className="mt-6 rounded-full bg-[#e9edf9] px-5 py-2 text-sm font-semibold text-[#2948ac]">Browse files</span>
            </label>

            <div className="mt-7 text-left">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#7b849b]">Select role</span>
                <span className="text-xs font-medium text-[#a0a7b8]">Scroll to explore</span>
              </div>
              <div className="relative h-28 overflow-hidden [mask-image:linear-gradient(transparent,black_14%,black_86%,transparent)]">
                <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-10 -translate-y-1/2 rounded-xl border border-[#253fae]/20 bg-[#20369f]/[0.07] shadow-[0_6px_20px_rgba(32,54,159,0.1)]" />
                <div className="relative h-full snap-y snap-mandatory scroll-smooth overflow-y-auto overscroll-contain py-9 text-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {selectableRoles.map((item) => <button key={item.id} onClick={(event) => selectRole(item.id, event.currentTarget)} className={`relative z-20 block h-10 w-full snap-center rounded-xl px-4 text-center text-sm font-semibold transition-all duration-300 ${item.id === roleId ? "scale-105 text-[#20369f]" : "text-[#9aa1b4] hover:text-[#5b6786]"}`}>{item.label}{item.id === "other" && "  +"}</button>)}
                </div>
              </div>
              {roleId === "other" && <input autoFocus value={customRole} onChange={(event) => setCustomRole(event.target.value)} placeholder="Type your role" className="mt-3 w-full rounded-xl border border-[#cdd5ee] bg-white px-4 py-3 text-sm text-[#172044] outline-none ring-[#294dc5] placeholder:text-[#9aa1b4] focus:ring-2" />}
            </div>

            {analysisError && <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-left text-sm font-medium text-red-700">{analysisError}</p>}

            {file && !isScanning && <div className="mt-7 rounded-2xl bg-[#eef3ff] px-5 py-4 text-left"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold text-[#172044]">ATS score for {role.label}</p><p className="mt-1 text-xs text-[#68728d]">{geminiResult ? "Verified by Gemini against the selected role" : "Local preview score"}</p></div><p className="text-3xl font-black text-[#2445b5]">{geminiResult?.score ?? result.score}<span className="text-base text-[#8490ae]">/100</span></p></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-[#d7def5]"><div className="h-full rounded-full bg-[#294dc5] transition-all duration-500" style={{ width: `${geminiResult?.score ?? result.score}%` }} /></div>{geminiResult ? <><p className="mt-4 text-sm leading-6 text-[#4e5c7a]">{geminiResult.summary}</p><div className="mt-4 rounded-xl bg-white/75 p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2948ac]">Improve your resume</p><ul className="mt-2 space-y-2 text-sm leading-5 text-[#4e5c7a]">{geminiResult.improvements.map((item) => <li key={item} className="flex gap-2"><span className="text-[#2948ac]">•</span>{item}</li>)}</ul></div><button onClick={() => downloadResumePdf(geminiResult.improvedResume, role.label)} className="mt-4 w-full rounded-xl bg-[#20369f] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#20369f]/20 transition hover:bg-[#172b82]">Download improved resume PDF</button></> : <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-white px-3 py-1.5 font-semibold text-emerald-700">{result.matches.length} keywords matched</span><span className="rounded-full bg-white px-3 py-1.5 font-semibold text-amber-700">{result.missing.length} to improve</span></div>}</div>}
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-5 pb-5 text-center text-xs text-[#8992a8] md:px-10 md:pb-6">
        <p>All rights reserved 2026 · Designed and developed by <a className="font-semibold text-[#2948ac] transition hover:text-[#172b82] hover:underline" href="https://www.linkedin.com/in/devashishofficial/" target="_blank" rel="noreferrer">Devashish</a></p>
        <div className="mt-3 flex justify-center gap-2">
          <a aria-label="Instagram" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d9deec] bg-white/65 text-[#68728d] transition hover:-translate-y-0.5 hover:border-[#2948ac] hover:text-[#2948ac]" href="https://www.instagram.com/true.engineer/" target="_blank" rel="noreferrer">
            <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
          </a>
          <a aria-label="GitHub" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d9deec] bg-white/65 text-[#68728d] transition hover:-translate-y-0.5 hover:border-[#2948ac] hover:text-[#2948ac]" href="https://github.com/devashishgorai" target="_blank" rel="noreferrer">
            <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5a9.5 9.5 0 0 0-3 18.52c.48.09.65-.21.65-.46v-1.68c-2.65.58-3.21-1.12-3.21-1.12-.44-1.1-1.08-1.39-1.08-1.39-.86-.59.06-.58.06-.58.95.07 1.45.98 1.45.98.85 1.45 2.23 1.03 2.78.79.09-.62.33-1.03.6-1.27-2.12-.24-4.35-1.06-4.35-4.72 0-1.04.37-1.89.98-2.56-.1-.24-.42-1.21.09-2.52 0 0 .8-.26 2.62.98a9.2 9.2 0 0 1 4.77 0c1.82-1.24 2.62-.98 2.62-.98.51 1.31.19 2.28.09 2.52.61.67.98 1.52.98 2.56 0 3.67-2.23 4.48-4.36 4.71.34.3.64.87.64 1.76v2.6c0 .25.17.55.65.46A9.5 9.5 0 0 0 12 2.5Z" /></svg>
          </a>
          <a aria-label="LinkedIn" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d9deec] bg-white/65 text-[#68728d] transition hover:-translate-y-0.5 hover:border-[#2948ac] hover:text-[#2948ac]" href="https://www.linkedin.com/in/devashishofficial/" target="_blank" rel="noreferrer">
            <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M5.2 8.1H2.1V21h3.1V8.1ZM3.65 2.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6ZM21 13.6c0-3.9-2.08-5.72-4.86-5.72-2.24 0-3.24 1.23-3.8 2.09V8.1H9.23V21h3.11v-6.38c0-1.68.31-3.31 2.4-3.31 2.06 0 2.09 1.93 2.09 3.42V21H21v-7.4Z" /></svg>
          </a>
          <a aria-label="Twitter" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d9deec] bg-white/65 text-[#68728d] transition hover:-translate-y-0.5 hover:border-[#2948ac] hover:text-[#2948ac]" href="https://x.com/true_engineerr" target="_blank" rel="noreferrer">
            <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2.5h3.68l-8.04 9.19L24 21.5h-7.4l-5.8-7.58-6.63 7.58H.48l7.96-9.1L0 2.5h7.59l5.24 6.93 6.07-6.93Zm-1.3 17.03h2.04L6.48 4.38H4.29L17.6 19.53Z" /></svg>
          </a>
        </div>
      </footer>

    </main>
  );
}
