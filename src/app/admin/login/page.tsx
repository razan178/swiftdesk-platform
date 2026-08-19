"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const configured = isSupabaseConfigured();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Incorrect email or password. Please try again.");
        setLoading(false);
        return;
      }
      const redirect = params.get("redirect") || "/admin";
      router.push(redirect);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="font-display text-2xl text-white">
            ISLAMABAD<span className="ml-1 rounded bg-volt px-1.5 text-ink">THRIFT</span>
          </span>
          <p className="mt-2 text-sm text-white/50">Admin sign in</p>
        </div>

        {!configured ? (
          <div className="rounded-card border border-volt/40 bg-white p-6 text-sm text-ink">
            <h1 className="font-display text-lg">Setup needed</h1>
            <p className="mt-2 text-ink/70">
              The store isn&apos;t connected to its database yet. Add your Supabase keys
              (<code className="rounded bg-paper px-1">NEXT_PUBLIC_SUPABASE_URL</code> and
              <code className="rounded bg-paper px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>) in your
              environment / Netlify settings, then reload this page. See{" "}
              <code className="rounded bg-paper px-1">README.md</code> for step-by-step instructions.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-card bg-white p-6 shadow-lg">
            <label className="block text-sm font-semibold text-ink" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-ink/15 px-3 py-2.5 text-ink focus:border-ink focus:outline-none"
            />

            <label className="mt-4 block text-sm font-semibold text-ink" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-ink/15 px-3 py-2.5 text-ink focus:border-ink focus:outline-none"
            />

            {error && (
              <p role="alert" className="mt-4 rounded-lg bg-flame/10 px-3 py-2 text-sm font-medium text-flame">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-ink py-3 font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-white/50 hover:text-white">← Back to store</Link>
        </p>
      </div>
    </div>
  );
}
