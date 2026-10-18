import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHead, Section } from "@/components/site/ui";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { getDisplayName, getStudentProfile, saveStudentProfile } from "@/lib/studentProfile";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account & Profile Settings — Ashwood College" },
      { name: "description", content: "Manage your registered profile details, mentorship availability, and institutional preferences." },
    ],
  }),
  component: AccountPage,
});

export function AccountPage() {
  const { user, currentRole, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(
    () => getDisplayName(user, currentRole, getStudentProfile(user?.id)) || "",
  );

  useEffect(() => {
    const next = getDisplayName(user, currentRole, getStudentProfile(user?.id));
    if (next) setFullName(next);
  }, [user, currentRole]);
  const [headline, setHeadline] = useState("Doctoral Candidate in Parallel Systems · Ashwood CSE '25");
  const [roleTitle, setRoleTitle] = useState("Research Fellow");
  const [company, setCompany] = useState("Ashwood Parallel Computing Lab");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [gradYear, setGradYear] = useState("2025");
  const [city, setCity] = useState("Bengaluru, India");
  const [bio, setBio] = useState(
    "Researching lock-free memory models and low-overhead tracing runtimes on multicore architectures. Passionate about systems software, compiler optimizations, and mentorship for undergraduates."
  );
  const [skillsStr, setSkillsStr] = useState("C++, Rust, Linux Kernel, Compilers, Distributed Systems");
  const [openToMentor, setOpenToMentor] = useState(true);
  const [linkedin, setLinkedin] = useState("https://linkedin.com");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    void (async () => {
      const name = fullName.trim();
      if (user && name) {
        await updateProfile({ full_name: name });
        if (currentRole === "student") {
          saveStudentProfile({ ...getStudentProfile(user.id), fullName: name }, user.id);
        }
      }
      setIsSaving(false);
      toast.success("Profile records successfully updated in the college register.");
    })();
  };

  return (
    <>
      {/* <PageHead
        index="X."
        eyebrow="Identity"
        title="Your college register profile."
        lede="Keep your appointments, academic affiliation, and mentorship availability accurate for students and classmates."
      /> */}

      <Section>
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Main Edit Form */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSave} className="border border-rule bg-card p-6 md:p-8 space-y-8">
              {/* Core Info */}
              <div className="space-y-4">
                <span className="eyebrow block border-b border-rule pb-2">Institutional Identification</span>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="eyebrow block mb-1">Full Legal / Display Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="field"
                    />
                  </div>

                  <div>
                    <label className="eyebrow block mb-1">Class Year (Graduation)</label>
                    <input
                      type="number"
                      required
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                      className="field font-mono"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="eyebrow block mb-1">Academic Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="field text-sm"
                    >
                      <option>Computer Science & Engineering</option>
                      <option>Mechanical Sciences</option>
                      <option>Electrical & Computer Engineering</option>
                      <option>Economics & Public Policy</option>
                      <option>Biophysics & Molecular Biology</option>
                      <option>Literature & Visual Studies</option>
                      <option>Civil & Environmental Engineering</option>
                      <option>Mathematics & Computing</option>
                    </select>
                  </div>

                  <div>
                    <label className="eyebrow block mb-1">Current City, Country</label>
                    <input
                      type="text"
                      placeholder="e.g. San Francisco, USA"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="field"
                    />
                  </div>
                </div>
              </div>

              {/* Career & Appointments */}
              <div className="space-y-4">
                <span className="eyebrow block border-b border-rule pb-2">Current Career & Organization</span>

                <div>
                  <label className="eyebrow block mb-1">Profile Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="field text-base"
                    placeholder="e.g. Staff Engineer at Stripe · Ex-Robotics Lead"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="eyebrow block mb-1">Current Role / Title</label>
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      className="field"
                    />
                  </div>

                  <div>
                    <label className="eyebrow block mb-1">Organization / Employer</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="field"
                    />
                  </div>
                </div>

                <div>
                  <label className="eyebrow block mb-1">Biographical Statement</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full border border-rule bg-paper p-3 text-sm focus:border-accent focus:outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="eyebrow block mb-1">Focus Areas & Skills (Comma Separated)</label>
                  <input
                    type="text"
                    value={skillsStr}
                    onChange={(e) => setSkillsStr(e.target.value)}
                    className="field"
                  />
                </div>

                <div>
                  <label className="eyebrow block mb-1">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="field font-mono text-xs"
                  />
                </div>
              </div>

              {/* Mentorship Settings */}
              <div className="space-y-4">
                <span className="eyebrow block border-b border-rule pb-2">Mentorship Circle Availability</span>
                <label className="flex items-start gap-3 p-4 border border-rule bg-paper cursor-pointer">
                  <input
                    type="checkbox"
                    checked={openToMentor}
                    onChange={(e) => setOpenToMentor(e.target.checked)}
                    className="mt-1 accent-[var(--accent)]"
                  />
                  <div>
                    <span className="font-display text-lg block">Open to Mentoring Undergraduates</span>
                    <span className="text-xs text-ink-soft leading-relaxed block mt-1">
                      Display your profile in the Mentorship Circle and allow enrolled students to request 45-minute guidance sessions.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary px-6 py-3 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving Records..." : "Save Profile Changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Directory Preview Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-rule bg-paper p-6 sticky top-6 space-y-4">
              <span className="eyebrow block border-b border-rule pb-2">Live Directory Preview</span>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 border border-rule bg-background grid place-items-center font-display italic text-lg">
                    {fullName.slice(0, 1)}
                  </span>
                  <div>
                    <p className="font-display text-xl leading-tight">{fullName || "Your Name"}</p>
                    <p className="font-mono text-xs text-muted-foreground">Class of {gradYear || "2025"}</p>
                  </div>
                </div>

                <p className="text-xs text-ink-soft">{headline || "Your headline will appear here."}</p>

                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-rule">
                  <p>🏛 {department}</p>
                  <p>📍 {city}</p>
                  {openToMentor && (
                    <p className="text-accent font-mono text-[11px] pt-1">
                      ● Active Mentorship Available
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 pt-2">
                  {skillsStr.split(",").map((s) => (
                    <span key={s} className="border border-rule bg-background px-2 py-0.5 text-[11px] text-ink-soft">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
