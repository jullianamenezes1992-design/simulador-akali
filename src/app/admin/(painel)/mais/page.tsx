import type { Metadata } from "next";
import Link from "next/link";
import { AtSign, BadgeCheck, ChevronRight, LayoutDashboard, FolderOpen, FileSearch, Landmark, Snowflake, XCircle, ExternalLink, LogOut, Settings } from "lucide-react";
import AppCelular from "@/components/admin/AppCelular";
import Backups from "@/components/admin/Backups";
import { listarBackups } from "@/lib/server/backup";
import { AbasSecao, ABAS_CONFIG } from "@/components/admin/AbasSecao";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/server/auth";
import { obterChavesVapid } from "@/lib/server/push";
import { sair } from "../../actions";

export const metadata: Metadata = { title: "Mais" };

const LINKS = [
  { href: "/admin", label: "Visão geral", desc: "Resumo do funil e números do dia, semana e mês", icon: LayoutDashboard },
  { href: "/admin/montagem", label: "Montagem de pasta", desc: "Clientes juntando documentos", icon: FolderOpen },
  { href: "/admin/analise", label: "Pastas em análise", desc: "Pasta enviada, esperando o resultado", icon: FileSearch },
  { href: "/admin/aprovados", label: "Clientes aprovados", desc: "Poder de compra, projetos que cabem e oportunidades", icon: BadgeCheck },
  { href: "/admin/reprovados", label: "Reprovados", desc: "Motivo da reprovação e quando tentar de novo", icon: XCircle },
  { href: "/admin/base-fria", label: "Base fria", desc: "Carteira antiga da planilha, pelo nº da carteira", icon: Snowflake },
  { href: "/admin/base-cury", label: "Base Cury", desc: "Clientes com pasta na Cury", icon: Landmark },
  { href: "/admin/redes", label: "Redes sociais", desc: "Cadastrar e acompanhar os contatos do Instagram, TikTok…", icon: AtSign },
  { href: "/admin/configuracoes", label: "Configurações", desc: "WhatsApp, mensagens prontas, parâmetros e histórico", icon: Settings },
];

export default async function MaisPage() {
  const adm = await requireAdmin();
  const [chaves, backups] = await Promise.all([
    obterChavesVapid().catch(() => null),
    adm.papel === "admin" ? listarBackups().catch(() => []) : Promise.resolve([]),
  ]);
  return (
    <>
      <AbasSecao abas={ABAS_CONFIG} atual="/admin/mais" className="hidden lg:flex" />
      <div className="lg:hidden">
        <PageHeader titulo="Mais" descricao={`${adm.nome} · ${adm.email ?? ""}`} />
      </div>
      <div className="hidden lg:block">
        <PageHeader titulo="App e backup" descricao="Instalar o painel no celular, notificações e cópias de segurança." />
      </div>
      <div className="space-y-4">
        <nav className="card divide-y divide-line lg:hidden">
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
        </nav>
        <AppCelular vapidPublic={chaves?.publicKey ?? null} />
        {adm.papel === "admin" && <Backups arquivos={backups} podeGerar />}
        <form action={sair} className="card lg:hidden">
          <button className="flex w-full items-center gap-3 px-4 py-3.5 text-left font-semibold text-red-700 hover:bg-mist">
            <LogOut size={20} aria-hidden /> Sair
          </button>
        </form>
      </div>
    </>
  );
}
