"use client";

import { useActionState, useState } from "react";
import { ExternalLink, Loader2, Pencil, Save } from "lucide-react";
import { salvarDadosSF } from "@/app/admin/actions";
import { maskCPF } from "@/lib/format";

const PORTAL = "https://planoeplano.my.site.com/corretores/s/opportunity/";

/** Números do Salesforce Plano&Plano (oportunidade, AR, AB) e cadastro do CPF, na ficha do cliente. */
export default function DadosSalesforce({
  leadId,
  oportunidade,
  ar,
  ab,
  temCpf,
}: {
  leadId: string;
  oportunidade: string | null;
  ar: string | null;
  ab: string | null;
  temCpf: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const [cpf, setCpf] = useState("");
  const [estado, acao, pending] = useActionState(async (prev: Awaited<ReturnType<typeof salvarDadosSF>>, fd: FormData) => {
    const r = await salvarDadosSF(leadId, prev, fd);
    if (r.ok) {
      setEditando(false);
      setCpf("");
    }
    return r;
  }, {});

  if (!editando)
    return (
      <div className="space-y-1.5 text-sm">
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <span className="text-ink-soft">Oportunidade</span>
          <span className="min-w-0 break-all">
            {oportunidade ? (
              <a href={`${PORTAL}${oportunidade}`} target="_blank" rel="noreferrer" className="font-mono text-caixa hover:underline">
                {oportunidade} <ExternalLink size={12} className="inline" />
              </a>
            ) : (
              "—"
            )}
          </span>
          <span className="text-ink-soft">AR</span>
          <span className="font-mono">{ar ?? "—"}</span>
          <span className="text-ink-soft">AB</span>
          <span className="font-mono">{ab ?? "—"}</span>
        </div>
        {estado.ok && <p className="text-xs font-semibold text-emerald-700">{estado.mensagem}</p>}
        <button type="button" onClick={() => setEditando(true)} className="inline-flex items-center gap-1 text-xs font-semibold text-caixa hover:underline">
          <Pencil size={12} /> {oportunidade || ar || ab ? "Editar" : "Preencher"} números{temCpf ? "" : " e CPF"}
        </button>
      </div>
    );

  return (
    <form action={acao} className="grid gap-3 text-sm sm:grid-cols-2">
      <label className="sm:col-span-2">
        <span className="label">Oportunidade (ID no Salesforce)</span>
        <input name="oportunidade_sf" defaultValue={oportunidade ?? ""} placeholder="006TT00000…" className="input font-mono" maxLength={40} />
      </label>
      <label>
        <span className="label">AR</span>
        <input name="ar_numero" defaultValue={ar ?? ""} placeholder="AR-1035002" className="input font-mono" maxLength={30} />
      </label>
      <label>
        <span className="label">AB</span>
        <input name="ab_numero" defaultValue={ab ?? ""} placeholder="AB-317630" className="input font-mono" maxLength={30} />
      </label>
      <label className="sm:col-span-2">
        <span className="label">{temCpf ? "Trocar CPF (deixe vazio para manter)" : "CPF"}</span>
        <input name="cpf" value={cpf} onChange={(e) => setCpf(maskCPF(e.target.value))} inputMode="numeric" placeholder="000.000.000-00" className="input font-mono" autoComplete="off" />
        <span className="mt-1 block text-xs text-ink-soft">Fica guardado criptografado. Para ver depois, use “Ver CPF” (fica registrado no histórico).</span>
      </label>
      {estado.erro && <p className="text-xs font-semibold text-red-600 sm:col-span-2">{estado.erro}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button className="btn-primary" disabled={pending}>
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar
        </button>
        <button type="button" className="btn-secondary" onClick={() => setEditando(false)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
