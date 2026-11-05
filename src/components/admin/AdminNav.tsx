"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarDays,
  ExternalLink,
  History,
  LayoutDashboard,
  Menu,
  Settings,
  SlidersHorizontal,
  Smartphone,
  Users,
} from "lucide-react";

const ITENS = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/empreendimentos", label: "Empreendimentos", icon: Building2 },
  { href: "/admin/parametros", label: "Parâmetros", icon: SlidersHorizontal },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
  { href: "/admin/historico", label: "Histórico", icon: History },
  { href: "/admin/mais", label: "App no celular", icon: Smartphone },
];

// Menu de baixo no celular (estilo app)
const ABAS = [
  { href: "/admin", label: "Início", icon: LayoutDashboard },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/empreendimentos", label: "Imóveis", icon: Building2 },
  { href: "/admin/mais", label: "Mais", icon: Menu },
];

const MAIS = ["/admin/mais", "/admin/parametros", "/admin/configuracoes", "/admin/historico"];

export default function AdminNav() {
  const path = usePathname();
  const ativo = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  const abaAtiva = (href: string) => (href === "/admin/mais" ? MAIS.some((m) => path.startsWith(m)) : ativo(href));

  return (
    <>
      {/* Computador: menu lateral */}
      <div className="hidden lg:flex lg:h-[calc(100dvh-120px)] lg:flex-col">
        <div className="px-5 pt-5 pb-3 text-sm font-extrabold text-caixa">Painel da corretora</div>
        <nav className="flex flex-col gap-1 p-3">
          {ITENS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                ativo(href) ? "bg-caixa text-white" : "text-ink hover:bg-mist"
              }`}
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
          <Link href="/" target="_blank" className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-mist">
            <ExternalLink size={16} /> Ver site
          </Link>
        </nav>
      </div>

      {/* Celular: barra de cima simples + abas embaixo */}
      <div className="flex items-center gap-2 px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] lg:hidden">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-caixa">
          <svg width="18" height="18" viewBox="0 0 34 34" aria-hidden>
            <path d="M8 18.5 17 10l9 8.5V26a1 1 0 0 1-1 1h-5.5v-5.5h-5V27H9a1 1 0 0 1-1-1z" fill="#fff" />
            <rect x="21.5" y="7" width="4" height="4" rx="1" fill="#F5A623" />
          </svg>
        </span>
        <span className="font-display text-base font-bold text-ink">Akali CRM</span>
      </div>
      <nav
        aria-label="Menu do app"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {ABAS.map(({ href, label, icon: Icon }) => {
            const on = abaAtiva(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={on ? "page" : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${on ? "text-caixa" : "text-ink-soft"}`}
                >
                  <Icon size={22} strokeWidth={on ? 2.4 : 1.8} aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
