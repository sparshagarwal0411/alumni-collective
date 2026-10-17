import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Btn } from "./ui";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "dup" | "err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: email.trim().toLowerCase() });
    if (!error) setState("done");
    else if (error.code === "23505") setState("dup");
    else setState("err");
  }

  if (state === "done")
    return <p className="font-display text-xl italic">Thank you — the next letter is on its way to you.</p>;

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 sm:flex-row sm:items-end" aria-label="Newsletter signup">
      <label className="flex-1">
        <span className="sr-only">Email address</span>
        <input
          type="email"
          required
          className="field"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <Btn disabled={state === "busy"}>{state === "busy" ? "Subscribing…" : "Subscribe"}</Btn>
      {state === "dup" && <p className="text-sm text-muted-foreground">This address is already subscribed.</p>}
      {state === "err" && <p className="text-sm text-destructive">Couldn't subscribe. Please check the address.</p>}
    </form>
  );
}
