import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { Btn, Section } from "@/components/site/ui";
import { useAuth } from "@/lib/auth";
import { buildResumeMeta, classifyResume, extractTextFromResume } from "@/lib/resumeClassify";
import {
  createBlankStudentProfile,
  getStudentProfile,
  isOnboarded,
  markOnboarded,
  metadataFullName,
  saveStudentProfile,
} from "@/lib/studentProfile";

export const Route = createFileRoute("/onboard")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Complete your profile — Ashwood Collective" },
      { name: "description", content: "Add your name and resume so your dashboard, skills, and projects stay current." },
    ],
  }),
  component: OnboardPage,
});

function OnboardPage() {
  const { user, currentRole, loading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/onboard" });
  const redirectTarget = search.redirect && search.redirect !== "/onboard" ? search.redirect : "/dashboard";

  const existing = user ? getStudentProfile(user.id) : createBlankStudentProfile();
  const [fullName, setFullName] = useState(existing.fullName || metadataFullName(user) || "");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const isStudent = currentRole === "student";

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/onboard" }, replace: true });
      return;
    }
    if (isOnboarded(user.id)) {
      navigate({ to: redirectTarget as "/dashboard", replace: true });
    }
  }, [loading, user, navigate, redirectTarget]);

  useEffect(() => {
    if (!fullName) {
      const seeded = existing.fullName || metadataFullName(user);
      if (seeded) setFullName(seeded);
    }
  }, [user, existing.fullName, fullName]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const name = fullName.trim();
    if (!name) {
      toast.error("Please enter your name.");
      return;
    }
    if (isStudent && !resumeFile && !existing.resume) {
      toast.error("Please upload your resume so we can extract skills and projects.");
      return;
    }

    setBusy(true);
    try {
      await updateProfile({ full_name: name });

      if (isStudent) {
        let profile = {
          ...createBlankStudentProfile({
            ...existing,
            id: user.id,
            email: user.email || existing.email,
            fullName: name,
          }),
          fullName: name,
        };

        if (resumeFile) {
          setStatus("Reading resume…");
          const text = await extractTextFromResume(resumeFile);
          if (!text.trim()) {
            throw new Error("Could not read any text from that file. Try a text-based PDF.");
          }
          setStatus("Classifying skills and projects…");
          const classified = await classifyResume(text);
          const summary =
            classified.source === "ai"
              ? `Classified ${classified.skills.length} skills and ${classified.projects.length} projects from your resume.`
              : `Extracted ${classified.skills.length} skills and ${classified.projects.length} projects from your resume.`;
          profile = {
            ...profile,
            fullName: name,
            headline: classified.headline || profile.headline,
            github: classified.github || profile.github,
            linkedin: classified.linkedin || profile.linkedin,
            skills: classified.skills,
            projects: classified.projects,
            resume: buildResumeMeta(resumeFile, summary),
            bio: profile.bio || (classified.headline ? classified.headline : ""),
          };
        }

        saveStudentProfile(profile, user.id);
      }

      markOnboarded(user.id);
      toast.success(`Welcome, ${name}. Your dashboard is ready.`);
      navigate({ to: redirectTarget as "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not finish setup.");
    } finally {
      setBusy(false);
      setStatus("");
    }
  }

  return (
    <Section className="grid gap-10 py-12 md:grid-cols-12 md:py-20">
      <div className="md:col-span-5 space-y-4">
        <span className="eyebrow text-accent">After sign-in</span>
        <h1 className="text-4xl sm:text-5xl font-display leading-[1.1] text-foreground">
          {isStudent ? "Your name and resume." : "What should we call you?"}
        </h1>
        <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
          {isStudent
            ? "We read your resume, then classify skills and projects onto your student folio so the dashboard is actually yours."
            : "This name appears on your dashboard, messages, and college register profile."}
        </p>
      </div>

      <div className="md:col-span-6 md:col-start-7">
        <form onSubmit={submit} className="border border-rule bg-paper p-6 sm:p-8 space-y-5 shadow-sm">
          <div>
            <span className="eyebrow">Profile setup</span>
            <h2 className="mt-1 font-display text-2xl text-foreground">Complete your record</h2>
          </div>

          <label className="block">
            <span className="eyebrow">Your full name</span>
            <input
              className="field text-sm"
              required
              placeholder="e.g. Priya Mehta"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          </label>

          {isStudent && (
            <label className="block">
              <span className="eyebrow">Resume (PDF or TXT)</span>
              <div className="mt-1 flex items-center gap-3 border border-rule bg-background px-3 py-3">
                <Upload className="h-4 w-4 shrink-0 text-accent" />
                <input
                  className="min-w-0 flex-1 text-sm file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium"
                  type="file"
                  accept=".pdf,.txt,.md,application/pdf,text/plain"
                  required={!existing.resume}
                  onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                />
              </div>
              {resumeFile && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft">
                  <FileText className="h-3.5 w-3.5" />
                  {resumeFile.name}
                </p>
              )}
              <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                Skills and projects are classified from the document, then shown on your dashboard folio.
              </p>
            </label>
          )}

          {status && <p className="text-xs font-mono text-accent">{status}</p>}

          <Btn className="w-full" disabled={busy}>
            {busy ? status || "Saving…" : "Continue to dashboard"}
          </Btn>
        </form>
      </div>
    </Section>
  );
}
