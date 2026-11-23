import type { Metadata } from "next";
import SettingsForm from "@/components/admin/SettingsForm";
import NotificacoesForm from "@/components/admin/NotificacoesForm";
import PerfilCorretoraForm from "@/components/admin/PerfilCorretoraForm";
import IntegracaoEquipeForm from "@/components/admin/IntegracaoEquipeForm";
import { siteUrl } from "@/lib/server/notificacoes";
import { AbasSecao, ABAS_CONFIG } from "@/components/admin/AbasSecao";
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
        <AbasSecao abas={ABAS_CONFIG} atual="/admin/configuracoes" />
      <PageHeader titulo="Configurações" descricao="WhatsApp, avisos, rastreamento e textos da página inicial." />
        <p className="card p-4 text-sm text-ink-soft">Somente administradores podem alterar as configurações.</p>
      </>
    );
  }
  const { data: n } = await supabase.from("notification_settings").select("*").eq("id", 1).maybeSingle();
  const [{ data: eq }, { count: pendentes }, { count: leadsEquipe }] = await Promise.all([
    supabase.from("integracao_equipe").select("*").eq("id", 1).maybeSingle(),
    supabase.from("equipe_saida").select("id", { count: "exact", head: true }).is("enviado_em", null),
    supabase.from("leads").select("id", { count: "exact", head: true }).not("equipe_id", "is", null),
  ]);
  return (
    <>
      <AbasSecao abas={ABAS_CONFIG} atual="/admin/configuracoes" />
      <PageHeader titulo="Configurações" descricao="WhatsApp, avisos, rastreamento e textos da página inicial." />
      <PerfilCorretoraForm nome={s.corretora_nome ?? null} foto={s.corretora_foto_url ?? null} />
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
          lembretes_ativos: n?.lembretes_ativos ?? true,
          resumo_diario: n?.resumo_diario ?? true,
          resumo_hora: n?.resumo_hora ?? 8,
        }}
      />
      <IntegracaoEquipeForm
        i={{
          ativo: !!eq?.ativo,
          chave: eq?.chave ?? null,
          url_retorno: eq?.url_retorno ?? null,
          ultimo_recebido: eq?.ultimo_recebido ?? null,
          ultimo_envio: eq?.ultimo_envio ?? null,
          ultimo_erro: eq?.ultimo_erro ?? null,
          pendentes: pendentes ?? 0,
          leads: leadsEquipe ?? 0,
          endereco: `${siteUrl()}/api/equipe/leads`,
        }}
      />
    </>
  );
}
