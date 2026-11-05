import type { Metadata } from "next";
import { requireAdmin } from "@/lib/server/auth";
import AdminNav from "@/components/admin/AdminNav";
import { sair } from "../actions";

export const metadata: Metadata = { title: { default: "Painel", template: "%s | Painel" }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const adm = await requireAdmin();
  return (
    <div className="min-h-dvh bg-mist lg:flex">
      <aside className="border-b border-line bg-white lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:shrink-0 lg:border-r lg:border-b-0">
        <AdminNav />
        <div className="hidden border-t border-line p-4 text-xs text-ink-soft lg:block">
          <p className="font-semibold text-ink">{adm.nome}</p>
          <p className="truncate">{adm.email}</p>
          <p className="mt-0.5 capitalize">{adm.papel}</p>
          <form action={sair} className="mt-3">
            <button className="font-semibold text-caixa hover:underline">Sair</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:py-6">{children}</main>
    </div>
  );
}
