import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/lib/auth";
import { needsOnboarding } from "@/lib/studentProfile";
import { Btn, Section } from "@/components/site/ui";
import { GraduationCap, Landmark, Briefcase, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string; intent?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    intent: typeof search.intent === "string" ? search.intent : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in & Join the Register — Ashwood Collective" },
      { name: "description", content: "Sign in with Google, GitHub, or email as a Student, Faculty member, or Alumnus." },
    ],
  }),
  component: AuthPage,
});

const ROLES: { id: AppRole; title: string; subtitle: string; icon: typeof GraduationCap; color: string }[] = [
  {
    id: "student",
    title: "Student",
    subtitle: "Active student seeking career guidance, mentorship, & microtasks",
    icon: GraduationCap,
    color: "var(--accent)",
  },
  {
    id: "faculty",
    title: "Faculty",
    subtitle: "Academic mentor, lab leader, department instructor, or advisor",
    icon: Landmark,
    color: "#2563eb",
  },
  {
    id: "alumni",
    title: "Alum",
    subtitle: "Graduated alumnus, industry practitioner, hiring referrer, or donor",
    icon: Briefcase,
    color: "#059669",
  },
];

function AuthPage() {
  const { user, currentRole, signInWithOAuth, signInAsDemo } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const redirectTarget = search.redirect || "/dashboard";

  const [selectedRole, setSelectedRole] = useState<AppRole>("student");
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; m: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    if (needsOnboarding(user, currentRole)) {
      navigate({ to: "/onboard", search: { redirect: redirectTarget }, replace: true });
      return;
    }
    navigate({ to: redirectTarget as "/dashboard", replace: true } as never);
  }, [user, currentRole, navigate, redirectTarget]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) {
          setMsg({ t: "err", m: error.message });
        } else {
          toast.success(`Welcome back! Signed in as ${selectedRole}.`);
        }
      } else if (mode === "up") {
        const { error } = await supabase.auth.signUp({
          email,
          password: pw,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: name,
              role: selectedRole,
            },
          },
        });
        if (error) {
          setMsg({ t: "err", m: error.message });
        } else {
          setMsg({
            t: "ok",
            m: "Check your inbox to confirm your address, then sign in with your selected credentials.",
          });
          toast.success("Account created successfully!");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          setMsg({ t: "err", m: error.message });
        } else {
          setMsg({
            t: "ok",
            m: "If that address is registered, a password reset link is on its way.",
          });
        }
      }
    } catch (err) {
      setMsg({ t: "err", m: String(err) });
    } finally {
      setBusy(false);
    }
  }

  async function handleOAuth(provider: "google" | "github" | "linkedin") {
    setBusy(true);
    setMsg(null);
    try {
      const res = await signInWithOAuth(provider, selectedRole);
      if (res && (res as any).error) {
        const errObj = (res as any).error;
        const errMsg = String(errObj.message || errObj);
        setMsg({ t: "err", m: `OAuth login note: ${errMsg}` });
      }
    } catch (err) {
      setMsg({ t: "err", m: String(err) });
    } finally {
      setBusy(false);
    }
  }

  const handleDemoSignIn = (role: AppRole) => {
    signInAsDemo(role);
    toast.success(`Signed in as ${role.toUpperCase()} (Live Demo Mode)`);
    navigate({ to: "/onboard", search: { redirect: redirectTarget }, replace: true });
  };

  return (
    <Section className="grid gap-12 py-12 md:grid-cols-12 md:py-20">
      {/* Left Column: Heading & Role Selector */}
      <div className="md:col-span-5 space-y-6">
        <div>
          <span className="eyebrow text-accent">College Register & Portal</span>
          <h1 className="mt-2 text-4xl sm:text-5xl font-display leading-[1.1] text-foreground">
            {mode === "up" ? "Join the Ashwood Register." : mode === "forgot" ? "Reset your password." : "Welcome back."}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-ink-soft leading-relaxed">
            The public directory is open to explore. Signing in unlocks verified member capabilities:{" "}
            <strong>direct chat</strong>, <strong>completing gifts</strong>, <strong>referral requests</strong>, and <strong>mentorship bookings</strong>.
          </p>
        </div>

        {search.intent && (
          <div className="border border-accent/40 bg-accent/5 p-3.5 text-xs text-foreground">
            <span className="font-semibold text-accent">Sign-in required:</span> You were redirected to sign in to access{" "}
            <strong>{search.intent === "chat" ? "Direct Chat & Messages" : search.intent === "donate" ? "Gift Completion" : search.intent === "referral" ? "Job Referral Requests" : "Mentorship Scheduling"}</strong>.
          </div>
        )}

        {/* Role Selector Card */}
        <div className="border border-rule bg-paper p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-rule pb-2.5">
            <span className="eyebrow">Step 1: Select Your Role</span>
            <span className="font-mono text-[11px] text-muted-foreground uppercase">
              Current: <strong className="text-foreground">{selectedRole}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 pt-1">
            {ROLES.map(({ id, title, subtitle, icon: Icon }) => {
              const isSelected = selectedRole === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedRole(id)}
                  className={`group relative flex items-start gap-3 rounded border p-3 text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-accent bg-background shadow-xs ring-1 ring-accent"
                      : "border-rule bg-card/60 hover:bg-card hover:border-foreground/40"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded transition-colors ${
                      isSelected ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-base font-semibold text-foreground">{title}</span>
                      {isSelected && <Check className="h-4 w-4 text-accent" />}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Demo Mode buttons for testing */}
          <div className="border-t border-rule pt-3 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-ink-soft mb-2">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="font-mono text-[11px] uppercase tracking-wide">Instant Test Login:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSignIn("student")}
                className="rounded border border-rule bg-background px-2 py-1.5 text-center font-mono text-[11px] hover:border-accent hover:text-accent transition-colors"
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn("faculty")}
                className="rounded border border-rule bg-background px-2 py-1.5 text-center font-mono text-[11px] hover:border-accent hover:text-accent transition-colors"
              >
                🏛️ Faculty
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn("alumni")}
                className="rounded border border-rule bg-background px-2 py-1.5 text-center font-mono text-[11px] hover:border-accent hover:text-accent transition-colors"
              >
                💼 Alum
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: OAuth Buttons + Form */}
      <div className="md:col-span-6 md:col-start-7">
        <div className="border border-rule bg-paper p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <span className="eyebrow">Step 2: Authenticate as {selectedRole.toUpperCase()}</span>
            <h2 className="mt-1 font-display text-2xl text-foreground">
              {mode === "up" ? "Create Your Account" : mode === "forgot" ? "Reset Password" : "Sign In to Proceed"}
            </h2>
          </div>

          {/* OAuth Buttons */}
          {mode !== "forgot" && (
            <div className="space-y-2.5">
              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={() => handleOAuth("google")}
                disabled={busy}
                className="flex w-full items-center justify-center gap-3 rounded border border-rule bg-background px-4 py-2.5 text-sm font-medium text-foreground shadow-xs hover:border-foreground/40 hover:bg-card transition-colors disabled:opacity-50 cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google as {selectedRole.toUpperCase()}</span>
              </button>

              {/* GitHub OAuth Button */}
              <button
                type="button"
                onClick={() => handleOAuth("github")}
                disabled={busy}
                className="flex w-full items-center justify-center gap-3 rounded border border-rule bg-background px-4 py-2.5 text-sm font-medium text-foreground shadow-xs hover:border-foreground/40 hover:bg-card transition-colors disabled:opacity-50 cursor-pointer"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>Continue with GitHub</span>
              </button>

              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-rule" />
                </div>
                <span className="relative bg-paper px-3 text-xs font-mono text-muted-foreground uppercase">
                  Or continue with email
                </span>
              </div>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={submit} className="space-y-4">
            {mode === "up" && (
              <label className="block">
                <span className="eyebrow">Your Full Name</span>
                <input
                  className="field text-sm"
                  required
                  placeholder="e.g. Dr. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </label>
            )}

            <label className="block">
              <span className="eyebrow">Email Address</span>
              <input
                className="field text-sm"
                type="email"
                required
                placeholder="name@ashwood.edu or personal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>

            {mode !== "forgot" && (
              <label className="block">
                <span className="eyebrow">Password</span>
                <input
                  className="field text-sm"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  autoComplete={mode === "up" ? "new-password" : "current-password"}
                />
              </label>
            )}

            {msg && (
              <div
                role="status"
                className={`p-3 rounded text-xs ${
                  msg.t === "err" ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-accent/10 text-accent border border-accent/20"
                }`}
              >
                {msg.m}
              </div>
            )}

            <Btn className="w-full" disabled={busy}>
              {busy
                ? "Verifying Credentials…"
                : mode === "up"
                ? `Join as ${selectedRole.toUpperCase()}`
                : mode === "forgot"
                ? "Send Password Reset Link"
                : `Sign In as ${selectedRole.toUpperCase()}`}
            </Btn>
          </form>

          {/* Bottom Mode Switchers */}
          <div className="border-t border-rule pt-4 flex flex-wrap justify-between gap-y-2 text-xs text-ink-soft">
            {mode !== "in" && (
              <button type="button" className="link-u" onClick={() => setMode("in")}>
                Already registered? Sign in
              </button>
            )}
            {mode !== "up" && (
              <button type="button" className="link-u" onClick={() => setMode("up")}>
                New here? Create account
              </button>
            )}
            {mode !== "forgot" && (
              <button type="button" className="link-u text-muted-foreground" onClick={() => setMode("forgot")}>
                Forgot password?
              </button>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
