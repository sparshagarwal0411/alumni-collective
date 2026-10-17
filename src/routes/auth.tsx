import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { Btn, Section } from "@/components/site/ui";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Ashwood Alumni" },
      { name: "description", content: "Sign in or join the Ashwood College alumni network." },
      { property: "og:title", content: "Sign in — Ashwood Alumni" },
      { property: "og:description", content: "Sign in or join the Ashwood College alumni network." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; m: string } | null>(null);

  useEffect(() => {
    if (user) navigate({ to: "/directory" });
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) setMsg({ t: "err", m: error.message });
    } else if (mode === "up") {
      const { error } = await supabase.auth.signUp({
        email,
        password: pw,
        options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
      });
      setMsg(error ? { t: "err", m: error.message } : { t: "ok", m: "Check your inbox to confirm your address, then sign in." });
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      setMsg(error ? { t: "err", m: error.message } : { t: "ok", m: "If that address is registered, a reset link is on its way." });
    }
    setBusy(false);
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) setMsg({ t: "err", m: String(r.error.message ?? r.error) });
  }

  return (
    <Section className="grid gap-12 py-16 md:grid-cols-12 md:py-24">
      <div className="md:col-span-5">
        <p className="eyebrow">Members</p>
        <h1 className="mt-3 text-5xl leading-tight">
          {mode === "up" ? "Join the register." : mode === "forgot" ? "Reset your password." : "Welcome back."}
        </h1>
        <p className="mt-4 text-ink-soft">The directory is open to read. Signing in lets you message, mentor, refer and take on microtasks.</p>
      </div>
      <div className="md:col-span-5 md:col-start-8">
        <form onSubmit={submit} className="space-y-6">
          {mode === "up" && (
            <label className="block">
              <span className="eyebrow">Full name</span>
              <input className="field" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </label>
          )}
          <label className="block">
            <span className="eyebrow">Email</span>
            <input className="field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          {mode !== "forgot" && (
            <label className="block">
              <span className="eyebrow">Password</span>
              <input className="field" type="password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={mode === "up" ? "new-password" : "current-password"} />
            </label>
          )}
          {msg && (
            <p role="status" className={`text-sm ${msg.t === "err" ? "text-destructive" : "text-ink-soft"}`}>{msg.m}</p>
          )}
          <Btn className="w-full" disabled={busy}>
            {busy ? "One moment…" : mode === "up" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
          </Btn>
        </form>
        <div className="rule my-8" />
        <Btn variant="line" className="w-full" onClick={google} type="button">Continue with Google</Btn>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {mode !== "in" && <button className="link-u" onClick={() => setMode("in")}>I have an account</button>}
          {mode !== "up" && <button className="link-u" onClick={() => setMode("up")}>Create an account</button>}
          {mode !== "forgot" && <button className="link-u" onClick={() => setMode("forgot")}>Forgot password</button>}
        </div>
      </div>
    </Section>
  );
}
