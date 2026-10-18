import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { COLLEGE } from "./ui";
import { Newsletter } from "./Newsletter";

function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const lamp = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`link-u ${className}`}
      aria-pressed={lamp}
      aria-label={lamp ? "Switch to daylight" : "Switch to lamp hour"}
      title={lamp ? "Daylight — cream paper" : "Lamp hour — walnut and gilt"}
    >
      {lamp ? "Daylight" : "Lamp Hour"}
    </button>
  );
}

const NAV = [
  // { to: "/dashboard", label: "Dashboard" },
  { to: "/directory", label: "Directory" },
  // { to: "/jobs", label: "Jobs" },
  // { to: "/student", label: "Student Folio" },
  // { to: "/communities", label: "Communities" }, 
  { to: "/events", label: "Events" },
  { to: "/network", label: "Network" },
  { to: "/updates", label: "Updates" },
] as const;

export function Header() {
  const { user, signOut, currentRole } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 md:px-8">
        <Link to="/" className="min-w-0 leading-none">
          <span className="block font-display text-xl">{COLLEGE.name}</span>
          <span className="eyebrow">Alumni · Est. {COLLEGE.est}</span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm lg:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="text-ink-soft hover:text-foreground" activeProps={{ className: "text-foreground underline underline-offset-8 decoration-accent" }}>
              {n.label}
            </Link>
          ))}
          {user && (
            <>
              <Link
                to="/tasks"
                className="text-ink-soft hover:text-foreground"
                activeProps={{ className: "text-foreground underline underline-offset-8 decoration-accent" }}
              >
                Bounty
              </Link>
              <Link
                to="/messages"
                className="text-ink-soft hover:text-foreground"
                activeProps={{ className: "text-foreground underline underline-offset-8 decoration-accent" }}
              >
                Messages
              </Link>
            </>
          )}
        </nav>
        <div className="hidden items-center gap-5 text-sm lg:flex">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 border border-accent/40 bg-accent/10 px-2 py-0.5 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                title="Universal Collective Dashboard"
              >
                <span className="font-mono text-[10px] uppercase text-accent font-semibold">
                  {currentRole}
                </span>
                <span className="font-medium text-xs">Dashboard</span>
              </Link>
              <button
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/", replace: true });
                }}
                className="link-u cursor-pointer"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/auth" className="link-u">Sign in</Link>
          )}
          <ThemeToggle />
          <Link to="/give" className="bg-accent px-4 py-2 text-accent-foreground hover:bg-primary">Give</Link>
        </div>
        <button className="eyebrow lg:hidden" aria-expanded={open} aria-controls="mnav" onClick={() => setOpen((o) => !o)}>
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <nav id="mnav" aria-label="Mobile" className="border-t border-rule px-5 py-4 lg:hidden" onClick={() => setOpen(false)}>
          <ul className="grid gap-3 font-display text-2xl">
            {NAV.map((n) => (
              <li key={n.to}><Link to={n.to}>{n.label}</Link></li>
            ))}
            {user ? (
              <>
                <li><Link to="/tasks">Bounty</Link></li>
                <li><Link to="/messages">Messages</Link></li>
                <li><Link to="/dashboard" className="text-accent">Dashboard ({currentRole})</Link></li>
                <li><button onClick={() => signOut().then(() => navigate({ to: "/", replace: true }))}>Sign out</button></li>
              </>
            ) : (
              <li><Link to="/auth">Sign in</Link></li>
            )}
            <li><Link to="/give" className="text-accent">Give</Link></li>
            <li><ThemeToggle /></li>
          </ul>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-28 border-t border-rule bg-paper">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-12 md:px-8">
        <div className="md:col-span-5">
          <p className="eyebrow">The Ashwood Letter</p>
          <h2 className="mt-3 text-3xl">A short dispatch, once a month.</h2>
          <p className="mt-3 text-ink-soft">Reunions, appointments, and news from the quad. No noise.</p>
          <div className="mt-6"><Newsletter /></div>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm md:col-span-6 md:col-start-7">
          <ul className="space-y-2">
            <li className="eyebrow mb-3">Community</li>
            <li><Link to="/directory" className="link-u">Directory</Link></li>
            <li><Link to="/communities" className="link-u">Societies & companies</Link></li>
            <li><Link to="/events" className="link-u">Events & milestones</Link></li>
            <li><Link to="/network" className="link-u">Relationship graph</Link></li>
            <li><Link to="/updates" className="link-u">Community updates</Link></li>
          </ul>
          <ul className="space-y-2">
            <li className="eyebrow mb-3">Opportunity</li>
            <li><Link to="/jobs" className="link-u">Jobs & referrals</Link></li>
            <li><Link to="/tasks" className="link-u">Microtasks</Link></li>
            <li><Link to="/analytics" className="link-u">Analytics</Link></li>
            <li><Link to="/give" className="link-u">Make a gift</Link></li>
          </ul>
        </div>
        <p className="eyebrow md:col-span-12">© {COLLEGE.name} Alumni Association. Entries marked “Sample” are illustrative.</p>
      </div>
    </footer>
  );
}
