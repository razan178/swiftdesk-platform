import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  return (
    <AdminShell>
      <nav className="mb-4 text-sm text-ink/50">
        <Link href="/admin/products" className="hover:text-ink">Products</Link> / Add product
      </nav>
      <h1 className="mb-6 font-display text-3xl text-ink">Add product</h1>
      <ProductForm />
    </AdminShell>
  );
}
