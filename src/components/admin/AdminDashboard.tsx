"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity, AlertTriangle, Clock3, ExternalLink, Eye, EyeOff, Images, Inbox,
  LayoutDashboard, LogOut, PackageCheck, Pencil, Plus, RefreshCw, Save, Search,
  ShoppingBag, SlidersHorizontal, Trash2, Users, X,
} from "lucide-react";
import {
  adminApi, ApiError, type Client, type GalleryItem, type GalleryItemInput, type Job,
  type SlicerProfile, type StoreItem, type Submission, type TemplateMap,
} from "@/lib/admin-api";

type Section = "overview" | "inquiries" | "customers" | "gallery" | "store" | "production" | "system";

const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "inquiries", label: "Inquiries", icon: Inbox },
  { id: "customers", label: "Customers", icon: Users },
  { id: "gallery", label: "Prior prints", icon: Images },
  { id: "store", label: "Store", icon: ShoppingBag },
  { id: "production", label: "Production", icon: SlidersHorizontal },
  { id: "system", label: "System", icon: Activity },
] satisfies { id: Section; label: string; icon: typeof LayoutDashboard }[];

type Data = {
  submissions: Submission[];
  clients: Client[];
  gallery: GalleryItem[];
  store: StoreItem[];
  profiles: SlicerProfile[];
  templates: TemplateMap;
  jobs: Job[];
};

const emptyData: Data = { submissions: [], clients: [], gallery: [], store: [], profiles: [], templates: {}, jobs: [] };

export function AdminDashboard() {
  const router = useRouter();
  const [section, setSection] = useState<Section>("overview");
  const [data, setData] = useState<Data>(emptyData);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await adminApi.session();
      const [submissions, clients, gallery, store, profiles, templates, jobs] = await Promise.all([
        adminApi.submissions(), adminApi.clients(), adminApi.gallery(), adminApi.store(), adminApi.profiles(),
        adminApi.templates(), adminApi.jobs(),
      ]);
      setData({ submissions, clients, gallery, store, profiles, templates, jobs });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.replace("/admin/login");
      else setNotice(error instanceof Error ? error.message : "The admin workspace could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { void load(); }, [load]);

  async function logout() {
    await adminApi.logout();
    router.replace("/admin/login");
    router.refresh();
  }

  async function action(work: () => Promise<unknown>, success: string) {
    try {
      await work();
      setNotice(success);
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The change could not be saved.");
    }
  }

  const active = navigation.find((item) => item.id === section)!;
  return (
    <main className="min-h-screen bg-[#07090d] text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/8 bg-[#0b0e14] xl:flex xl:flex-col">
        <div className="border-b border-white/8 px-7 py-7">
          <p className="text-lg font-semibold tracking-tight text-white">TaraForge<span className="text-brand-gold">3D</span></p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-600">Control room</p>
        </div>
        <nav className="flex-1 space-y-1.5 p-4" aria-label="Admin workspace">
          {navigation.map((item) => <NavButton key={item.id} item={item} active={section === item.id} onClick={() => setSection(item.id)} />)}
        </nav>
        <div className="space-y-1 border-t border-white/8 p-4">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white"><ExternalLink className="h-4 w-4" />Public website</Link>
          <button onClick={() => void logout()} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-300"><LogOut className="h-4 w-4" />Sign out</button>
        </div>
      </aside>

      <div className="xl:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/8 bg-[#07090d]/90 px-5 py-4 backdrop-blur-xl sm:px-8">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gold">Workspace</p><h1 className="text-xl font-semibold text-white">{active.label}</h1></div>
            <div className="flex items-center gap-2">
              <span className={`hidden rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider sm:block ${loading ? "bg-amber-500/10 text-amber-300" : "bg-emerald-500/10 text-emerald-300"}`}>{loading ? "Syncing" : "Live"}</span>
              <button onClick={() => void load()} aria-label="Refresh workspace" className="rounded-xl border border-white/10 p-2.5 text-slate-400 hover:border-brand-gold/40 hover:text-brand-gold"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button>
            </div>
          </div>
          <nav className="mx-auto mt-4 flex max-w-[1500px] gap-2 overflow-x-auto xl:hidden" aria-label="Admin workspace">
            {navigation.map((item) => <NavButton key={item.id} item={item} active={section === item.id} compact onClick={() => setSection(item.id)} />)}
          </nav>
        </header>

        <div className="mx-auto max-w-[1500px] p-5 sm:p-8">
          {notice && <div role="status" className="mb-6 flex items-center justify-between rounded-2xl border border-brand-gold/25 bg-brand-gold/8 px-4 py-3 text-sm text-brand-gold"><span>{notice}</span><button aria-label="Dismiss notice" onClick={() => setNotice("")}><X className="h-4 w-4" /></button></div>}
          {section === "overview" && <Overview data={data} navigate={setSection} />}
          {section === "inquiries" && <Inquiries submissions={data.submissions} action={action} />}
          {section === "customers" && <Customers clients={data.clients} submissions={data.submissions} />}
          {section === "gallery" && <GalleryStudio items={data.gallery} action={action} />}
          {section === "store" && <StoreStudio items={data.store} action={action} />}
          {section === "production" && <Production profiles={data.profiles} templates={data.templates} action={action} />}
          {section === "system" && <SystemJobs jobs={data.jobs} action={action} />}
        </div>
      </div>
    </main>
  );
}

function NavButton({ item, active, compact, onClick }: { item: (typeof navigation)[number]; active: boolean; compact?: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return <button onClick={onClick} className={`flex items-center gap-3 rounded-xl text-sm transition ${compact ? "shrink-0 px-3 py-2" : "w-full px-4 py-3"} ${active ? "bg-brand-gold text-slate-950 shadow-[0_8px_30px_rgba(201,168,76,0.15)]" : "text-slate-500 hover:bg-white/5 hover:text-slate-200"}`}><Icon className="h-4 w-4" /><span className="font-medium">{item.label}</span></button>;
}

function Overview({ data, navigate }: { data: Data; navigate: (section: Section) => void }) {
  const failed = data.jobs.filter((job) => job.status === "failed").length;
  const pending = data.submissions.filter((item) => !["complete", "failed"].includes(item.status)).length;
  const cards = [
    { label: "Open inquiries", value: pending, detail: `${data.submissions.length} total`, icon: Inbox, target: "inquiries" as Section },
    { label: "Published prints", value: data.gallery.filter((item) => item.published).length, detail: `${data.gallery.length} managed`, icon: Images, target: "gallery" as Section },
    { label: "Store listings", value: data.store.filter((item) => item.published).length, detail: `${data.store.filter((item) => item.available).length} available`, icon: ShoppingBag, target: "store" as Section },
    { label: "Failed jobs", value: failed, detail: failed ? "Needs attention" : "Pipeline healthy", icon: failed ? AlertTriangle : PackageCheck, target: "system" as Section },
  ];
  return <div className="space-y-8"><section><Eyebrow>Today at the forge</Eyebrow><h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Everything that needs your attention.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Manage incoming work, public proof, product listings, and the production pipeline from one backend.</p></section><div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">{cards.map(({ label, value, detail, icon: Icon, target }) => <button key={label} onClick={() => navigate(target)} className="group rounded-2xl border border-white/8 bg-white/[0.025] p-5 text-left hover:border-brand-gold/30 hover:bg-brand-gold/[0.04]"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-3 text-4xl font-semibold text-white">{value}</p></div><span className="rounded-xl bg-white/5 p-3 text-brand-gold"><Icon className="h-5 w-5" /></span></div><p className="mt-4 text-xs text-slate-600">{detail}</p></button>)}</div><section className="rounded-3xl border border-white/8 bg-gradient-to-br from-white/[0.045] to-transparent p-6"><h3 className="font-semibold text-white">Recent inquiries</h3><div className="mt-5 divide-y divide-white/6">{data.submissions.slice(0, 5).map((item) => <div key={item.id} className="flex items-center justify-between gap-4 py-4"><div><p className="text-sm font-medium text-slate-200">{item.name}</p><p className="text-xs text-slate-600">{item.fileName ?? item.projectType} · {item.material}</p></div><Pill value={item.status} /></div>)}{!data.submissions.length && <Empty message="No inquiries yet." />}</div></section></div>;
}

function Inquiries({ submissions, action }: { submissions: Submission[]; action: Action }) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => submissions.filter((item) => [item.name, item.email, item.fileName, item.material].filter(Boolean).join(" ").toLowerCase().includes(query.toLowerCase())), [submissions, query]);
  return <section><SectionTitle title="Inquiry desk" description="Review requests, estimates, and integration progress." /><div className="mb-5 max-w-lg"><FieldIcon><Search className="h-4 w-4" /><input aria-label="Search inquiries" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, file, material…" /></FieldIcon></div><div className="overflow-hidden rounded-2xl border border-white/8"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-white/[0.025] text-[10px] uppercase tracking-[0.16em] text-slate-600"><tr><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Project</th><th className="px-5 py-4">Estimate</th><th className="px-5 py-4">Pipeline</th><th className="px-5 py-4">Actions</th></tr></thead><tbody className="divide-y divide-white/6">{visible.map((item) => <tr key={item.id} className="bg-white/[0.012] hover:bg-white/[0.03]"><td className="px-5 py-4"><strong className="block text-slate-200">{item.name}</strong><span className="text-xs text-slate-600">{item.email}</span></td><td className="px-5 py-4"><span>{item.fileName ?? "No model"}</span><span className="mt-1 block text-xs text-slate-600">{item.projectType} · {item.material}</span></td><td className="px-5 py-4 text-xs text-slate-400">{item.printTimeSeconds ? `${Math.round(item.printTimeSeconds / 60)} min · ${item.filamentGrams ?? 0} g` : "Pending"}</td><td className="px-5 py-4"><div className="flex gap-2"><Pill value={item.slicerStatus} label="Slice" /><Pill value={item.googleDriveStatus} label="Drive" /></div></td><td className="px-5 py-4"><div className="flex gap-2"><SmallButton onClick={() => void action(() => adminApi.slice(item.id), "Slicing queued.")}>Slice</SmallButton><SmallButton onClick={() => void adminApi.email(item.id).then((email) => { window.location.href = email.mailto; })}>Email</SmallButton></div></td></tr>)}</tbody></table></div>{!visible.length && <Empty message="No inquiries match this search." />}</div></section>;
}

function Customers({ clients, submissions }: { clients: Client[]; submissions: Submission[] }) {
  const [query, setQuery] = useState("");
  const visible = clients.filter((client) => `${client.name} ${client.email}`.toLowerCase().includes(query.toLowerCase()));
  return <section><SectionTitle title="Customers" description="Contact history consolidated across every inquiry." /><div className="mb-5 max-w-lg"><FieldIcon><Search className="h-4 w-4" /><input aria-label="Search customers" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or email…" /></FieldIcon></div><div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{visible.map((client) => { const projects = submissions.filter((item) => item.email === client.email); return <article key={client.id} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5"><div className="flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gold/10 font-semibold text-brand-gold">{client.name.slice(0, 1).toUpperCase()}</div><span className="text-xs text-slate-600">{projects.length} project{projects.length === 1 ? "" : "s"}</span></div><h3 className="mt-5 font-semibold text-white">{client.name}</h3><a className="mt-1 block text-sm text-slate-500 hover:text-brand-gold" href={`mailto:${client.email}`}>{client.email}</a><div className="mt-4 flex flex-wrap gap-2">{projects.slice(0, 3).map((project) => <Pill key={project.id} value={project.status} label={project.material} />)}</div></article>; })}{!visible.length && <Empty message="No customers match this search." />}</div></section>;
}

type Action = (work: () => Promise<unknown>, success: string) => Promise<void>;

function GalleryStudio({ items, action }: { items: GalleryItem[]; action: Action }) {
  const [editing, setEditing] = useState<GalleryItem | "new" | null>(null);
  return <section><SectionTitle title="Prior prints" description="Curate the proof-of-work cards shown in the public gallery." action={<PrimaryButton onClick={() => setEditing("new")}><Plus className="h-4 w-4" />Add print</PrimaryButton>} /><div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{items.map((item) => <ContentCard key={item.id} imageUrl={item.imageUrl} gradient={item.gradient} accent={item.accent} title={item.title} category={item.category} published={item.published} meta={`${item.tags.join(" · ") || "No tags"} · position ${item.sortOrder}`} onEdit={() => setEditing(item)} onDelete={() => confirm(`Delete ${item.title}?`) && void action(() => adminApi.deleteGallery(item.id), "Gallery item deleted.")} />)}{!items.length && <Empty message="No gallery items. Add your first prior print." />}</div>{editing && <GalleryEditor item={editing === "new" ? null : editing} close={() => setEditing(null)} save={(item) => action(() => "id" in item ? adminApi.saveGallery(item) : adminApi.createGallery(item), "Gallery item saved.").then(() => setEditing(null))} />}</section>;
}

function StoreStudio({ items, action }: { items: StoreItem[]; action: Action }) {
  const [editing, setEditing] = useState<StoreItem | "new" | null>(null);
  return <section><SectionTitle title="Store catalogue" description="Control product copy, pricing, availability, and publication." action={<PrimaryButton onClick={() => setEditing("new")}><Plus className="h-4 w-4" />Add listing</PrimaryButton>} /><div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{items.map((item) => <ContentCard key={item.id} imageUrl={item.imageUrl} gradient={item.gradient} accent={item.accent} title={item.title} category={item.category} published={item.published} meta={`${item.currency}${(item.pricePaise / 100).toLocaleString()} · ${item.available ? "Available" : "Inquiry only"}`} onEdit={() => setEditing(item)} onDelete={() => confirm(`Delete ${item.title}?`) && void action(() => adminApi.deleteStore(item.id), "Store listing deleted.")} />)}{!items.length && <Empty message="No store listings yet." />}</div>{editing && <StoreEditor item={editing === "new" ? null : editing} close={() => setEditing(null)} save={(item, existing) => action(() => existing ? adminApi.saveStore(item) : adminApi.createStore(item), "Store listing saved.").then(() => setEditing(null))} />}</section>;
}

function ContentCard({ imageUrl, gradient, accent, title, category, published, meta, onEdit, onDelete }: { imageUrl: string | null; gradient: string; accent: string; title: string; category: string; published: boolean; meta: string; onEdit: () => void; onDelete: () => void }) {
  return <article className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02]"><div className={`relative aspect-[16/8] bg-gradient-to-br ${gradient}`} style={imageUrl ? { backgroundImage: `linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.6)),url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}><div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 40%, ${accent}, transparent 70%)` }} /><span className={`absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${published ? "bg-emerald-400/15 text-emerald-200" : "bg-slate-950/70 text-slate-400"}`}>{published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}{published ? "Published" : "Hidden"}</span></div><div className="p-5"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold">{category}</p><h3 className="mt-2 font-semibold text-white">{title}</h3><p className="mt-2 text-xs text-slate-600">{meta}</p><div className="mt-5 flex gap-2"><SmallButton onClick={onEdit}><Pencil className="h-3.5 w-3.5" />Edit</SmallButton><SmallButton danger onClick={onDelete}><Trash2 className="h-3.5 w-3.5" />Delete</SmallButton></div></div></article>;
}

function GalleryEditor({ item, close, save }: { item: GalleryItem | null; close: () => void; save: (item: GalleryItem | GalleryItemInput) => Promise<void> }) {
  const [value, setValue] = useState<GalleryItem | GalleryItemInput>(item ?? { title: "", category: "Prior prints", description: "", tags: [], imageUrl: null, gradient: "from-slate-800 via-slate-950 to-slate-950", accent: "rgba(201,168,76,0.45)", published: false, sortOrder: 0 });
  return <Editor title={item ? "Edit prior print" : "Add prior print"} close={close} save={() => save(value)}><TextField label="Title" value={value.title} set={(title) => setValue({ ...value, title })} /><TextField label="Category" value={value.category} set={(category) => setValue({ ...value, category })} /><TextArea label="Description" value={value.description} set={(description) => setValue({ ...value, description })} /><TextField label="Tags (comma separated)" required={false} value={value.tags.join(", ")} set={(tags) => setValue({ ...value, tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean) })} /><ImageField value={value.imageUrl} set={(imageUrl) => setValue({ ...value, imageUrl })} /><VisualFields value={value} set={setValue} /><Toggle label="Published on gallery" checked={value.published} set={(published) => setValue({ ...value, published })} /></Editor>;
}

function StoreEditor({ item, close, save }: { item: StoreItem | null; close: () => void; save: (item: StoreItem, existing: boolean) => Promise<void> }) {
  const [value, setValue] = useState<StoreItem>(item ?? { id: "", title: "", category: "", description: "", pricePaise: 0, currency: "₹", imageUrl: null, gradient: "from-slate-800 via-slate-950 to-slate-950", accent: "rgba(201,168,76,0.45)", badge: null, published: false, available: false, sortOrder: 0 });
  return <Editor title={item ? "Edit store listing" : "Add store listing"} close={close} save={() => save(value, Boolean(item))}><TextField label="Slug / SKU" value={value.id} disabled={Boolean(item)} set={(id) => setValue({ ...value, id })} /><TextField label="Title" value={value.title} set={(title) => setValue({ ...value, title })} /><TextField label="Category" value={value.category} set={(category) => setValue({ ...value, category })} /><TextArea label="Description" value={value.description} set={(description) => setValue({ ...value, description })} /><div className="grid grid-cols-2 gap-4"><TextField label="Price (₹)" type="number" value={(value.pricePaise / 100).toString()} set={(price) => setValue({ ...value, pricePaise: Math.round(Number(price) * 100) || 0 })} /><TextField label="Badge" required={false} value={value.badge ?? ""} set={(badge) => setValue({ ...value, badge: badge || null })} /></div><ImageField value={value.imageUrl} set={(imageUrl) => setValue({ ...value, imageUrl })} /><VisualFields value={value} set={setValue} /><div className="grid gap-3 sm:grid-cols-2"><Toggle label="Published in store" checked={value.published} set={(published) => setValue({ ...value, published })} /><Toggle label="Available to buy" checked={value.available} set={(available) => setValue({ ...value, available })} /></div></Editor>;
}

function VisualFields<T extends { gradient: string; accent: string; sortOrder: number }>({ value, set }: { value: T; set: (value: T) => void }) {
  return <div className="grid gap-4 sm:grid-cols-2"><TextField label="Gradient classes" value={value.gradient} set={(gradient) => set({ ...value, gradient })} /><TextField label="Accent colour" value={value.accent} set={(accent) => set({ ...value, accent })} /><TextField label="Display position" type="number" value={value.sortOrder.toString()} set={(sortOrder) => set({ ...value, sortOrder: Number(sortOrder) || 0 })} /></div>;
}

function ImageField({ value, set }: { value: string | null; set: (value: string | null) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  async function upload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const result = await adminApi.uploadMedia(file);
      set(result.url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }
  return <div className="space-y-3"><TextField label="Image URL" required={false} value={value ?? ""} set={(imageUrl) => set(imageUrl || null)} /><label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/15 px-4 py-4 text-xs text-slate-500 hover:border-brand-gold/40 hover:text-brand-gold"><input aria-label="Upload image" className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={(event) => void upload(event.target.files?.[0])} />{uploading ? "Uploading image…" : "Upload PNG, JPG, or WebP"}</label>{error && <p className="text-xs text-red-300">{error}</p>}{value && <div className="aspect-[16/7] rounded-xl border border-white/8 bg-cover bg-center" style={{ backgroundImage: `url(${value})` }} />}</div>;
}

function Production({ profiles, templates, action }: { profiles: SlicerProfile[]; templates: TemplateMap; action: Action }) {
  const [profileKey, setProfileKey] = useState(profiles[0] ? `${profiles[0].material}/${profiles[0].name}` : "");
  const profile = profiles.find((item) => `${item.material}/${item.name}` === profileKey) ?? profiles[0];
  const template = templates.estimate;
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [body, setBody] = useState(template?.body ?? "");
  return <section><SectionTitle title="Production settings" description="Versioned slicer configuration and customer estimate messaging." /><div className="grid gap-6 2xl:grid-cols-2"><Panel title="Slicer profiles" subtitle={profile ? `${profile.material} · ${profile.name} · v${profile.version}` : "No active profile"}>{profiles.length > 1 && <label className="block space-y-2 text-xs font-medium text-slate-400"><span>Active editor</span><select aria-label="Slicer profile" value={profileKey} onChange={(event) => setProfileKey(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b0e14] px-4 py-3 text-sm text-white outline-none focus:border-brand-gold/50">{profiles.map((item) => <option key={`${item.material}/${item.name}`} value={`${item.material}/${item.name}`}>{item.material} · {item.name} · v{item.version}</option>)}</select></label>}<ProfileSettings key={profile ? `${profile.material}/${profile.name}/${profile.version}` : "empty"} profile={profile} action={action} /></Panel><Panel title="Estimate email" subtitle="Available placeholders are preserved by the backend."><TextField label="Subject" value={subject} set={setSubject} /><TextArea label="Body" rows={13} mono value={body} set={setBody} />{template && <PrimaryButton onClick={() => void action(() => adminApi.saveTemplate("estimate", subject, body), "Estimate template saved.")}><Save className="h-4 w-4" />Save template</PrimaryButton>}</Panel></div></section>;
}

function ProfileSettings({ profile, action }: { profile: SlicerProfile | undefined; action: Action }) {
  const [profileJson, setProfileJson] = useState(profile ? JSON.stringify(profile.config, null, 2) : "{}");
  return <><TextArea label="Profile JSON" rows={16} mono value={profileJson} set={setProfileJson} />{profile && <PrimaryButton onClick={() => void action(() => adminApi.saveProfile({ ...profile, config: JSON.parse(profileJson) }), "Slicer profile version created.")}><Save className="h-4 w-4" />Save version</PrimaryButton>}</>;
}

function SystemJobs({ jobs, action }: { jobs: Job[]; action: Action }) {
  return <section><SectionTitle title="System jobs" description="Inspect background work and explicitly retry failures." /><div className="space-y-3">{jobs.map((job) => <article key={job.id} className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-5 sm:flex-row sm:items-center"><div className="flex-1"><div className="flex items-center gap-3"><strong className="text-sm text-white">Job #{job.id}</strong><Pill value={job.status} label={job.type} /></div><p className="mt-2 flex items-center gap-2 text-xs text-slate-600"><Clock3 className="h-3.5 w-3.5" />Attempt {job.attemptCount}/{job.maxAttempts} · {job.submissionId ?? "system"}</p>{job.lastError && <p className="mt-3 rounded-xl bg-red-500/8 p-3 text-xs text-red-300">{job.lastError}</p>}</div>{job.status !== "complete" && <SmallButton onClick={() => void action(() => adminApi.retryJob(job.id), `Job ${job.id} queued.`)}>Retry job</SmallButton>}</article>)}{!jobs.length && <Empty message="No background jobs." />}</div></section>;
}

function Editor({ title, close, save, children }: { title: string; close: () => void; save: () => Promise<void>; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm" onMouseDown={(event) => event.currentTarget === event.target && close()}><aside className="h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-[#0b0e14] p-6 sm:p-8"><div className="mb-8 flex items-center justify-between"><div><Eyebrow>Content editor</Eyebrow><h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2></div><button aria-label="Close editor" onClick={close} className="rounded-xl border border-white/10 p-2 text-slate-500 hover:text-white"><X className="h-5 w-5" /></button></div><form className="space-y-5" onSubmit={(event) => { event.preventDefault(); void save(); }}>{children}<div className="sticky bottom-0 -mx-2 flex justify-end gap-3 border-t border-white/8 bg-[#0b0e14]/95 px-2 py-5 backdrop-blur"><SmallButton onClick={close}>Cancel</SmallButton><PrimaryButton type="submit"><Save className="h-4 w-4" />Save changes</PrimaryButton></div></form></aside></div>;
}

function SectionTitle({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) { return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><Eyebrow>Manage</Eyebrow><h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">{title}</h2><p className="mt-2 text-sm text-slate-500">{description}</p></div>{action}</div>; }
function Eyebrow({ children }: { children: React.ReactNode }) { return <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-gold">{children}</p>; }
function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <div className="space-y-5 rounded-2xl border border-white/8 bg-white/[0.02] p-6"><div><h3 className="font-semibold text-white">{title}</h3><p className="mt-1 text-xs text-slate-600">{subtitle}</p></div>{children}</div>; }
function TextField({ label, value, set, type = "text", disabled = false, required = true }: { label: string; value: string; set: (value: string) => void; type?: string; disabled?: boolean; required?: boolean }) { return <label className="block space-y-2 text-xs font-medium text-slate-400"><span>{label}</span><input required={required} disabled={disabled} type={type} value={value} onChange={(event) => set(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-brand-gold/50 disabled:opacity-50" /></label>; }
function TextArea({ label, value, set, rows = 5, mono = false }: { label: string; value: string; set: (value: string) => void; rows?: number; mono?: boolean }) { return <label className="block space-y-2 text-xs font-medium text-slate-400"><span>{label}</span><textarea required rows={rows} value={value} onChange={(event) => set(event.target.value)} className={`w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-brand-gold/50 ${mono ? "font-mono text-xs" : ""}`} /></label>; }
function Toggle({ label, checked, set }: { label: string; checked: boolean; set: (checked: boolean) => void }) { return <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/8 bg-black/15 px-4 py-3 text-sm text-slate-300"><span>{label}</span><input type="checkbox" checked={checked} onChange={(event) => set(event.target.checked)} className="h-4 w-4 accent-amber-400" /></label>; }
function PrimaryButton({ children, onClick, type = "button" }: { children: React.ReactNode; onClick?: () => void; type?: "button" | "submit" }) { return <button type={type} onClick={onClick} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-brand-gold-bright">{children}</button>; }
function SmallButton({ children, onClick, danger = false }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) { return <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs ${danger ? "border-red-500/20 text-red-300 hover:bg-red-500/10" : "border-white/10 text-slate-300 hover:border-brand-gold/30 hover:text-brand-gold"}`}>{children}</button>; }
function FieldIcon({ children }: { children: React.ReactNode }) { return <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-slate-600 focus-within:border-brand-gold/40 [&_input]:w-full [&_input]:bg-transparent [&_input]:text-sm [&_input]:text-white [&_input]:outline-none">{children}</label>; }
function Pill({ value, label }: { value: string; label?: string }) { const good = ["complete", "completed", "disabled", "skipped"].includes(value); const bad = ["failed", "partial"].includes(value); return <span title={value} className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${good ? "bg-emerald-500/10 text-emerald-300" : bad ? "bg-red-500/10 text-red-300" : "bg-amber-500/10 text-amber-300"}`}>{label ?? value}</span>; }
function Empty({ message }: { message: string }) { return <p className="col-span-full p-10 text-center text-sm text-slate-600">{message}</p>; }
