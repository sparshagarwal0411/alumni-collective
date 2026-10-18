import type { Project, SkillCategory, SkillLevel, StudentProfileData, StudentResume } from "@/lib/studentProfile";

export interface ClassifiedResume {
  fullName?: string;
  headline?: string;
  github?: string;
  linkedin?: string;
  skills: StudentProfileData["skills"];
  projects: Project[];
  source: "ai" | "local";
}

const SKILL_CATALOG: { name: string; category: SkillCategory; aliases?: string[] }[] = [
  { name: "Python", category: "Languages" },
  { name: "JavaScript", category: "Languages", aliases: ["js"] },
  { name: "TypeScript", category: "Languages", aliases: ["ts"] },
  { name: "Java", category: "Languages" },
  { name: "C++", category: "Languages", aliases: ["c++20", "cpp"] },
  { name: "C", category: "Languages" },
  { name: "C#", category: "Languages", aliases: ["csharp"] },
  { name: "Go", category: "Languages", aliases: ["golang"] },
  { name: "Rust", category: "Languages" },
  { name: "Kotlin", category: "Languages" },
  { name: "Swift", category: "Languages" },
  { name: "Ruby", category: "Languages" },
  { name: "PHP", category: "Languages" },
  { name: "R", category: "Languages" },
  { name: "Scala", category: "Languages" },
  { name: "SQL", category: "Languages" },
  { name: "HTML", category: "Frontend & Design" },
  { name: "CSS", category: "Frontend & Design" },
  { name: "React", category: "Frontend & Design" },
  { name: "Next.js", category: "Frontend & Design", aliases: ["nextjs"] },
  { name: "Vue", category: "Frontend & Design" },
  { name: "Angular", category: "Frontend & Design" },
  { name: "Tailwind CSS", category: "Frontend & Design", aliases: ["tailwind"] },
  { name: "Figma", category: "Frontend & Design" },
  { name: "Node.js", category: "Systems & Cloud", aliases: ["node", "nodejs"] },
  { name: "Express", category: "Systems & Cloud" },
  { name: "Django", category: "Systems & Cloud" },
  { name: "Flask", category: "Systems & Cloud" },
  { name: "FastAPI", category: "Systems & Cloud" },
  { name: "Spring Boot", category: "Systems & Cloud", aliases: ["spring"] },
  { name: "PostgreSQL", category: "Systems & Cloud", aliases: ["postgres"] },
  { name: "MySQL", category: "Systems & Cloud" },
  { name: "MongoDB", category: "Systems & Cloud" },
  { name: "Redis", category: "Systems & Cloud" },
  { name: "Docker", category: "Systems & Cloud" },
  { name: "Kubernetes", category: "Systems & Cloud", aliases: ["k8s"] },
  { name: "AWS", category: "Systems & Cloud" },
  { name: "GCP", category: "Systems & Cloud", aliases: ["google cloud"] },
  { name: "Azure", category: "Systems & Cloud" },
  { name: "Linux", category: "Systems & Cloud" },
  { name: "Git", category: "Tools & Theory" },
  { name: "GraphQL", category: "Systems & Cloud" },
  { name: "gRPC", category: "Systems & Cloud" },
  { name: "Distributed Systems", category: "Systems & Cloud" },
  { name: "CUDA", category: "Systems & Cloud" },
  { name: "TensorFlow", category: "AI & ML" },
  { name: "PyTorch", category: "AI & ML" },
  { name: "Machine Learning", category: "AI & ML", aliases: ["ml"] },
  { name: "Deep Learning", category: "AI & ML" },
  { name: "NLP", category: "AI & ML", aliases: ["natural language processing"] },
  { name: "Computer Vision", category: "AI & ML" },
  { name: "Scikit-learn", category: "AI & ML", aliases: ["sklearn"] },
  { name: "Pandas", category: "AI & ML" },
  { name: "NumPy", category: "AI & ML" },
  { name: "OpenCV", category: "AI & ML" },
  { name: "LLMs", category: "AI & ML", aliases: ["large language models"] },
  { name: "Data Structures", category: "Tools & Theory", aliases: ["dsa"] },
  { name: "Algorithms", category: "Tools & Theory" },
  { name: "System Design", category: "Tools & Theory" },
  { name: "Compilers", category: "Tools & Theory" },
];

const HEADER_RE =
  /^(education|experience|work experience|employment|projects|academic projects|personal projects|selected projects|skills|technical skills|technical skillset|technologies|tech stack|certifications|achievements|awards|publications|research|summary|objective|profile|contact|links|coursework|internships)$/i;

export async function extractTextFromResume(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) {
    return file.text();
  }
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    return extractPdfText(file);
  }
  throw new Error("Please upload a PDF or TXT resume.");
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (line) pages.push(line);
  }
  return pages.join("\n");
}

export async function classifyResume(text: string): Promise<ClassifiedResume> {
  const cleaned = text.replace(/\u0000/g, " ").replace(/[ \t]+/g, " ").trim();
  if (!cleaned) {
    return { skills: [], projects: [], source: "local" };
  }

  const local = classifyLocally(cleaned);
  const ai = await classifyWithAi(cleaned);
  if (!ai) return { ...local, source: "local" };

  return {
    fullName: ai.fullName || local.fullName,
    headline: ai.headline || local.headline,
    github: ai.github || local.github,
    linkedin: ai.linkedin || local.linkedin,
    skills: ai.skills.length ? mergeSkills(ai.skills, local.skills) : local.skills,
    projects: ai.projects.length ? ai.projects : local.projects,
    source: "ai",
  };
}

export function formatFileSize(bytes: number): string {
  const kb = Math.round(bytes / 1024);
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

export function buildResumeMeta(file: File, summary?: string): StudentResume {
  return {
    fileName: file.name,
    fileSize: formatFileSize(file.size),
    fileType: file.type || "application/pdf",
    uploadedAt: new Date().toISOString(),
    summaryNote: summary,
  };
}

function classifyLocally(text: string): ClassifiedResume {
  const skills = detectSkills(text);
  const projects = extractProjects(text);
  const github = text.match(/https?:\/\/(?:www\.)?github\.com\/[A-Za-z0-9_.-]+/i)?.[0];
  const linkedin = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+/i)?.[0];
  const firstLine = text.split("\n").map((l) => l.trim()).find(Boolean) || "";
  const fullName = looksLikeName(firstLine) ? firstLine.slice(0, 80) : undefined;
  const headline = inferHeadline(skills);

  return { fullName, headline, github, linkedin, skills, projects, source: "local" };
}

function detectSkills(text: string): StudentProfileData["skills"] {
  const haystack = ` ${text.toLowerCase()} `;
  const found: StudentProfileData["skills"] = [];
  for (const skill of SKILL_CATALOG) {
    const needles = [skill.name, ...(skill.aliases ?? [])];
    const hit = needles.some((needle) => {
      const n = needle.toLowerCase();
      if (n.length <= 2) return new RegExp(`(?:^|[^a-z])${escapeReg(n)}(?:[^a-z]|$)`, "i").test(haystack);
      return haystack.includes(` ${n} `) || haystack.includes(` ${n},`) || haystack.includes(` ${n}.`);
    });
    if (hit) {
      found.push({ name: skill.name, level: inferLevel(text, skill.name), category: skill.category });
    }
  }
  return found.slice(0, 18);
}

function extractProjects(text: string): Project[] {
  const section = extractSection(text, ["projects", "academic projects", "personal projects", "selected projects"]);
  const source = section || extractSection(text, ["experience", "work experience", "internships"]);
  if (!source) return [];

  const chunks = source
    .split(/\n+|(?:^|\s)[•●▪‣*-]\s+/m)
    .map((c) => c.replace(/\s+/g, " ").trim())
    .filter((c) => c.length > 24 && !HEADER_RE.test(c));

  const projects: Project[] = [];
  for (const chunk of chunks.slice(0, 8)) {
    const title = chunk.split(/[.|:—-]/)[0]?.trim().slice(0, 90) || "Project";
    if (projects.some((p) => p.title.toLowerCase() === title.toLowerCase())) continue;
    const technologies = detectSkills(chunk).map((s) => s.name);
    projects.push({
      id: `p-${slug(title)}-${projects.length}`,
      title,
      tagline: chunk.slice(0, 140),
      description: chunk.slice(0, 600),
      technologies,
      featured: projects.length < 2,
    });
  }
  return projects.slice(0, 6);
}

function extractSection(text: string, headers: string[]): string {
  const lines = text.split(/\n|(?<=\.)\s+(?=[A-Z][A-Za-z ]{3,40}:)/);
  const normalized = lines.map((l) => l.trim()).filter(Boolean);
  const headerSet = new Set(headers.map((h) => h.toLowerCase()));
  let capturing = false;
  const body: string[] = [];
  for (const line of normalized) {
    const compact = line.replace(/:$/, "").toLowerCase();
    if (headerSet.has(compact) || headers.some((h) => compact.startsWith(h))) {
      capturing = true;
      continue;
    }
    if (capturing && HEADER_RE.test(compact.replace(/:$/, ""))) break;
    if (capturing) body.push(line);
  }
  return body.join("\n");
}

async function classifyWithAi(text: string): Promise<ClassifiedResume | null> {
  if (typeof window === "undefined") return null;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 18000);
  try {
    const response = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "openai",
        messages: [
          {
            role: "system",
            content:
              "You extract structured data from student resumes. Reply with JSON only, no markdown. Shape: {\"fullName\":string,\"headline\":string,\"github\":string,\"linkedin\":string,\"skills\":[{\"name\":string,\"level\":\"Advanced\"|\"Proficient\"|\"Familiar\",\"category\":\"Languages\"|\"Systems & Cloud\"|\"AI & ML\"|\"Frontend & Design\"|\"Tools & Theory\"}],\"projects\":[{\"title\":string,\"tagline\":string,\"description\":string,\"technologies\":string[]}]}",
          },
          { role: "user", content: text.slice(0, 12000) },
        ],
        temperature: 0.1,
      }),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(extractJson(content)) as Partial<ClassifiedResume>;
    return normalizeAi(parsed);
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

function normalizeAi(parsed: Partial<ClassifiedResume>): ClassifiedResume {
  const allowedCats: SkillCategory[] = [
    "Languages",
    "Systems & Cloud",
    "AI & ML",
    "Frontend & Design",
    "Tools & Theory",
  ];
  const allowedLevels: SkillLevel[] = ["Advanced", "Proficient", "Familiar"];
  const skills = (parsed.skills ?? [])
    .filter((s) => s && typeof s.name === "string" && s.name.trim())
    .map((s) => ({
      name: s.name.trim(),
      level: allowedLevels.includes(s.level) ? s.level : "Proficient",
      category: allowedCats.includes(s.category) ? s.category : categorizeSkill(s.name),
    }))
    .slice(0, 20);

  const projects = (parsed.projects ?? [])
    .filter((p) => p && typeof p.title === "string" && p.title.trim())
    .map((p, idx) => ({
      id: `p-${slug(p.title)}-${idx}`,
      title: p.title.trim().slice(0, 120),
      tagline: (p.tagline || p.description || "").slice(0, 160),
      description: (p.description || p.tagline || "").slice(0, 800),
      technologies: Array.isArray(p.technologies) ? p.technologies.slice(0, 10) : [],
      featured: idx < 2,
    }))
    .slice(0, 8);

  return {
    fullName: typeof parsed.fullName === "string" ? parsed.fullName.trim() : undefined,
    headline: typeof parsed.headline === "string" ? parsed.headline.trim() : undefined,
    github: typeof parsed.github === "string" ? parsed.github.trim() : undefined,
    linkedin: typeof parsed.linkedin === "string" ? parsed.linkedin.trim() : undefined,
    skills,
    projects,
    source: "ai",
  };
}

function mergeSkills(
  primary: StudentProfileData["skills"],
  extra: StudentProfileData["skills"],
): StudentProfileData["skills"] {
  const seen = new Set(primary.map((s) => s.name.toLowerCase()));
  const merged = [...primary];
  for (const skill of extra) {
    if (seen.has(skill.name.toLowerCase())) continue;
    seen.add(skill.name.toLowerCase());
    merged.push(skill);
  }
  return merged.slice(0, 20);
}

function categorizeSkill(name: string): SkillCategory {
  const hit = SKILL_CATALOG.find((s) => s.name.toLowerCase() === name.toLowerCase());
  return hit?.category ?? "Tools & Theory";
}

function inferLevel(text: string, skill: string): SkillLevel {
  const lower = text.toLowerCase();
  const name = skill.toLowerCase();
  if (lower.includes(`advanced ${name}`) || lower.includes(`${name} (advanced)`)) return "Advanced";
  if (lower.includes(`familiar ${name}`) || lower.includes(`${name} (familiar)`)) return "Familiar";
  return "Proficient";
}

function inferHeadline(skills: StudentProfileData["skills"]): string | undefined {
  if (!skills.length) return undefined;
  const top = skills.slice(0, 3).map((s) => s.name).join(", ");
  return `Student · ${top}`;
}

function looksLikeName(value: string) {
  if (value.length < 4 || value.length > 60) return false;
  if (/@|http|curriculum|resume|university|college/i.test(value)) return false;
  const words = value.split(/\s+/);
  return words.length >= 2 && words.length <= 5 && words.every((w) => /^[A-Za-z.'-]+$/.test(w));
}

function extractJson(raw: string) {
  const fenced = raw.match(/\{[\s\S]*\}/);
  return fenced ? fenced[0] : raw;
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32) || "project";
}

function escapeReg(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
