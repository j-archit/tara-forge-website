"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LockKeyhole } from "lucide-react";
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

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-950/85 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="mb-5 h-16 w-16" />
          <span className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-brand-gold">Forge Operations</span>
          <h1 className="text-3xl font-semibold text-slate-50">Administrator access</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to review projects and manage production.</p>
        </div>
        <form className="space-y-5" onSubmit={submit}>
          <label className="block space-y-2 text-sm text-slate-300">
            <span>Email</span>
            <input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 outline-none transition focus:border-brand-gold/70"
            />
          </label>
          <label className="block space-y-2 text-sm text-slate-300">
            <span>Password</span>
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 outline-none transition focus:border-brand-gold/70"
            />
          </label>
          {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
          <button
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 py-3 font-semibold text-slate-950 transition hover:bg-brand-gold-bright disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
