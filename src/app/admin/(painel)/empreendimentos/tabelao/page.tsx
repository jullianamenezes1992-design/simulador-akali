import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import TabelaoControles from "@/components/admin/TabelaoControles";
import { formatBRL } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";
import { TABELAO_URL, type Mudanca, type Novo } from "@/lib/server/tabelao";

export const metadata: Metadata = { title: "Tabelão Plano&Plano" };

const dataHora = (s: string | null) =>
  s ? new Date(s).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

const valor = (m: Mudanca, v: Mudanca["de"]) => {
  if (v == null) return "—";
  if (m.campo === "a partir de" && typeof v === "number") return formatBRL(v);
  if (m.campo === "à venda") return v ? "com unidades" : "sem unidades";
  if (m.campo === "status") return ({ lancamento: "lançamento", em_obras: "em obras", pronto: "pronto" } as Record<string, string>)[String(v)] ?? String(v);
  return String(v);
};

export default async function TabelaoPage() {
  const { supabase, papel } = await requireAdmin();
  const [{ data: runs }, { data: cfg }] = await Promise.all([
    supabase.from("tabelao_sync").select("*").order("rodou_em", { ascending: false }).limit(10),
    supabase.from("notification_settings").select("tabelao_auto").eq("id", 1).maybeSingle(),
  ]);
  const ultima = runs?.[0];
  const ultimaOk = runs?.find((r) => r.ok);
  const novos = (ultimaOk?.novos ?? []) as Novo[];

  return (
    <>
      <Link href="/admin/empreendimentos" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-caixa">
        <ArrowLeft size={16} /> Empreendimentos
      </Link>
      <PageHeader titulo="Tabelão Plano&Plano" descricao="Preços “a partir de”, estoque, status e entrega dos empreendimentos Plano&Plano, puxados do Tabelão On-line." />

      <section className="card mb-4 space-y-3 p-4">
        <p className="text-sm text-ink-soft">
          Fonte:{" "}
          <a href={TABELAO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-caixa">
            Tabelão On-line <ExternalLink size={13} />
          </a>
          . Só os empreendimentos Plano&Plano são alterados; Cury e cadastros manuais não mudam. O que está oculto no site continua oculto.
        </p>
        {ultima && (
          <p className={`rounded-xl px-3 py-2 text-sm ${ultima.ok ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"}`}>
            Última atualização: <strong>{dataHora(ultima.rodou_em)}</strong> ({ultima.origem === "manual" ? "manual" : "automática"}) —{" "}
            {ultima.ok
              ? `${ultima.atualizados} empreendimento(s) com mudança, ${ultima.sem_mudanca} sem mudança, ${ultima.esgotados} sem unidades. Dados do tabelão de ${dataHora(ultima.dados_de)}.`
              : `não atualizou: ${ultima.erro}`}
          </p>
        )}
        {papel === "admin" ? <TabelaoControles auto={cfg?.tabelao_auto ?? true} /> : null}
      </section>

      {novos.length > 0 && (
        <section className="card mb-4 p-4">
          <h2 className="font-bold">No tabelão, mas ainda não estão no site ({novos.length})</h2>
          <p className="mb-2 text-sm text-ink-soft">Para aparecerem, é preciso cadastrar (fotos, plantas, endereço). Me peça no chat que eu cadastro.</p>
          <ul className="divide-y divide-line text-sm">
            {novos.map((n) => (
              <li key={n.nome} className="flex flex-wrap justify-between gap-2 py-2">
                <span className="font-semibold">{n.nome}</span>
                <span className="text-ink-soft">
                  {n.status} · {n.preco ? `a partir de ${formatBRL(n.preco)}` : "valores em breve"}
                  {n.estoque != null ? ` · ${n.estoque} unid.` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card p-4">
        <h2 className="mb-2 font-bold">O que mudou nas últimas atualizações</h2>
        {(runs ?? []).filter((r) => r.ok && (r.mudancas as Mudanca[]).length).length === 0 ? (
          <p className="text-sm text-ink-soft">Nenhuma mudança de preço, estoque, status ou entrega registrada ainda.</p>
        ) : (
          <div className="space-y-4">
            {(runs ?? [])
              .filter((r) => r.ok && (r.mudancas as Mudanca[]).length)
              .map((r) => (
                <div key={r.id}>
                  <h3 className="mb-1 text-sm font-bold text-caixa">{dataHora(r.rodou_em)}</h3>
                  <ul className="divide-y divide-line text-sm">
                    {(r.mudancas as Mudanca[]).map((m, i) => (
                      <li key={i} className="flex flex-wrap justify-between gap-2 py-1.5">
                        <span className="font-semibold">{m.nome}</span>
                        <span>
                          <span className="text-ink-soft">{m.campo}:</span> {valor(m, m.de)} → <strong>{valor(m, m.para)}</strong>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        )}
      </section>
    </>
  );
}
