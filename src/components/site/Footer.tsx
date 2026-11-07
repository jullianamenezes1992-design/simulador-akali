import Link from "next/link";
import type { SiteSettings } from "@/lib/data";
import Logo from "./Logo";
import ConsentLink from "./ConsentLink";

const BASE: Record<string, (u: string) => string> = {
  instagram: (u) => `https://www.instagram.com/${u}`,
  tiktok: (u) => `https://www.tiktok.com/@${u}`,
  facebook: (u) => `https://www.facebook.com/${u}`,
  youtube: (u) => `https://www.youtube.com/@${u}`,
};
const NOMES: Record<string, string> = { instagram: "Instagram", tiktok: "TikTok", facebook: "Facebook", youtube: "YouTube" };

/** Aceita "@perfil", "perfil" ou o link completo. */
function linkRede(rede: string, valor: string) {
  const v = valor.trim();
  if (/^https?:\/\//i.test(v)) return v;
  const u = v.replace(/^@/, "").replace(/^(www\.)?(instagram|tiktok|facebook|youtube)\.com\/@?/i, "").replace(/\/+$/, "");
  return BASE[rede]?.(encodeURIComponent(u)) ?? null;
}

export default function Footer({ s }: { s: SiteSettings }) {
  const redes = Object.entries(s.redes_sociais ?? {})
    .filter(([k, v]) => NOMES[k] && v)
    .map(([k, v]) => ({ nome: NOMES[k], href: linkRede(k, v as string) }))
    .filter((r): r is { nome: string; href: string } => !!r.href);
  const aviso =
    s.landing_conteudo.aviso_rodape ??
    "Esta é uma plataforma independente de uma corretora de imóveis. Não é um canal oficial da Caixa Econômica Federal nem do Governo Federal.";
  return (
    <footer className="mt-16 bg-ink text-white/80">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-3">
        <div className="space-y-3">
          <Logo nome={s.empresa_nome} light />
          {s.creci && <p className="text-sm">{s.creci}</p>}
          {s.email_contato && <p className="text-sm">{s.email_contato}</p>}
          {redes.length > 0 && (
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {redes.map((r) => (
                <a key={r.nome} href={r.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:underline">
                  {r.nome}
                </a>
              ))}
            </p>
          )}
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-white">Navegação</p>
          <Link href="/simulacao" className="block hover:text-white">Fazer simulação</Link>
          <Link href="/empreendimentos" className="block hover:text-white">Empreendimentos</Link>
          <Link href="/privacidade" className="block hover:text-white">Política de Privacidade</Link>
          <ConsentLink />
        </div>
        <p className="text-xs leading-relaxed text-white/60">
          {aviso} As simulações são estimativas e não representam aprovação de crédito, que depende de análise e aprovação
          do agente financeiro.
        </p>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {s.empresa_nome}
      </div>
    </footer>
  );
}
