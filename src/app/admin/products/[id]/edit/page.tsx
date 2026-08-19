import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { createClient } from "@/lib/supabase/server";
import { getProductById } from "@/lib/products";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <AdminShell>
      <nav className="mb-4 text-sm text-ink/50">
        <Link href="/admin/products" className="hover:text-ink">Products</Link> / Edit
      </nav>
      <h1 className="mb-6 font-display text-3xl text-ink">
        Edit <span className="text-ink/60">{product.brand} {product.name}</span>
      </h1>
      <ProductForm product={product} />
    </AdminShell>
  );
}
