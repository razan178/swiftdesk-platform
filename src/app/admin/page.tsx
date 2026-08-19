import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import { getStats, getAllProductsForAdmin } from "@/lib/products";
import { formatPrice, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Defense in depth: middleware guards this route, but verify server-side too.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [stats, products] = await Promise.all([getStats(), getAllProductsForAdmin()]);
  const recent = products.slice(0, 5);

  const cards = [
    { label: "Total products", value: stats.total, accent: "bg-ink text-white" },
    { label: "Available", value: stats.available, accent: "bg-volt text-ink" },
    { label: "Sold", value: stats.sold, accent: "bg-white text-ink border border-ink/10" },
  ];

  return (
    <AdminShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-ink/60">Welcome back — here&apos;s your store at a glance.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          + Add product
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-card p-6 ${c.accent}`}>
            <p className="text-sm font-semibold opacity-80">{c.label}</p>
            <p className="mt-2 font-display text-4xl">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-card border border-ink/10 bg-white">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <h2 className="font-display text-lg text-ink">Recently added</h2>
          <Link href="/admin/products" className="text-sm font-semibold text-ink hover:underline">
            Manage all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-ink/60">No products yet.</p>
            <Link href="/admin/products/new" className="mt-3 inline-block rounded-full bg-volt px-5 py-2.5 text-sm font-bold text-ink">
              Add your first product
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-ink/5">
            {recent.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <Link href={`/admin/products/${p.id}/edit`} className="font-semibold text-ink hover:underline">
                    {p.brand} {p.name}
                  </Link>
                  <p className="text-xs text-ink/50">
                    {formatPrice(p.price)} · Size {p.size} · added {timeAgo(p.created_at)}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold uppercase ${p.status === "sold" ? "bg-ink text-white" : "bg-volt text-ink"}`}>
                  {p.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
