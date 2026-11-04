import type { Metadata } from "next";
import SettingsForm from "@/components/admin/SettingsForm";
import NotificacoesForm from "@/components/admin/NotificacoesForm";
import { PageHeader } from "@/components/admin/ui";
import { getSettings } from "@/lib/data";
import { requireAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const { papel, supabase } = await requireAdmin();
  const s = await getSettings();
  if (papel !== "admin") {
    return (
      <>
        <PageHeader titulo="Configurações" descricao="WhatsApp, avisos, rastreamento e textos da página inicial." />
        <p className="card p-4 text-sm text-ink-soft">Somente administradores podem alterar as configurações.</p>
      </>
    );
  }
  const { data: n } = await supabase.from("notification_settings").select("*").eq("id", 1).maybeSingle();
  return (
    <>
      <PageHeader titulo="Configurações" descricao="WhatsApp, avisos, rastreamento e textos da página inicial." />
      <SettingsForm s={s} />
      <NotificacoesForm
        n={{
          email_ativo: !!n?.email_ativo,
          email_destino: n?.email_destino ?? null,
          tem_resend: !!n?.resend_api_key,
          whatsapp_ativo: !!n?.whatsapp_ativo,
          whatsapp_numero: n?.whatsapp_numero ?? null,
          tem_callmebot: !!n?.callmebot_api_key,
          notificar_incompletas: n?.notificar_incompletas ?? true,
        }}
      />
    </>
  );
}
