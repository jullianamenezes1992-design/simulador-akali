import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ExternalLink, History, LogOut, Settings, SlidersHorizontal } from "lucide-react";
import AppCelular from "@/components/admin/AppCelular";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/server/auth";
import { obterChavesVapid } from "@/lib/server/push";
import { sair } from "../../actions";

export const metadata: Metadata = { title: "Mais" };

const LINKS = [
  { href: "/admin/configuracoes", label: "Configurações", desc: "WhatsApp, avisos, CRECI e textos do site", icon: Settings },
  { href: "/admin/parametros", label: "Parâmetros da simulação", desc: "Faixas, juros e regras do cálculo", icon: SlidersHorizontal },
  { href: "/admin/historico", label: "Histórico de alterações", desc: "Quem mudou o quê no painel", icon: History },
];

export default async function MaisPage() {
  const adm = await requireAdmin();
  const chaves = await obterChavesVapid().catch(() => null);
  return (
    <>
      <PageHeader titulo="Mais" descricao={`${adm.nome} · ${adm.email ?? ""}`} />
      <div className="space-y-4">
        <AppCelular vapidPublic={chaves?.publicKey ?? null} />
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
