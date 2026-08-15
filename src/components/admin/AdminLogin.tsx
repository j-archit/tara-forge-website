"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";

export function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error("The email or password was not accepted.");
      const requested = searchParams.get("returnTo");
      router.replace(requested?.startsWith("/admin") ? requested : "/admin");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="grid min-h-screen bg-[#07090d] text-slate-100 lg:grid-cols-[1.1fr_.9fr]">
    <section className="relative hidden overflow-hidden border-r border-white/8 lg:flex lg:flex-col lg:justify-between lg:p-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,168,76,.18),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(59,130,246,.10),transparent_38%)]" />
      <div className="relative flex items-center gap-3"><Logo className="h-10 w-10" /><span className="text-lg font-semibold">TaraForge<span className="text-brand-gold">3D</span></span></div>
      <div className="relative max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-gold">Control room</p><h1 className="mt-5 text-5xl font-semibold leading-[1.08] tracking-tight text-white">Run the forge from one focused workspace.</h1><p className="mt-6 max-w-lg text-base leading-7 text-slate-500">Inquiries, prior prints, the store catalogue, slicing, and system health—backed by one private application service.</p></div>
      <div className="relative flex items-center gap-2 text-xs text-slate-600"><ShieldCheck className="h-4 w-4 text-emerald-400" />Protected by server-side sessions and CSRF validation</div>
    </section>
    <section className="flex items-center justify-center px-6 py-14 sm:px-10">
      <div className="w-full max-w-md"><div className="mb-10 lg:hidden"><Logo className="h-12 w-12" /></div><p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-gold">Administrator access</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Welcome back.</h2><p className="mt-2 text-sm text-slate-500">Use your operations account to continue.</p>
        <form className="mt-9 space-y-5" onSubmit={submit}>
          <label className="block space-y-2 text-xs font-medium text-slate-400"><span>Email</span><input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3.5 text-sm text-white outline-none focus:border-brand-gold/50" /></label>
          <label className="block space-y-2 text-xs font-medium text-slate-400"><span>Password</span><div className="relative"><LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-700" /><input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.025] py-3.5 pl-11 pr-4 text-sm text-white outline-none focus:border-brand-gold/50" /></div></label>
          {error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-300">{error}</p>}
          <button disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 py-3.5 text-sm font-semibold text-slate-950 hover:bg-brand-gold-bright disabled:opacity-60">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}Sign in</button>
        </form>
      </div>
    </section>
  </main>;
}
