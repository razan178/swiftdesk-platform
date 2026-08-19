import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminProductList } from "@/components/admin/AdminProductList";
import { createClient } from "@/lib/supabase/server";
import { getAllProductsForAdmin } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const products = await getAllProductsForAdmin();

  return (
    <AdminShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink/60">Add, edit, and manage your inventory.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          + Add product
        </Link>
      </div>

      <div className="mt-6">
        {products.length === 0 ? (
          <div className="rounded-card border border-dashed border-ink/15 bg-white px-6 py-16 text-center">
            <h2 className="font-display text-xl text-ink">No products yet</h2>
            <p className="mt-2 text-sm text-ink/60">Add your first pair of shoes to get the shop live.</p>
            <Link href="/admin/products/new" className="mt-5 inline-block rounded-full bg-volt px-6 py-3 text-sm font-bold text-ink">
              Add your first product
            </Link>
          </div>
        ) : (
          <AdminProductList products={products} />
        )}
      </div>
    </AdminShell>
  );
}
