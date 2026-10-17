import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import campus from "@/assets/campus.jpg";
import aanyaPortrait from "@/assets/alumni/aanya-iyer.jpg";
import arjunPortrait from "@/assets/alumni/arjun-nair.jpg";
import priyaPortrait from "@/assets/alumni/priya-ramanathan.jpg";
import { COLLEGE, SampleTag, Section } from "@/components/site/ui";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { fmtDate, fmtMoney, fundsQuery, notableQuery, profilesQuery, updatesQuery } from "@/lib/queries";
import { MOCK_PROFILES } from "@/lib/mockData";

const PORTRAITS = {
  "arjun-nair": arjunPortrait,
  "priya-ramanathan": priyaPortrait,
  "aanya-iyer": aanyaPortrait,
} as const;

const recruiterPartners = [
  { name: "Anthropic", mark: "A", color: "#c15f3c", focus: "Frontier computing", alumni: "Systems, research & product" },
  { name: "Google DeepMind", mark: "G", color: "#4285f4", focus: "Applied intelligence", alumni: "Machine learning & science" },
  { name: "Stripe", mark: "S", color: "#635bff", focus: "Financial infrastructure", alumni: "Product, design & engineering" },
  { name: "Apple", mark: "", color: "#8b8b8b", focus: "Human technology", alumni: "Hardware, design & software" },
  { name: "Microsoft", mark: "⊞", color: "#00a4ef", focus: "Cloud & platforms", alumni: "Engineering & enterprise" },
  { name: "Adobe", mark: "A", color: "#ed2224", focus: "Creative technology", alumni: "Design, product & data" },
] as const;

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
  const notable = useQuery(notableQuery);
  const people = profiles.data ?? [];
  const mentors = people.filter((p) => p.open_to_mentor).length;
  const cities = new Set(people.map((p) => p.city).filter(Boolean)).size;
  const notableCards = (notable.data ?? [])
    .map((n) => {
      const p = people.find((row) => row.id === n.profileId) ?? MOCK_PROFILES.find((row) => row.id === n.profileId);
      return p ? { ...n, person: p } : null;
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

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
        <img src={campus} alt="The clock tower and arched cloister of the main quadrangle" width={1600} height={1104} className="aspect-[16/8] w-full object-cover grayscale dark:opacity-80 dark:sepia-[.35] dark:contrast-[.92]" />
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
            ["/events", "Attend an event", "Reunions, workshops, and campus celebrations on the association calendar."],
            ["/communities", "Explore communities", "Campus societies and the companies where alumni now work."],
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
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground pb-3">
          <div>
            <p className="eyebrow">The hiring register</p>
            <h2 className="mt-2 text-3xl">Past recruiters of our alumni</h2>
          </div>
          <p className="max-w-sm text-right text-sm text-ink-soft">Where Ashwood graduates have built what comes next.</p>
        </div>
        <div className="mt-8 px-10 md:px-12">
          <Carousel opts={{ align: "start", loop: true }} aria-label="Past recruiters of Ashwood alumni">
            <CarouselContent className="-ml-3">
              {recruiterPartners.map((company) => (
                <CarouselItem key={company.name} className="basis-full pl-3 sm:basis-1/2 md:basis-1/3">
                  <article className="h-full border border-rule bg-paper p-5 transition-colors hover:border-accent">
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-sm text-2xl font-semibold"
                        style={{ backgroundColor: `${company.color}18`, color: company.color }}
                        aria-hidden="true"
                      >
                        {company.mark}
                      </div>
                      <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <h3 className="mt-8 font-display text-2xl">{company.name}</h3>
                    <p className="mt-1 text-sm text-accent">{company.focus}</p>
                    <p className="mt-5 border-t border-rule pt-3 text-xs leading-relaxed text-ink-soft">{company.alumni}</p>
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-10 md:-left-12" aria-label="Previous recruiter" />
            <CarouselNext className="-right-10 md:-right-12" aria-label="Next recruiter" />
          </Carousel>
        </div>
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

      <Section className="mt-28">
        <div className="flex items-baseline justify-between border-b border-foreground pb-3">
          <div>
            <p className="eyebrow">The roll of honour</p>
            <h2 className="mt-2 text-3xl">Notable alumni</h2>
          </div>
          <Link to="/directory" className="link-u text-sm">
            Full directory
          </Link>
        </div>
        <p className="mt-5 max-w-2xl text-ink-soft">
          Celebrating graduates making a difference worldwide — in research, industry, public life, and the companies they
          founded.
        </p>
        <div className="mt-12">
          {notableCards.map(({ person, distinction, accolade, photo }, i) => {
            const photoRight = i % 2 === 1;
            const portrait = photo ? PORTRAITS[photo] : undefined;
            return (
              <Link
                key={person.id}
                to="/alumni/$id"
                params={{ id: person.id }}
                className={`group flex flex-col items-center gap-8 border-t border-rule py-12 last:border-b md:flex-row md:gap-16 ${
                  photoRight ? "md:flex-row-reverse" : ""
                }`}
              >
                {portrait ? (
                  <figure className="w-full shrink-0 md:w-[46%]">
                    <img
                      src={portrait}
                      alt={`Portrait of ${person.full_name}`}
                      width={768}
                      height={1024}
                      className="aspect-[4/5] w-full object-cover object-top grayscale transition duration-300 group-hover:grayscale-0 dark:opacity-90 dark:sepia-[.2] dark:group-hover:sepia-0"
                    />
                    <figcaption className="mt-3 flex justify-between eyebrow">
                      <span>{person.full_name}</span>
                      <span>Fig. {i + 2}</span>
                    </figcaption>
                  </figure>
                ) : (
                  <div className="flex aspect-[4/5] w-full shrink-0 items-center justify-center bg-paper text-5xl text-accent md:w-[46%]" aria-label={`Portrait unavailable for ${person.full_name}`}>
                    {person.full_name.charAt(0)}
                  </div>
                )}
                <div className={`w-full md:flex-1 ${photoRight ? "md:text-right md:[&>*]:ml-auto" : ""}`}>
                  <p className="eyebrow">
                    {distinction}
                    <SampleTag show={person.is_sample} />
                  </p>
                  <h3 className="mt-3 font-display text-4xl leading-tight group-hover:text-accent md:text-5xl">
                    {person.full_name}
                  </h3>
                  <p className="mt-3 text-ink-soft">
                    {person.role_title} · {person.company}
                  </p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-accent">
                    Class of {person.grad_year}
                  </p>
                  <p className="mt-5 max-w-md font-serif text-lg leading-relaxed text-ink-soft">{accolade}</p>
                  <span className="mt-6 inline-block text-sm text-foreground">Read the register →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>
    </>
  );
}
