import type { Metadata } from "next";
import ParamsEditor from "@/components/admin/ParamsEditor";
import ActivateVersion from "@/components/admin/ActivateVersion";
import { PageHeader } from "@/components/admin/ui";
import { formatDate } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";
import type { SimulationParams } from "@/lib/simulacao/types";

export const metadata: Metadata = { title: "Parâmetros de simulação" };

const PADRAO: SimulationParams = {
  comprometimento_renda_max: 0.3,
  prazo_max_meses: 420,
  idade_min_anos: 18,
  idade_max_quitacao_meses: 966,
  sistema_amortizacao: "SAC",
  taxa_referencia: "max",
  cota_financiamento_max: null,
  fgts_exige_3_anos: true,
  faixas: [],
};

export default async function ParametrosPage({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  const { supabase, papel } = await requireAdmin();
  const sp = await searchParams;
  const { data: versoes } = await supabase
    .from("simulation_params")
    .select("id, versao, ativo, descricao, params, created_at, created_by")
    .order("versao", { ascending: false });
  const lista = versoes ?? [];
  const base = lista.find((v) => String(v.versao) === sp.v) ?? lista.find((v) => v.ativo) ?? lista[0];

  return (
    <>
      <PageHeader
        titulo="Parâmetros de simulação"
        descricao="Cada alteração cria uma nova versão. As simulações registram a versão usada. Não insira taxas, subsídios ou limites sem fonte oficial."
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <div>
          {papel === "admin" ? (
            <ParamsEditor key={base?.id ?? "novo"} inicial={(base?.params as SimulationParams) ?? PADRAO} />
          ) : (
            <p className="card p-4 text-sm text-ink-soft">Somente administradores podem alterar os parâmetros.</p>
          )}
        </div>
        <aside className="card h-fit p-4">
          <h2 className="font-bold">Versões</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {lista.map((v) => (
              <li key={v.id} className={`rounded-xl border p-3 ${v.ativo ? "border-caixa bg-caixa-50" : "border-line"}`}>
                <div className="flex items-center justify-between gap-2">
                  <a href={`/admin/parametros?v=${v.versao}`} className="font-semibold hover:text-caixa">
                    Versão {v.versao}
                  </a>
                  {v.ativo ? <span className="chip bg-caixa text-white">Ativa</span> : papel === "admin" && <ActivateVersion id={v.id} />}
                </div>
                <p className="mt-1 text-xs text-ink-soft">{v.descricao ?? "Sem descrição"}</p>
                <p className="text-xs text-ink-soft">{formatDate(v.created_at, true)}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-soft">Clique em uma versão para carregá-la no editor como base.</p>
        </aside>
      </div>
    </>
  );
}
