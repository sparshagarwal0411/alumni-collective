import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Btn, Section } from "@/components/site/ui";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Ashwood Alumni" },
      { name: "description", content: "Choose a new password for your alumni account." },
      { property: "og:title", content: "Set a new password — Ashwood Alumni" },
      { property: "og:description", content: "Choose a new password for your alumni account." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  return (
    <Section className="max-w-md py-24">
      <h1 className="text-4xl">Set a new password</h1>
      <form
        className="mt-8 space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const { error } = await supabase.auth.updateUser({ password: pw });
          if (error) setErr(error.message);
          else navigate({ to: "/directory" });
        }}
      >
        <input className="field" type="password" minLength={8} required value={pw} onChange={(e) => setPw(e.target.value)} aria-label="New password" />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Btn>Save password</Btn>
      </form>
    </Section>
  );
}
