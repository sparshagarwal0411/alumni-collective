import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import campus from "@/assets/campus.jpg";
import { COLLEGE, SampleTag, Section } from "@/components/site/ui";
import { fmtDate, fmtMoney, fundsQuery, profilesQuery, updatesQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ashwood College Alumni — The register of a long conversation" },
      { name: "description", content: "Find classmates, mentor students, share opportunities and support the next generation at Ashwood College." },
      { property: "og:title", content: "Ashwood College Alumni" },
      { property: "og:description", content: "Find classmates, mentor students, share opportunities and support the next generation." },
    ],
  }),
  component: Home,
});

function Home() {
  const profiles = useQuery(profilesQuery);
  const updates = useQuery(updatesQuery);
  const funds = useQuery(fundsQuery);
  const people = profiles.data ?? [];
  const mentors = people.filter((p) => p.open_to_mentor).length;
  const cities = new Set(people.map((p) => p.city).filter(Boolean)).size;

  return (
    <>
      <Section className="grid gap-10 pt-14 md:grid-cols-12 md:pt-24">
        <div className="md:col-span-7">
          <p className="eyebrow">{COLLEGE.name} · Alumni Association</p>
          <h1 className="mt-5 text-5xl leading-[0.98] md:text-[5.5rem]">
            The register of a <em className="text-accent">long</em> conversation.
          </h1>
        </div>
        <p className="self-end text-lg leading-relaxed text-ink-soft md:col-span-4 md:col-start-9">
          Since {COLLEGE.est}, Ashwood graduates have gone on to write, build, heal and argue for a living. This is where they find each other again.
        </p>
      </Section>

      <figure className="mx-auto mt-14 max-w-6xl px-5 md:px-8">
        <img src={campus} alt="The clock tower and arched cloister of the main quadrangle" width={1600} height={1104} className="aspect-[16/8] w-full object-cover grayscale" />
        <figcaption className="mt-3 flex justify-between eyebrow">
          <span>The Main Quadrangle, east cloister</span>
          <span>Fig. 1</span>
        </figcaption>
      </figure>

      <Section className="mt-20 grid gap-y-10 md:grid-cols-12">
        <div className="md:col-span-3">
          <p className="eyebrow">By the numbers</p>
          <p className="mt-2 text-sm text-muted-foreground">Live from the register.</p>
        </div>
        <dl className="grid grid-cols-3 gap-6 md:col-span-9">
          {[
            [people.length, "Alumni listed"],
            [mentors, "Open to mentor"],
            [cities, "Cities"],
          ].map(([n, l]) => (
            <div key={l} className="rule pt-4">
              <dt className="eyebrow">{l}</dt>
              <dd className="mt-2 font-display text-5xl md:text-6xl">{profiles.isLoading ? "—" : n}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section className="mt-28 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <h2 className="text-4xl leading-tight">What the community does here.</h2>
        </div>
        <ol className="md:col-span-7 md:col-start-6">
          {[
            ["/directory", "Find people", "Search by class year, discipline, city or what they know."],
            ["/mentorship", "Mentor and be mentored", "Request an hour of someone's attention, or offer yours."],
            ["/jobs", "Pass on opportunity", "Post roles, ask for referrals, vouch for juniors."],
            ["/tasks", "Lend a small hand", "Thirty-minute favours: a deck review, a proofread, a test."],
            ["/network", "See the web of it", "An interactive map of who knows whom."],
          ].map(([to, t, d], i) => (
            <li key={to} className="group grid grid-cols-[3rem_1fr] items-baseline border-t border-rule py-6 last:border-b">
              <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              <Link to={to} className="block">
                <span className="font-display text-2xl group-hover:text-accent md:text-3xl">{t} →</span>
                <span className="mt-1 block text-ink-soft">{d}</span>
              </Link>
            </li>
          ))}
        </ol>
      </Section>

      <Section className="mt-28">
        <div className="flex items-baseline justify-between border-b border-foreground pb-3">
          <h2 className="text-3xl">From the quad</h2>
          <Link to="/updates" className="link-u text-sm">All updates</Link>
        </div>
        <div className="grid md:grid-cols-3 md:divide-x md:divide-rule">
          {(updates.data ?? []).slice(0, 3).map((u, i) => (
            <article key={u.id} className={`py-8 md:px-6 ${i === 0 ? "md:pl-0" : ""}`}>
              <p className="eyebrow">{u.category} · {fmtDate(u.created_at)}<SampleTag show={u.is_sample} /></p>
              <h3 className="mt-3 text-2xl leading-snug">{u.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{u.body}</p>
            </article>
          ))}
        </div>
      </Section>

      {funds.data && funds.data[0] && (
        <Section className="mt-24">
          <div className="grid gap-10 bg-paper px-6 py-14 md:grid-cols-12 md:px-12">
            <div className="md:col-span-7">
              <p className="eyebrow">Giving · {funds.data[0].name}<SampleTag show={funds.data[0].is_sample} /></p>
              <p className="mt-4 font-display text-3xl leading-snug md:text-4xl">
                “I was the first in my family to see the inside of a lecture hall. Someone I never met paid for it.”
              </p>
              <p className="mt-4 text-sm text-muted-foreground">— Scholarship recipient, Class of 2019 (illustrative)</p>
            </div>
            <div className="md:col-span-4 md:col-start-9 md:self-end">
              <p className="font-display text-5xl">{fmtMoney(funds.data[0].raised_amount)}</p>
              <p className="text-sm text-muted-foreground">of {fmtMoney(funds.data[0].goal_amount)} goal</p>
              <Link to="/give" className="mt-6 inline-block bg-accent px-5 py-2.5 text-sm text-accent-foreground hover:bg-primary">Make a gift</Link>
            </div>
          </div>
        </Section>
      )}
    </>
  );
}
