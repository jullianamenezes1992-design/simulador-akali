import Link from "next/link";

type Aba = { href: string; label: string };

/** Abas no topo de uma seção do painel (ex.: Configurações → Mensagens, Parâmetros...). */
export function AbasSecao({ abas, atual, className = "" }: { abas: Aba[]; atual: string; className?: string }) {
  return (
    <nav aria-label="Seções" className={`-mx-1 mb-4 flex gap-1 overflow-x-auto px-1 pb-1 ${className}`}>
      {abas.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          aria-current={a.href === atual ? "page" : undefined}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-bold transition active:scale-95 ${
            a.href === atual ? "bg-caixa text-white" : "bg-white text-ink-soft shadow-sm hover:bg-mist"
          }`}
        >
          {a.label}
        </Link>
      ))}
    </nav>
  );
}

export const ABAS_VISAO = [
  { href: "/admin", label: "Resumo" },
  { href: "/admin/numeros", label: "Números" },
];

export const ABAS_CONFIG = [
  { href: "/admin/configuracoes", label: "Geral" },
  { href: "/admin/mensagens", label: "Mensagens prontas" },
  { href: "/admin/parametros", label: "Parâmetros" },
  { href: "/admin/historico", label: "Histórico" },
  { href: "/admin/mais", label: "App e backup" },
];
