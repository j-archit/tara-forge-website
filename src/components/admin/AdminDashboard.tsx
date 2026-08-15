"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Box,
  Clock,
  FileText,
  Gauge,
  LogOut,
  Mail,
  RefreshCw,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import {
  adminApi,
  ApiError,
  type Client,
  type Job,
  type SlicerProfile,
  type Submission,
  type TemplateMap,
} from "@/lib/admin-api";

type Tab = "submissions" | "clients" | "slicer" | "templates" | "jobs";

const tabs: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: "submissions", label: "Submissions", icon: BarChart3 },
  { id: "clients", label: "Clients", icon: Users },
  { id: "slicer", label: "Slicer profiles", icon: Settings },
  { id: "templates", label: "Email templates", icon: Mail },
  { id: "jobs", label: "System jobs", icon: Gauge },
];

export function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("submissions");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [profiles, setProfiles] = useState<SlicerProfile[]>([]);
  const [templates, setTemplates] = useState<TemplateMap>({});
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setNotice("");
    try {
      await adminApi.session();
      const [nextSubmissions, nextClients, nextProfiles, nextTemplates, nextJobs] = await Promise.all([
        adminApi.submissions(),
        adminApi.clients(),
        adminApi.profiles(),
        adminApi.templates(),
        adminApi.jobs(),
      ]);
      setSubmissions(nextSubmissions);
      setClients(nextClients);
      setProfiles(nextProfiles);
      setTemplates(nextTemplates);
      setJobs(nextJobs);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.replace("/admin/login");
      } else {
        setNotice(error instanceof Error ? error.message : "Unable to load administration data.");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleSubmissions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return submissions;
    return submissions.filter((submission) =>
      [submission.name, submission.email, submission.fileName, submission.material]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [search, submissions]);

  async function logout() {
    await adminApi.logout();
    router.replace("/admin/login");
    router.refresh();
  }

  async function queueSlice(id: string) {
    await adminApi.slice(id);
    setNotice("Slicing job queued.");
    await load();
  }

  async function openEmail(id: string) {
    const generated = await adminApi.email(id);
    window.location.href = generated.mailto;
  }

  return (
    <main className="relative min-h-screen bg-[#08090b] text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-800 bg-[#0a0a0b] lg:flex lg:flex-col">
        <div className="border-b border-slate-800 p-6">
          <p className="text-xl font-bold text-brand-gold">TaraForge3D</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">Operations console</p>
        </div>
        <nav className="flex-1 space-y-2 p-4" aria-label="Administration">
          {tabs.map((tab) => (
            <TabButton key={tab.id} tab={tab} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
          ))}
        </nav>
        <div className="space-y-2 border-t border-slate-800 p-4">
          <Link href="/" className="block rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-900 hover:text-brand-gold">View public site</Link>
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-900 hover:text-red-300">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-800 bg-[#08090b]/90 px-4 py-4 backdrop-blur-xl sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects, clients, or materials"
                className="w-full rounded-full border border-slate-800 bg-slate-900/70 py-2 pl-10 pr-4 text-sm outline-none focus:border-brand-gold/60"
              />
            </div>
            <button onClick={() => void load()} aria-label="Refresh data" className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-brand-gold">
              <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto lg:hidden" aria-label="Administration">
            {tabs.map((tab) => (
              <TabButton key={tab.id} tab={tab} active={activeTab === tab.id} compact onClick={() => setActiveTab(tab.id)} />
            ))}
          </nav>
        </header>

        <section className="mx-auto max-w-7xl p-4 sm:p-8">
          {notice && <div role="status" className="mb-6 rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-4 py-3 text-sm text-brand-gold">{notice}</div>}
          {activeTab === "submissions" && (
            <SubmissionsView submissions={visibleSubmissions} onSelect={setSelected} onSlice={queueSlice} onEmail={openEmail} />
          )}
          {activeTab === "clients" && <ClientsView clients={clients} submissions={submissions} />}
          {activeTab === "slicer" && <ProfilesView profiles={profiles} onChanged={load} setNotice={setNotice} />}
          {activeTab === "templates" && <TemplatesView templates={templates} onChanged={load} setNotice={setNotice} />}
          {activeTab === "jobs" && <JobsView jobs={jobs} onChanged={load} setNotice={setNotice} />}
        </section>
      </div>

      {selected && <SubmissionDrawer submission={selected} onClose={() => setSelected(null)} onSlice={queueSlice} onEmail={openEmail} />}
    </main>
  );
}

function TabButton({ tab, active, compact, onClick }: { tab: (typeof tabs)[number]; active: boolean; compact?: boolean; onClick: () => void }) {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg transition ${compact ? "shrink-0 px-3 py-2 text-xs" : "w-full px-4 py-2.5 text-sm"} ${active ? "bg-brand-gold font-semibold text-slate-950" : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"}`}
    >
      <Icon className="h-4 w-4" /> {tab.label}
    </button>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return <div className="mb-6"><h1 className="text-2xl font-semibold text-slate-50">{title}</h1><p className="mt-1 text-sm text-slate-500">{description}</p></div>;
}

function SubmissionsView({ submissions, onSelect, onSlice, onEmail }: { submissions: Submission[]; onSelect: (value: Submission) => void; onSlice: (id: string) => void; onEmail: (id: string) => void }) {
  return (
    <>
      <SectionHeading title="Project submissions" description="Review incoming designs and production estimates." />
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950 text-xs uppercase tracking-wider text-slate-500">
              <tr><th className="px-5 py-4">Client</th><th className="px-5 py-4">Model</th><th className="px-5 py-4">Estimate</th><th className="px-5 py-4">Pipeline</th><th className="px-5 py-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-slate-900/50">
                  <td className="px-5 py-4"><button onClick={() => onSelect(submission)} className="text-left"><strong className="block text-slate-200">{submission.name}</strong><span className="text-xs text-slate-500">{submission.email}</span></button></td>
                  <td className="px-5 py-4"><span className="flex items-center gap-2"><Box className="h-4 w-4 text-brand-gold" />{submission.fileName ?? "No model"}</span><span className="mt-1 block text-xs uppercase text-slate-500">{submission.material} · {submission.projectType}</span></td>
                  <td className="px-5 py-4 text-xs text-slate-400">{submission.printTimeSeconds ? <><Clock className="mr-1 inline h-3 w-3" />{Math.round(submission.printTimeSeconds / 60)} min · {submission.filamentGrams ?? 0} g</> : "Pending"}</td>
                  <td className="px-5 py-4"><div className="flex flex-wrap gap-2"><Status value={submission.slicerStatus} label="Slice" /><Status value={submission.googleDriveStatus} label="Drive" /><Status value={submission.googleSheetStatus} label="Sheet" /></div></td>
                  <td className="px-5 py-4"><div className="flex gap-2"><button onClick={() => void onSlice(submission.id)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs hover:border-brand-gold hover:text-brand-gold">Slice</button><button onClick={() => void onEmail(submission.id)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs hover:border-brand-gold hover:text-brand-gold">Email</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!submissions.length && <p className="p-12 text-center text-sm text-slate-500">No submissions match this view.</p>}
      </div>
    </>
  );
}

function ClientsView({ clients, submissions }: { clients: Client[]; submissions: Submission[] }) {
  return <><SectionHeading title="Clients" description="A consolidated history for every project contact." /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{clients.map((client) => { const count = submissions.filter((item) => item.email === client.email).length; return <article key={client.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold/15 font-bold text-brand-gold">{client.name.slice(0, 1).toUpperCase()}</div><h2 className="font-semibold text-slate-100">{client.name}</h2><p className="text-sm text-slate-500">{client.email}</p><p className="mt-4 text-xs uppercase tracking-wider text-slate-500">{count} project{count === 1 ? "" : "s"}</p></article>; })}</div></>;
}

function ProfilesView({ profiles, onChanged, setNotice }: { profiles: SlicerProfile[]; onChanged: () => Promise<void>; setNotice: (value: string) => void }) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const selected = profiles.find((profile) => `${profile.material}/${profile.name}` === selectedKey) ?? profiles[0] ?? null;
  return <><SectionHeading title="Slicer profiles" description="Versioned CuraEngine settings grouped by material." /><div className="grid gap-5 lg:grid-cols-[260px_1fr]"><div className="space-y-2">{profiles.map((profile) => <button key={`${profile.material}-${profile.name}`} onClick={() => setSelectedKey(`${profile.material}/${profile.name}`)} className={`w-full rounded-xl border p-4 text-left ${selected?.material === profile.material && selected.name === profile.name ? "border-brand-gold/50 bg-brand-gold/10" : "border-slate-800 bg-slate-950/60"}`}><strong className="block text-sm">{profile.material} · {profile.name}</strong><span className="text-xs text-slate-500">Version {profile.version}</span></button>)}</div><div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">{selected ? <ProfileEditor key={`${selected.material}-${selected.name}-${selected.version}`} profile={selected} onChanged={onChanged} setNotice={setNotice} /> : <p className="text-sm text-slate-500">Select a profile.</p>}</div></div></>;
}

function ProfileEditor({ profile, onChanged, setNotice }: { profile: SlicerProfile; onChanged: () => Promise<void>; setNotice: (value: string) => void }) {
  const [json, setJson] = useState(JSON.stringify(profile.config, null, 2));
  async function save() { try { await adminApi.saveProfile({ ...profile, config: JSON.parse(json) as Record<string, unknown> }); setNotice("Slicer profile saved as a new version."); await onChanged(); } catch (error) { setNotice(error instanceof Error ? error.message : "Invalid profile JSON."); } }
  async function remove() { if (!confirm(`Deactivate ${profile.material}/${profile.name}?`)) return; await adminApi.deleteProfile(profile); setNotice("Slicer profile deactivated."); await onChanged(); }
  return <><textarea aria-label="Profile JSON" value={json} onChange={(event) => setJson(event.target.value)} spellCheck={false} className="min-h-[440px] w-full rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 outline-none focus:border-brand-gold/60" /><div className="mt-4 flex gap-3"><button onClick={() => void save()} className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-slate-950">Save new version</button><button onClick={() => void remove()} className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-300">Deactivate</button></div></>;
}

function TemplatesView({ templates, onChanged, setNotice }: { templates: TemplateMap; onChanged: () => Promise<void>; setNotice: (value: string) => void }) {
  const entry = templates.estimate;
  return <><SectionHeading title="Email templates" description="Prepare consistent estimates using submission placeholders." />{entry ? <TemplateEditor key={entry.version} entry={entry} onChanged={onChanged} setNotice={setNotice} /> : <p className="text-sm text-slate-500">No estimate template is configured.</p>}</>;
}

function TemplateEditor({ entry, onChanged, setNotice }: { entry: TemplateMap[string]; onChanged: () => Promise<void>; setNotice: (value: string) => void }) {
  const [subject, setSubject] = useState(entry?.subject ?? "");
  const [body, setBody] = useState(entry?.body ?? "");
  async function save() { await adminApi.saveTemplate("estimate", subject, body); setNotice("Email template saved."); await onChanged(); }
  return <div className="max-w-3xl space-y-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-6"><label className="block space-y-2 text-sm"><span className="text-slate-400">Subject</span><input value={subject} onChange={(event) => setSubject(event.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 outline-none focus:border-brand-gold/60" /></label><label className="block space-y-2 text-sm"><span className="text-slate-400">Body</span><textarea value={body} onChange={(event) => setBody(event.target.value)} rows={14} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-xs outline-none focus:border-brand-gold/60" /></label><p className="text-xs text-slate-500">Available: {`{name}, {fileName}, {printTimeMins}, {filamentGrams}, {projectType}, {material}`}</p><button onClick={() => void save()} className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-slate-950">Save template</button></div>;
}

function JobsView({ jobs, onChanged, setNotice }: { jobs: Job[]; onChanged: () => Promise<void>; setNotice: (value: string) => void }) {
  async function retry(id: number) { await adminApi.retryJob(id); setNotice(`Job ${id} queued for retry.`); await onChanged(); }
  return <><SectionHeading title="System jobs" description="Inspect background processing and recover failed work." /><div className="space-y-3">{jobs.map((job) => <article key={job.id} className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-5 sm:flex-row sm:items-center"><div className="flex-1"><div className="flex items-center gap-3"><strong>Job #{job.id}</strong><Status value={job.status} label={job.type} /></div><p className="mt-2 text-xs text-slate-500">Attempts {job.attemptCount}/{job.maxAttempts} · submission {job.submissionId ?? "system"}</p>{job.lastError && <p className="mt-2 rounded-lg bg-red-500/10 p-2 text-xs text-red-300">{job.lastError}</p>}</div>{job.status !== "complete" && <button onClick={() => void retry(job.id)} className="rounded-lg border border-slate-700 px-4 py-2 text-xs hover:border-brand-gold hover:text-brand-gold">Retry</button>}</article>)}</div></>;
}

function Status({ value, label }: { value: string; label: string }) {
  const good = ["complete", "completed", "disabled", "skipped"].includes(value);
  const bad = ["failed", "partial"].includes(value);
  return <span title={value} className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${good ? "bg-emerald-500/10 text-emerald-400" : bad ? "bg-red-500/10 text-red-300" : "bg-amber-500/10 text-amber-300"}`}>{label}</span>;
}

function SubmissionDrawer({ submission, onClose, onSlice, onEmail }: { submission: Submission; onClose: () => void; onSlice: (id: string) => void; onEmail: (id: string) => void }) {
  return <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><aside className="h-full w-full max-w-xl overflow-y-auto border-l border-slate-800 bg-[#0a0a0b] p-6 sm:p-8"><button onClick={onClose} aria-label="Close submission" className="float-right rounded-lg p-2 text-slate-500 hover:bg-slate-900 hover:text-white"><X className="h-5 w-5" /></button><span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-gold">Project detail</span><h2 className="mt-4 text-2xl font-semibold">{submission.name}</h2><p className="text-sm text-slate-500">{submission.email}</p><div className="mt-8 grid gap-4 sm:grid-cols-2"><Detail icon={Box} label="Model" value={submission.fileName ?? "No model"} /><Detail icon={Settings} label="Material" value={submission.material} /><Detail icon={Clock} label="Print time" value={submission.printTimeSeconds ? `${Math.round(submission.printTimeSeconds / 60)} minutes` : "Pending"} /><Detail icon={FileText} label="Material use" value={submission.filamentGrams ? `${submission.filamentGrams} g` : "Pending"} /></div><div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950 p-5"><h3 className="text-sm font-semibold text-brand-gold">Project description</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-400">{submission.description}</p></div><div className="mt-8 flex gap-3"><button onClick={() => void onSlice(submission.id)} className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-slate-950">Queue slice</button><button onClick={() => void onEmail(submission.id)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:border-brand-gold hover:text-brand-gold">Prepare email</button></div></aside></div>;
}

function Detail({ icon: Icon, label, value }: { icon: typeof Box; label: string; value: string }) {
  return <div className="rounded-xl border border-slate-800 bg-slate-950 p-4"><Icon className="mb-3 h-4 w-4 text-brand-gold" /><p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 text-sm text-slate-200">{value}</p></div>;
}
