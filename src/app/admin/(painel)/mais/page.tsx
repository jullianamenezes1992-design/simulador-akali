import type { Metadata } from "next";
import Link from "next/link";
import { AtSign, BadgeCheck, ChevronRight, LayoutDashboard, FolderOpen, Snowflake, XCircle, ExternalLink, History, LogOut, MessageSquareText, Settings, SlidersHorizontal } from "lucide-react";
import AppCelular from "@/components/admin/AppCelular";
import Backups from "@/components/admin/Backups";
import { listarBackups } from "@/lib/server/backup";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/server/auth";
import { obterChavesVapid } from "@/lib/server/push";
import { sair } from "../../actions";

export const metadata: Metadata = { title: "Mais" };

const LINKS = [
  { href: "/admin", label: "Visão geral", desc: "Números do funil, conversão e cadastros recentes", icon: LayoutDashboard },
  { href: "/admin/montagem", label: "Montagem de pasta", desc: "Clientes juntando documentos e em análise", icon: FolderOpen },
  { href: "/admin/aprovados", label: "Clientes aprovados", desc: "Poder de compra, projetos que cabem e oportunidades", icon: BadgeCheck },
  { href: "/admin/reprovados", label: "Reprovados", desc: "Motivo da reprovação e quando tentar de novo", icon: XCircle },
  { href: "/admin/base-fria", label: "Base fria", desc: "Carteira antiga da planilha, pelo nº da carteira", icon: Snowflake },
  { href: "/admin/redes", label: "Redes sociais", desc: "Cadastrar e acompanhar os contatos do Instagram, TikTok…", icon: AtSign },
  { href: "/admin/mensagens", label: "Mensagens prontas", desc: "Textos de WhatsApp para cada etapa do atendimento", icon: MessageSquareText },
  { href: "/admin/configuracoes", label: "Configurações", desc: "WhatsApp, avisos, CRECI e textos do site", icon: Settings },
  { href: "/admin/parametros", label: "Parâmetros da simulação", desc: "Faixas, juros e regras do cálculo", icon: SlidersHorizontal },
  { href: "/admin/historico", label: "Histórico de alterações", desc: "Quem mudou o quê no painel", icon: History },
];

export default async function MaisPage() {
  const adm = await requireAdmin();
  const [chaves, backups] = await Promise.all([
    obterChavesVapid().catch(() => null),
    adm.papel === "admin" ? listarBackups().catch(() => []) : Promise.resolve([]),
  ]);
  return (
    <>
      <PageHeader titulo="Mais" descricao={`${adm.nome} · ${adm.email ?? ""}`} />
      <div className="space-y-4">
        <AppCelular vapidPublic={chaves?.publicKey ?? null} />
        {adm.papel === "admin" && <Backups arquivos={backups} podeGerar />}
        <nav className="card divide-y divide-line">
          {LINKS.map(({ href, label, desc, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-mist">
              <Icon size={20} className="shrink-0 text-caixa" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{label}</span>
                <span className="block text-sm text-ink-soft">{desc}</span>
              </span>
              <ChevronRight size={18} className="text-ink-soft" aria-hidden />
            </Link>
          ))}
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3.5 hover:bg-mist">
            <ExternalLink size={20} className="shrink-0 text-caixa" aria-hidden />
            <span className="flex-1 font-semibold">Ver o site</span>
          </a>
          <form action={sair}>
            <button className="flex w-full items-center gap-3 px-4 py-3.5 text-left font-semibold text-red-700 hover:bg-mist">
              <LogOut size={20} aria-hidden /> Sair
            </button>
          </form>
        </nav>
      </div>
    </>
  );
}
