import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export const COLLEGE = { name: "Ashwood College", short: "Ashwood", est: 1887 };

export function SampleTag({ show = true }: { show?: boolean }) {
  if (!show) return null;
  return (
    <span
      title="Illustrative sample data, not a real record"
      className="ml-2 inline-block border border-sample px-1.5 py-px align-middle font-mono text-[10px] uppercase tracking-widest text-sample"
    >
      Sample
    </span>
  );
}

export function PageHead({
  index,
  eyebrow,
  title,
  lede,
  aside,
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="mx-auto grid max-w-6xl gap-8 px-5 pt-14 pb-10 md:grid-cols-12 md:px-8 md:pt-20">
      <div className="md:col-span-2">
        {index && <span className="font-mono text-xs text-muted-foreground">{index}</span>}
      </div>
      <div className="md:col-span-7">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 text-4xl leading-[1.05] md:text-6xl">{title}</h1>
        {lede && <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">{lede}</p>}
      </div>
      {aside && <div className="md:col-span-3 md:self-end">{aside}</div>}
    </header>
  );
}

export function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`mx-auto max-w-6xl px-5 md:px-8 ${className}`}>{children}</section>;
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="py-16 text-center">
      <span className="eyebrow animate-pulse">{label}…</span>
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rule py-14 text-center">
      <p className="font-display text-2xl italic text-ink-soft">{title}</p>
      {children && <div className="mt-3 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

export function ErrorNote({ error }: { error: unknown }) {
  return (
    <div role="alert" className="border-l-2 border-destructive py-3 pl-4 text-sm text-destructive">
      Something went wrong: {error instanceof Error ? error.message : String((error as { message?: string })?.message ?? error)}
    </div>
  );
}

export function SignInPrompt({ action }: { action: string }) {
  return (
    <p className="text-sm text-ink-soft">
      <Link to="/auth" className="link-u text-foreground">
        Sign in
      </Link>{" "}
      to {action}.
    </p>
  );
}

export function Btn({
  children,
  variant = "solid",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "line" | "text" }) {
  const v = {
    solid: "bg-primary text-primary-foreground hover:bg-accent",
    line: "border border-foreground text-foreground hover:bg-foreground hover:text-background",
    text: "text-foreground link-u px-0",
  }[variant];
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm tracking-wide transition-colors disabled:opacity-50 ${v} ${className}`}
    >
      {children}
    </button>
  );
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Monogram({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const s = { sm: "h-9 w-9 text-sm", md: "h-12 w-12 text-base", lg: "h-24 w-24 text-3xl" }[size];
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center border border-rule bg-paper font-display italic ${s}`}>
      {initials(name || "?")}
    </span>
  );
}
