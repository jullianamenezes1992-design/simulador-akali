"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const ORIGEM = "https://apartamentonaplantasp.com.br";

type Msg =
  | { tipo: "leads"; leads: unknown[] }
  | { tipo: "confirmar"; confirmados: number[]; erros: Record<string, string> };

export default function PonteEquipe() {
  const [linhas, setLinhas] = useState<string[]>(["Esperando o CRM da equipe…"]);
  const log = (t: string) => setLinhas((l) => [...l, t]);

  useEffect(() => {
    const enviar = (m: unknown) => window.opener?.postMessage(m, ORIGEM);
    let passo = "";
    const sincronizar = async (corpo: unknown) => {
      passo = "sincronizar";
      const r = await fetch("/api/admin/equipe/sincronizar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
      if (!r.ok) throw new Error(`sincronizar HTTP ${r.status}`);
      return r.json();
    };

    const aoReceber = async (ev: MessageEvent<Msg>) => {
      if (ev.origin !== ORIGEM || !ev.data || typeof ev.data !== "object") return;
      try {
        if (ev.data.tipo === "leads") {
          // em lotes de 15 para não estourar o tempo do servidor
          const r = { criados: 0, atualizados: 0, erros: [] as unknown[] };
          for (let i = 0; i < ev.data.leads.length; i += 15) {
            const parte = await sincronizar({ leads: ev.data.leads.slice(i, i + 15) });
            r.criados += parte.criados ?? 0;
            r.atualizados += parte.atualizados ?? 0;
            r.erros.push(...(parte.erros ?? []));
          }
          log(`Leads: ${r.criados ?? 0} novo(s), ${r.atualizados ?? 0} já estavam${r.erros?.length ? `, ${r.erros.length} com erro` : ""}.`);
          passo = "pendentes";
          const p = await fetch("/api/admin/equipe/pendentes").then((x) => x.json());
          log(`Atualizações para levar ao CRM da equipe: ${p.itens?.length ?? 0}.`);
          enviar({ tipo: "pendentes", itens: p.itens ?? [], resumo: r });
        } else if (ev.data.tipo === "confirmar") {
          await sincronizar({ confirmados: ev.data.confirmados, erros: ev.data.erros });
          const ne = Object.keys(ev.data.erros ?? {}).length;
          log(`Levadas: ${ev.data.confirmados.length}${ne ? ` · ${ne} com erro` : ""}. Pronto ✓`);
          enviar({ tipo: "fim" });
          setTimeout(() => window.close(), 4000);
        }
      } catch (e) {
        log(`Erro: ${e instanceof Error ? e.message : String(e)}`);
        enviar({ tipo: "erro", erro: `${passo}: ${String(e)}` });
      }
    };
    window.addEventListener("message", aoReceber);
    // avisa a aba do CRM da equipe que está pronta (repete até ela responder)
    enviar({ tipo: "pronto" });
    const t = setInterval(() => enviar({ tipo: "pronto" }), 700);
    const parar = (ev: MessageEvent) => {
      if (ev.origin !== ORIGEM) return;
      clearInterval(t);
      window.removeEventListener("message", parar);
    };
    window.addEventListener("message", parar);
    return () => {
      clearInterval(t);
      window.removeEventListener("message", aoReceber);
      window.removeEventListener("message", parar);
    };
  }, []);

  return (
    <div className="card mx-auto max-w-md p-5">
      <h1 className="flex items-center gap-2 font-bold">
        <Loader2 size={18} className="animate-spin text-caixa" /> Sincronizando com o CRM da equipe
      </h1>
      <ul className="mt-3 space-y-1 text-sm">
        {linhas.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </div>
  );
}
