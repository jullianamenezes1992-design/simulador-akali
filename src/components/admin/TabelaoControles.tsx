"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { atualizarTabelaoAgora, salvarTabelaoAuto } from "@/app/admin/actions";

export default function TabelaoControles({ auto }: { auto: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [ligado, setLigado] = useState(auto);
  const [msg, setMsg] = useState<string | null>(null);

  const agora = () =>
    start(async () => {
      setMsg(null);
      try {
        const r = await atualizarTabelaoAgora();
        setMsg(r.ok ? `Pronto! ${r.atualizados} empreendimento(s) atualizado(s).` : `Não foi possível atualizar: ${r.erro}`);
        router.refresh();
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Erro ao atualizar.");
      }
    });

  const alternar = (v: boolean) =>
    start(async () => {
      setLigado(v);
      try {
        await salvarTabelaoAuto(v);
      } catch {
        setLigado(!v);
        setMsg("Não foi possível salvar.");
      }
    });

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-3 text-sm font-semibold">
        <input type="checkbox" className="h-5 w-5 accent-caixa" checked={ligado} disabled={pending} onChange={(e) => alternar(e.target.checked)} />
        Atualizar automaticamente todo dia (a partir das 6h)
      </label>
      <button type="button" onClick={agora} disabled={pending} className="btn-primary">
        {pending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Atualizar agora
      </button>
      {msg && <p className="text-sm font-medium text-ink">{msg}</p>}
    </div>
  );
}
