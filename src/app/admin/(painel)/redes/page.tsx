import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import NovoContatoRedes from "@/components/admin/NovoContatoRedes";
import { LEAD_STATUS, REDES, leadStatusInfo, regiaoLabel, VINCULOS } from "@/lib/constants";
import { formatBRL, formatDate, maskPhone } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Redes sociais" };

type SP = Promise<Record<string, string | undefined>>;

// Até onde o cliente chegou no funil (para o resumo por rede)
const NIVEL: Record<string, number> = {
  novo: 0, em_atendimento: 0, sem_resposta: 0, perdido: 0,
  documentacao: 1, analise_credito: 1, serasa_bacen: 1, aprovado: 1, reprovado: 1,
  visita: 2, proposta: 2, vendido: 3,
};

type Linha = {
  id: string; nome: string; telefone: string; renda_total: number | null; compor_renda: boolean; fgts_saldo: number | null;
  idade_informada: number | null; profissao: string | null; tipo_renda: string | null; regioes: string[] | null; regiao_detalhe: string | null;
  origem: string | null; conteudo_rede: string | null; status: string; data_contato: string | null; proximo_passo: string | null;
  simulacao_completa: boolean; cadastro_manual: boolean; created_at: string;
};

export default async function RedesPage({ searchParams }: { searchParams: SP }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const rede = (REDES as readonly string[]).includes(sp.rede ?? "") ? sp.rede! : "";
  const etapa = LEAD_STATUS.some((s) => s.value === sp.etapa) ? sp.etapa! : "";
  const q = (sp.q ?? "").trim().toLowerCase().slice(0, 60);

  const { data } = await supabase
    .from("leads")
    .select("id, nome, telefone, renda_total, compor_renda, fgts_saldo, idade_informada, profissao, tipo_renda, regioes, regiao_detalhe, origem, conteudo_rede, status, data_contato, proximo_passo, simulacao_completa, cadastro_manual, created_at")
    .or(`cadastro_manual.eq.true,origem.in.(${REDES.map((r) => `"${r}"`).join(",")})`)
    .order("created_at", { ascending: false })
    .limit(1000);
  const todos = (data ?? []) as Linha[];

  // resumo por rede
  const redes = new Map<string, number[]>();
  for (const l of todos) {
    const o = l.origem || "Outro";
    const v = redes.get(o) ?? [0, 0, 0, 0];
    const n = l.simulacao_completa ? Math.max(1, NIVEL[l.status] ?? 0) : (NIVEL[l.status] ?? 0);
    v[0]++;
    if (n >= 1) v[1]++;
    if (n >= 2) v[2]++;
    if (n >= 3) v[3]++;
    redes.set(o, v);
  }
  const ordem = [...redes.entries()].sort((a, b) => b[1][0] - a[1][0]);
  const tot = ordem.reduce((t, [, v]) => t.map((x, i) => x + v[i]), [0, 0, 0, 0]);
  const pct = (v: number, b: number) => (b > 0 && v > 0 ? <span className="ml-1 text-xs text-ink-soft">{Math.round((v / b) * 100)}%</span> : null);

  const lista = todos.filter(
    (l) =>
      (!rede || l.origem === rede) &&
      (!etapa || l.status === etapa) &&
      (!q || [l.nome, l.telefone, l.regiao_detalhe, l.profissao, l.conteudo_rede].join(" ").toLowerCase().includes(q))
  );
  const link = (p: Record<string, string>) => {
    const u = new URLSearchParams({ ...(rede ? { rede } : {}), ...(etapa ? { etapa } : {}), ...(q ? { q } : {}), ...p });
    [...u.entries()].forEach(([k, v]) => !v && u.delete(k));
    return `/admin/redes${u.size ? `?${u}` : ""}`;
  };

  return (
    <>
      <PageHeader titulo="Redes sociais" descricao="Contatos que chegam pelo Instagram, TikTok e outras redes. Eles ficam no mesmo cadastro de clientes, com agenda e mensagens prontas.">
        <NovoContatoRedes />
      </PageHeader>

      <section className="card mb-4 overflow-x-auto p-4">
        <h2 className="mb-2 font-bold">Resultado por rede</h2>
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-ink-soft">
              <th className="py-1.5">Rede</th>
              <th className="text-right">Contatos</th>
              <th className="text-right">Simulação / docs</th>
              <th className="text-right">Visita</th>
              <th className="text-right">Venda</th>
            </tr>
          </thead>
          <tbody>
            {ordem.map(([o, v]) => (
              <tr key={o} className="border-t border-line">
                <td className="py-1.5 font-semibold">{o}</td>
                <td className="text-right tabular-nums">{v[0]}</td>
                <td className="text-right tabular-nums">{v[1]}{pct(v[1], v[0])}</td>
                <td className="text-right tabular-nums">{v[2]}{pct(v[2], v[0])}</td>
                <td className="text-right tabular-nums">{v[3]}{pct(v[3], v[0])}</td>
              </tr>
            ))}
            {ordem.length ? (
              <tr className="border-t border-line font-bold">
                <td className="py-1.5">Total</td>
                <td className="text-right tabular-nums">{tot[0]}</td>
                <td className="text-right tabular-nums">{tot[1]}{pct(tot[1], tot[0])}</td>
                <td className="text-right tabular-nums">{tot[2]}{pct(tot[2], tot[0])}</td>
                <td className="text-right tabular-nums">{tot[3]}{pct(tot[3], tot[0])}</td>
              </tr>
            ) : (
              <tr>
                <td colSpan={5} className="py-2 text-ink-soft">Aparece aqui quando houver contatos cadastrados.</td>
              </tr>
            )}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-ink-soft">Cada coluna conta quem chegou até aquela etapa ou além. Também entram aqui os clientes do site cuja origem é uma rede social.</p>
      </section>

      <div className="mb-3 flex flex-wrap gap-2">
        <Link href={link({ rede: "" })} className={`filtro ${!rede ? "filtro-on" : ""}`}>Todas as redes</Link>
        {REDES.filter((r) => redes.has(r)).map((r) => (
          <Link key={r} href={link({ rede: r })} className={`filtro ${rede === r ? "filtro-on" : ""}`}>
            {r} <b>{redes.get(r)?.[0]}</b>
          </Link>
        ))}
      </div>
      <form className="mb-4 flex flex-wrap gap-2" action="/admin/redes">
        {rede && <input type="hidden" name="rede" value={rede} />}
        <input name="q" defaultValue={q} placeholder="Buscar por nome, telefone, bairro, profissão ou vídeo" className="input min-w-0 flex-1" />
        <select name="etapa" defaultValue={etapa} className="input w-auto">
          <option value="">Todas as etapas</option>
          {LEAD_STATUS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button className="btn-secondary">Filtrar</button>
      </form>

      {lista.length === 0 ? (
        <p className="card p-6 text-center text-sm text-ink-soft">
          {todos.length ? "Nenhum contato com esse filtro." : "Nenhum contato ainda. Toque em “Novo contato das redes” para cadastrar o primeiro."}
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {lista.map((l) => {
            const st = leadStatusInfo(l.status);
            const regiao = [...(l.regioes ?? []).map(regiaoLabel), l.regiao_detalhe].filter(Boolean).join(" · ");
            return (
              <li key={l.id}>
                <Link href={`/admin/leads/${l.id}`} className="card block p-4 hover:border-caixa">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold">{l.nome}</p>
                      <p className="text-sm text-ink-soft">{maskPhone(l.telefone)}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${st.cor}`}>{st.label}</span>
                  </div>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
                    <dt className="text-ink-soft">Renda</dt>
                    <dd>{l.renda_total ? formatBRL(Number(l.renda_total)) : "—"}{l.compor_renda ? " (composta)" : ""}</dd>
                    <dt className="text-ink-soft">FGTS</dt>
                    <dd>{l.fgts_saldo ? formatBRL(Number(l.fgts_saldo)) : "—"}</dd>
                    <dt className="text-ink-soft">Idade</dt>
                    <dd>{l.idade_informada ?? "—"}</dd>
                    <dt className="text-ink-soft">Profissão</dt>
                    <dd>{[l.profissao, VINCULOS.find((v) => v.value === l.tipo_renda)?.label].filter(Boolean).join(" · ") || "—"}</dd>
                    <dt className="text-ink-soft">Região</dt>
                    <dd>{regiao || "—"}</dd>
                    <dt className="text-ink-soft">Origem</dt>
                    <dd>{[l.origem, l.conteudo_rede].filter(Boolean).join(" · ") || "—"}</dd>
                    {l.proximo_passo && (
                      <>
                        <dt className="text-ink-soft">Próximo</dt>
                        <dd className="font-semibold text-caixa">{l.proximo_passo}</dd>
                      </>
                    )}
                  </dl>
                  <p className="mt-2 text-xs text-ink-soft">
                    Contato em {formatDate(l.data_contato ? `${l.data_contato}T12:00:00Z` : l.created_at)}
                    {l.cadastro_manual ? "" : " · veio pelo site"}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
