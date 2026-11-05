"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CalendarDays, ExternalLink, History, LayoutDashboard, Settings, SlidersHorizontal, Users } from "lucide-react";

const ITENS = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/empreendimentos", label: "Empreendimentos", icon: Building2 },
  { href: "/admin/parametros", label: "Parâmetros", icon: SlidersHorizontal },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
  { href: "/admin/historico", label: "Histórico", icon: History },
];

export default function AdminNav() {
  const path = usePathname();
  const ativo = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  return (
    <div className="lg:flex lg:h-[calc(100dvh-120px)] lg:flex-col">
      <div className="hidden px-5 pt-5 pb-3 text-sm font-extrabold text-caixa lg:block">Painel da corretora</div>
      <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:p-3">
        {ITENS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
              ativo(href) ? "bg-caixa text-white" : "text-ink hover:bg-mist"
            }`}
          >
            <Icon size={16} /> {label}
          </Link>
        ))}
        <Link href="/" target="_blank" className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-mist lg:mt-4">
          <ExternalLink size={16} /> Ver site
        </Link>
      </nav>
    </div>
  );
}
