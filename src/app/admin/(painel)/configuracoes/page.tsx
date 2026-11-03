import type { Metadata } from "next";
import SettingsForm from "@/components/admin/SettingsForm";
import { PageHeader } from "@/components/admin/ui";
import { getSettings } from "@/lib/data";
import { requireAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const { papel } = await requireAdmin();
  const s = await getSettings();
  return (
    <>
      <PageHeader titulo="Configurações" descricao="WhatsApp, rastreamento e textos da página inicial." />
      {papel === "admin" ? <SettingsForm s={s} /> : <p className="card p-4 text-sm text-ink-soft">Somente administradores podem alterar as configurações.</p>}
    </>
  );
}
