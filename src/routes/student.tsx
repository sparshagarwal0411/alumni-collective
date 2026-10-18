import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHead, Section, SampleTag, Monogram } from "@/components/site/ui";
import {
  getStudentProfile,
  saveStudentProfile,
  type StudentProfileData,
  type Project,
} from "@/lib/studentProfile";
import { toast } from "sonner";
import { MicrotasksManager } from "@/components/microtasks/MicrotasksManager";
import {
  FileText,
  Upload,
  Download,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  Code2,
  BookOpen,
  Briefcase,
  Share2,
  Eye,
  Edit3,
  Calendar,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "Student Folio & Resume Dossier — Ashwood College" },
      {
        name: "description",
        content: "Undergraduate student folio showcasing verified projects, technical competencies, coursework, and uploaded resume for alumni recruiters and mentors.",
      },
    ],
  }),
  component: StudentProfilePage,
});

const SKILL_SUGGESTIONS = [
  "Rust",
  "C++20",
  "Go",
  "Python",
  "Distributed Systems",
  "Linux Kernels",
  "CUDA",
  "PostgreSQL",
  "Docker & K8s",
  "PyTorch",
  "TypeScript",
  "Design Systems",
  "High-Frequency Computing",
  "Compiler Design",
  "eBPF",
  "Raft Consensus",
];

export function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfileData>(getStudentProfile());
  const [activeView, setActiveView] = useState<"dossier" | "editor">("dossier");
  const [isSaving, setIsSaving] = useState(false);

  // New skill input state
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState<"Advanced" | "Proficient" | "Familiar">("Proficient");
  const [newSkillCategory, setNewSkillCategory] = useState<
    "Languages" | "Systems & Cloud" | "AI & ML" | "Frontend & Design" | "Tools & Theory"
  >("Systems & Cloud");

  // New project modal state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projTitle, setProjTitle] = useState("");
  const [projTagline, setProjTagline] = useState("");
  const [projDescription, setProjDescription] = useState("");
  const [projTechStr, setProjTechStr] = useState("");
  const [projGithub, setProjGithub] = useState("");
  const [projLive, setProjLive] = useState("");
  const [projImpact, setProjImpact] = useState("");

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(getStudentProfile());
    };
    window.addEventListener("student_profile_updated", handleUpdate);
    return () => window.removeEventListener("student_profile_updated", handleUpdate);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Calculate human readable size
    const sizeKb = Math.round(file.size / 1024);
    const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

    const updated: StudentProfileData = {
      ...profile,
      resume: {
        fileName: file.name,
        fileSize: sizeStr,
        fileType: file.type || "application/pdf",
        uploadedAt: new Date().toISOString(),
        summaryNote: `Official undergraduate curriculum vitae uploaded for academic year 2025–2026.`,
      },
    };

    setProfile(updated);
    saveStudentProfile(updated);
    toast.success(`Resume "${file.name}" successfully attached to your student folio.`);
  };

  const handleRemoveResume = () => {
    const updated: StudentProfileData = {
      ...profile,
      resume: null,
    };
    setProfile(updated);
    saveStudentProfile(updated);
    toast.info("Resume document removed from folio.");
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    if (profile.skills.some((s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      toast.error("This skill is already on your dossier.");
      return;
    }

    const updated: StudentProfileData = {
      ...profile,
      skills: [
        ...profile.skills,
        {
          name: newSkillName.trim(),
          level: newSkillLevel,
          category: newSkillCategory,
        },
      ],
    };

    setProfile(updated);
    saveStudentProfile(updated);
    setNewSkillName("");
    toast.success(`Skill "${newSkillName.trim()}" added to your dossier.`);
  };

  const handleRemoveSkill = (skillName: string) => {
    const updated: StudentProfileData = {
      ...profile,
      skills: profile.skills.filter((s) => s.name !== skillName),
    };
    setProfile(updated);
    saveStudentProfile(updated);
  };

  const handleQuickAddSkill = (skill: string) => {
    if (profile.skills.some((s) => s.name.toLowerCase() === skill.toLowerCase())) {
      toast.info("Skill already included.");
      return;
    }
    const updated: StudentProfileData = {
      ...profile,
      skills: [
        ...profile.skills,
        {
          name: skill,
          level: "Proficient",
          category: "Systems & Cloud",
        },
      ],
    };
    setProfile(updated);
    saveStudentProfile(updated);
    toast.success(`Added ${skill}`);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: projTitle.trim(),
      tagline: projTagline.trim() || "Technical artifact developed at Ashwood",
      description: projDescription.trim(),
      technologies: projTechStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      githubUrl: projGithub.trim() || undefined,
      liveUrl: projLive.trim() || undefined,
      impactMetrics: projImpact.trim() || undefined,
      featured: true,
    };

    const updated: StudentProfileData = {
      ...profile,
      projects: [newProj, ...profile.projects],
    };

    setProfile(updated);
    saveStudentProfile(updated);
    setIsProjectModalOpen(false);

    // Reset modal form
    setProjTitle("");
    setProjTagline("");
    setProjDescription("");
    setProjTechStr("");
    setProjGithub("");
    setProjLive("");
    setProjImpact("");

    toast.success(`Project "${newProj.title}" added to your portfolio showcase.`);
  };

  const handleRemoveProject = (projId: string) => {
    const updated: StudentProfileData = {
      ...profile,
      projects: profile.projects.filter((p) => p.id !== projId),
    };
    setProfile(updated);
    saveStudentProfile(updated);
    toast.info("Project removed from portfolio.");
  };

  const handleSaveProfileDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      saveStudentProfile(profile);
      setIsSaving(false);
      toast.success("Student dossier saved and synchronized with the college register.");
      setActiveView("dossier");
    }, 400);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Public student dossier link copied to clipboard.");
    }
  };

  return (
    <>
      {/* <PageHead
        index="IX."
        eyebrow="Student Registry · Folio"
        title="Student dossier & credentials."
        lede="Curate your resume, technical competencies, and flagship projects so Ashwood alumni recruiters and mentors can review your capability at a glance."
      /> */}

      <Section>
        {/* Top View Toggle & Folio Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-foreground py-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="eyebrow mr-1">Folio Mode:</span>
            <button
              type="button"
              onClick={() => setActiveView("dossier")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 transition-colors ${activeView === "dossier"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "border border-rule hover:border-foreground"
                }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Public Dossier (Alumnus View)
            </button>
            <button
              type="button"
              onClick={() => setActiveView("editor")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 transition-colors ${activeView === "editor"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "border border-rule hover:border-foreground"
                }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Dossier & Resume
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 border border-rule bg-paper px-3 py-1.5 hover:border-foreground transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share Dossier Link
            </button>
            {profile.resume && (
              <a
                href="#resume-record"
                className="inline-flex items-center gap-1.5 bg-accent px-3 py-1.5 text-accent-foreground hover:bg-primary transition-colors font-medium"
              >
                <Download className="h-3.5 w-3.5" />
                Resume Attached
              </a>
            )}
          </div>
        </div>

        {/* =========================================================================
            VIEW 1: PUBLIC DOSSIER (WHAT ALUMNI SEE)
           ========================================================================= */}
        {activeView === "dossier" && (
          <div className="mt-10 space-y-16">
            {/* Header Hero Card */}
            <div className="border border-rule bg-paper p-8 md:p-12 shadow-xs">
              <div className="grid gap-8 md:grid-cols-12 md:items-start">
                <div className="md:col-span-8 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="border border-accent/40 bg-background px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-accent font-semibold">
                      Enrolled Student
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      Class of {profile.gradYear} · {profile.department}
                    </span>
                    <SampleTag show={false} />
                  </div>

                  <h2 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight">
                    {profile.fullName}
                  </h2>

                  <p className="font-sans text-xl text-foreground/90 font-medium leading-relaxed">
                    {profile.headline}
                  </p>

                  <p className="text-sm leading-relaxed text-ink-soft max-w-2xl font-serif">
                    {profile.bio}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-muted-foreground font-mono">
                    <span>📍 {profile.city}</span>
                    {profile.gpa && <span>🎓 {profile.gpa}</span>}
                    <span>✉️ {profile.email}</span>
                  </div>

                  {/* Links */}
                  <div className="flex flex-wrap items-center gap-3 pt-3">
                    {profile.github && (
                      <a
                        href={profile.github}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 border border-rule bg-background px-3 py-1.5 text-xs text-foreground hover:border-accent hover:text-accent transition-colors"
                      >
                        <Github className="h-3.5 w-3.5" />
                        GitHub
                      </a>
                    )}
                    {profile.linkedin && (
                      <a
                        href={profile.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 border border-rule bg-background px-3 py-1.5 text-xs text-foreground hover:border-accent hover:text-accent transition-colors"
                      >
                        <Linkedin className="h-3.5 w-3.5" />
                        LinkedIn
                      </a>
                    )}
                    {profile.portfolioUrl && (
                      <a
                        href={profile.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 border border-rule bg-background px-3 py-1.5 text-xs text-foreground hover:border-accent hover:text-accent transition-colors"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Personal Site
                      </a>
                    )}
                  </div>
                </div>

                {/* Right: Alumnus Quick Connect & Seeking Banner */}
                <div className="md:col-span-4 space-y-6">
                  {profile.avatarUrl ? (
                    <div className="relative aspect-square w-36 md:w-44 overflow-hidden rounded-sm border border-rule bg-background shadow-xs">
                      <img
                        src={profile.avatarUrl}
                        alt={profile.fullName}
                        className="h-full w-full object-cover object-top grayscale hover:grayscale-0 transition-all duration-300"
                      />
                    </div>
                  ) : (
                    <Monogram name={profile.fullName} size="lg" />
                  )}

                  <div className="border border-rule bg-background p-5 space-y-3">
                    <span className="eyebrow block">Actively Seeking</span>
                    <ul className="space-y-1.5 font-mono text-xs text-foreground">
                      {profile.seeking.internship && (
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                          <span>Summer 2026 Internships</span>
                        </li>
                      )}
                      {profile.seeking.fullTime && (
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                          <span>Full-Time Graduate Roles</span>
                        </li>
                      )}
                      {profile.seeking.researchFellowship && (
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                          <span>Research Fellowships / Labs</span>
                        </li>
                      )}
                      {profile.seeking.referrals && (
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                          <span>Alumni Referrals & Advice</span>
                        </li>
                      )}
                    </ul>

                    <div className="pt-2 border-t border-rule">
                      <Link
                        to="/jobs"
                        className="block w-full text-center bg-primary py-2.5 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors"
                      >
                        View Matching Alumni Roles →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Archival Section */}
            <div id="resume-record" className="border border-rule bg-paper p-6 md:p-8">
              <div className="flex flex-wrap items-baseline justify-between border-b border-rule pb-3 mb-6">
                <div>
                  <span className="eyebrow">Archival Document</span>
                  <h3 className="font-display text-2xl text-foreground mt-1">Official Student Resume</h3>
                </div>
                <span className="font-mono text-xs text-muted-foreground">Verified Student Record</span>
              </div>

              {profile.resume ? (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-rule bg-background p-6 shadow-xs">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-accent/10 text-accent">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-display text-xl text-foreground font-semibold">
                        {profile.resume.fileName}
                      </h4>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {profile.resume.fileSize} · Uploaded{" "}
                        {new Date(profile.resume.uploadedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      {profile.resume.summaryNote && (
                        <p className="mt-2 text-xs text-ink-soft italic">
                          "{profile.resume.summaryNote}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        toast.success(`Opening ${profile.resume?.fileName}...`);
                      }}
                      className="inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors font-medium"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download Resume
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView("editor")}
                      className="border border-rule px-4 py-2.5 text-xs uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground"
                    >
                      Replace File
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-rule p-8 text-center space-y-3">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-ink-soft">
                    No resume document has been uploaded yet. Upload your PDF so alumni recruiters can download it.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveView("editor")}
                    className="inline-flex items-center gap-1.5 bg-primary px-4 py-2 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload Resume Now
                  </button>
                </div>
              )}
            </div>

            {/* Technical Competencies Matrix */}
            <div className="space-y-6">
              <div className="flex items-baseline justify-between border-b border-rule pb-3">
                <div>
                  <span className="eyebrow">Skills & Capabilities</span>
                  <h3 className="font-display text-3xl text-foreground mt-1">
                    Verified Competencies
                  </h3>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {profile.skills.length} Registered Areas
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {["Languages", "Systems & Cloud", "AI & ML", "Tools & Theory"].map((cat) => {
                  const catSkills = profile.skills.filter((s) => s.category === cat);
                  if (catSkills.length === 0) return null;

                  return (
                    <div key={cat} className="border border-rule bg-paper p-5 space-y-3">
                      <span className="eyebrow block text-accent border-b border-rule pb-1.5">
                        {cat}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {catSkills.map((skill) => (
                          <div
                            key={skill.name}
                            className="inline-flex items-center gap-2 border border-rule bg-background px-3 py-1 text-xs"
                          >
                            <span className="font-medium text-foreground">{skill.name}</span>
                            <span
                              className={`font-mono text-[9px] uppercase px-1 py-0.2 rounded-xs ${skill.level === "Advanced"
                                  ? "bg-accent/15 text-accent font-semibold"
                                  : skill.level === "Proficient"
                                    ? "bg-muted text-muted-foreground"
                                    : "text-ink-soft"
                                }`}
                            >
                              {skill.level}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Flagship Projects Portfolio */}
            <div className="space-y-6">
              <div className="flex items-baseline justify-between border-b border-rule pb-3">
                <div>
                  <span className="eyebrow">Portfolio Showcase</span>
                  <h3 className="font-display text-3xl text-foreground mt-1">
                    Flagship Projects & Systems
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(true)}
                  className="inline-flex items-center gap-1.5 border border-rule bg-paper px-3 py-1.5 font-mono text-xs hover:border-foreground transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Project
                </button>
              </div>

              <div className="space-y-6">
                {profile.projects.map((proj) => (
                  <article
                    key={proj.id}
                    className="border border-rule bg-paper p-6 md:p-8 space-y-4 hover:border-foreground/50 transition-colors shadow-xs"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-display text-2xl font-bold text-foreground">
                            {proj.title}
                          </h4>
                          {proj.featured && (
                            <span className="border border-accent/40 bg-accent/5 px-2 py-0.5 font-mono text-[10px] uppercase text-accent font-semibold">
                              Featured Artifact
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-sans text-sm text-ink-soft font-medium">
                          {proj.tagline}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 border border-rule bg-background px-3 py-1.5 text-xs text-foreground hover:border-accent hover:text-accent transition-colors"
                          >
                            <Github className="h-3.5 w-3.5" />
                            Repository
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-accent transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Live Demo
                          </a>
                        )}
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-ink-soft font-serif">
                      {proj.description}
                    </p>

                    {proj.impactMetrics && (
                      <div className="border-l-2 border-accent pl-3 py-1 font-mono text-xs text-accent bg-accent/5">
                        <strong>Performance & Verification:</strong> {proj.impactMetrics}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-rule">
                      {proj.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="border border-rule bg-background px-2.5 py-0.5 font-mono text-xs text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Academic Rigour & Coursework */}
            <div className="grid gap-8 md:grid-cols-2">
              <div className="border border-rule bg-paper p-6 space-y-4">
                <span className="eyebrow block">Honours Research Focus</span>
                <h4 className="font-display text-2xl text-foreground font-semibold">
                  {profile.researchThesis || "Undergraduate Thesis"}
                </h4>
                <p className="text-sm text-ink-soft leading-relaxed font-serif">
                  Conducted under faculty supervision at the Ashwood Parallel Computing and
                  Distributed Systems Group. Includes empirical benchmarks and reproducibility artifacts.
                </p>
              </div>

              <div className="border border-rule bg-paper p-6 space-y-4">
                <span className="eyebrow block">Rigorous Academic Coursework</span>
                <ul className="space-y-1.5 font-mono text-xs text-foreground divide-y divide-rule">
                  {profile.coursework.map((course) => (
                    <li key={course} className="pt-1.5 first:pt-0">
                      {course}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Microtasks & Proof-of-Work Deliverables Section */}
            <div className="border-t border-rule pt-10">
              <MicrotasksManager
                title="Microtask Work & Proof-of-Work Deliverables"
                description="Ashwood verified microtasks. Claim tasks from alumni and faculty, and upload your work via Google Drive link or direct file upload to earn binary credibility points (1 point per verified deliverable)."
                rolePerspective="student"
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: EDIT DOSSIER & RESUME (STUDENT CMS)
           ========================================================================= */}
        {activeView === "editor" && (
          <div className="mt-10 space-y-12">
            {/* 1. Resume Document Management */}
            <div className="border border-rule bg-card p-6 md:p-8 space-y-6">
              <div className="border-b border-rule pb-3">
                <span className="eyebrow">Document Upload</span>
                <h3 className="font-display text-2xl text-foreground mt-1">Upload Your Resume / CV</h3>
                <p className="text-sm text-ink-soft mt-1">
                  Attach your official PDF resume. Alumni will be able to download and review your CV
                  when evaluating referrals and mentorship applications.
                </p>
              </div>

              {profile.resume && (
                <div className="flex items-center justify-between border border-rule bg-paper p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-accent" />
                    <div>
                      <p className="font-medium text-foreground">{profile.resume.fileName}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {profile.resume.fileSize} · Uploaded on{" "}
                        {new Date(profile.resume.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveResume}
                    className="text-xs text-destructive hover:underline font-mono"
                  >
                    Remove File
                  </button>
                </div>
              )}

              <div className="border-2 border-dashed border-rule p-8 text-center hover:border-accent transition-colors bg-background">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <label className="cursor-pointer">
                  <span className="bg-primary px-4 py-2 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors inline-block">
                    Select PDF / Word Document
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="mt-2 text-xs text-muted-foreground">
                  Supported formats: PDF, DOCX (Max 10MB)
                </p>
              </div>
            </div>

            {/* 2. Skills & Competencies Manager */}
            <div className="border border-rule bg-card p-6 md:p-8 space-y-6">
              <div className="border-b border-rule pb-3">
                <span className="eyebrow">Technical Competencies</span>
                <h3 className="font-display text-2xl text-foreground mt-1">Skills & Capabilities</h3>
                <p className="text-sm text-ink-soft mt-1">
                  List your technical strengths. These skills automatically power the Skill Matcher
                  on job postings across the site.
                </p>
              </div>

              {/* Form to add a skill */}
              <form onSubmit={handleAddSkill} className="grid gap-4 md:grid-cols-12 md:items-end">
                <div className="md:col-span-5">
                  <label className="eyebrow block mb-1">Skill Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rust, PyTorch, Linux Kernels, Distributed Systems"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="eyebrow block mb-1">Category</label>
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value as any)}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  >
                    <option value="Languages">Languages</option>
                    <option value="Systems & Cloud">Systems & Cloud</option>
                    <option value="AI & ML">AI & ML</option>
                    <option value="Frontend & Design">Frontend & Design</option>
                    <option value="Tools & Theory">Tools & Theory</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="eyebrow block mb-1">Proficiency</label>
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value as any)}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  >
                    <option value="Advanced">Advanced</option>
                    <option value="Proficient">Proficient</option>
                    <option value="Familiar">Familiar</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full bg-primary py-3 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors"
                  >
                    + Add Skill
                  </button>
                </div>
              </form>

              {/* Quick Suggestions */}
              <div>
                <span className="font-mono text-xs text-muted-foreground block mb-2">
                  Quick Add Common Systems & Tech Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SKILL_SUGGESTIONS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleQuickAddSkill(skill)}
                      className="border border-rule bg-paper px-2.5 py-1 text-xs text-ink-soft hover:border-foreground hover:text-foreground transition-colors"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Skills Chips */}
              <div className="border-t border-rule pt-4">
                <span className="eyebrow block mb-3">
                  Currently on your dossier ({profile.skills.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="inline-flex items-center gap-2 border border-rule bg-background px-3 py-1 text-xs"
                    >
                      <span className="font-medium text-foreground">{skill.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        ({skill.level})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill.name)}
                        className="text-muted-foreground hover:text-destructive"
                        title="Remove skill"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Flagship Projects Manager */}
            <div className="border border-rule bg-card p-6 md:p-8 space-y-6">
              <div className="flex items-baseline justify-between border-b border-rule pb-3">
                <div>
                  <span className="eyebrow">Projects & Code</span>
                  <h3 className="font-display text-2xl text-foreground mt-1">Portfolio Showcase</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(true)}
                  className="bg-primary px-4 py-2 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors"
                >
                  + Add Project
                </button>
              </div>

              <div className="space-y-4">
                {profile.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="flex items-start justify-between border border-rule bg-paper p-5"
                  >
                    <div className="space-y-1">
                      <h4 className="font-display text-xl font-bold text-foreground">
                        {proj.title}
                      </h4>
                      <p className="text-xs text-ink-soft">{proj.tagline}</p>
                      <div className="flex flex-wrap gap-1 pt-1 font-mono text-[11px] text-muted-foreground">
                        {proj.technologies.join(" · ")}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(proj.id)}
                      className="p-1 text-muted-foreground hover:text-destructive"
                      title="Delete project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Core Identification & Bio Form */}
            <form onSubmit={handleSaveProfileDetails} className="border border-rule bg-card p-6 md:p-8 space-y-8">
              <div className="border-b border-rule pb-3">
                <span className="eyebrow">Institutional Identity</span>
                <h3 className="font-display text-2xl text-foreground mt-1">Bio & Aspirations</h3>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="eyebrow block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="eyebrow block mb-1">Expected Graduation Year</label>
                  <input
                    type="number"
                    required
                    value={profile.gradYear}
                    onChange={(e) => setProfile({ ...profile, gradYear: parseInt(e.target.value, 10) || 2026 })}
                    className="w-full border border-rule bg-paper p-3 text-sm font-mono focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="eyebrow block mb-1">Academic Department</label>
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="eyebrow block mb-1">Degree Program</label>
                  <input
                    type="text"
                    value={profile.degree}
                    onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="eyebrow block mb-1">Headline / Target Specialty</label>
                <input
                  type="text"
                  value={profile.headline}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  placeholder="e.g. Junior CS Undergraduate · Distributed Systems & GPU Scheduling"
                  className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="eyebrow block mb-1">Biographical Statement & Focus</label>
                <textarea
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none leading-relaxed font-sans"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className="eyebrow block mb-1">GitHub Profile URL</label>
                  <input
                    type="url"
                    value={profile.github || ""}
                    onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="eyebrow block mb-1">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={profile.linkedin || ""}
                    onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="eyebrow block mb-1">Personal Portfolio URL</label>
                  <input
                    type="url"
                    value={profile.portfolioUrl || ""}
                    onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setActiveView("dossier")}
                  className="border border-rule px-5 py-2.5 text-xs uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary px-8 py-2.5 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors disabled:opacity-50 font-semibold"
                >
                  {isSaving ? "Saving Records…" : "Save & Publish Dossier"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal for Adding New Project */}
        {isProjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-xl border border-rule bg-background p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between border-b border-rule pb-3 mb-5">
                <div>
                  <span className="eyebrow">Portfolio Entry</span>
                  <h3 className="font-display text-2xl text-foreground mt-0.5">
                    Add Technical Project
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-sm font-mono"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="space-y-4">
                <div>
                  <label className="eyebrow block mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vesper: Raft Distributed KV Store"
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="eyebrow block mb-1">Tagline / One-Liner</label>
                  <input
                    type="text"
                    placeholder="e.g. Zero-dependency consensus-backed storage cluster in Rust"
                    value={projTagline}
                    onChange={(e) => setProjTagline(e.target.value)}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="eyebrow block mb-1">Architecture & Technical Overview</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe the problem, architectural design, consensus model, and challenges overcome..."
                    value={projDescription}
                    onChange={(e) => setProjDescription(e.target.value)}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none font-sans leading-relaxed"
                  />
                </div>

                <div>
                  <label className="eyebrow block mb-1">Technologies Used (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Rust, Tokio, gRPC, Protobuf, eBPF"
                    value={projTechStr}
                    onChange={(e) => setProjTechStr(e.target.value)}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="eyebrow block mb-1">GitHub / Code Repo URL</label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={projGithub}
                      onChange={(e) => setProjGithub(e.target.value)}
                      className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="eyebrow block mb-1">Live Demo URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={projLive}
                      onChange={(e) => setProjLive(e.target.value)}
                      className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="eyebrow block mb-1">Impact Metric or Benchmarks (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Handles 54,000 req/sec with < 4.2ms p99 write latency"
                    value={projImpact}
                    onChange={(e) => setProjImpact(e.target.value)}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-rule">
                  <button
                    type="button"
                    onClick={() => setIsProjectModalOpen(false)}
                    className="border border-rule px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary px-6 py-2 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors font-medium"
                  >
                    Save Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
