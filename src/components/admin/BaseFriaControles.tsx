"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  FileSpreadsheet,
  Loader2,
  MessageCircle,
  PhoneOff,
  Undo2,
  UserCheck,
  XCircle,
} from "lucide-react";
import {
  chamarBaseFria,
  marcarBaseFria,
  reativarBaseFria,
  salvarMetaBaseFria,
} from "@/app/admin/actions";
import { itemDaLinha, situacaoBF, type ItemBaseFria } from "@/lib/base-fria";

/** Botões de um contato da base fria: Chamar → (Respondeu | Nº errado | Não quer). */
export function AcoesBaseFria({
  id,
  telefone,
  texto,
  situacao: inicial,
}: {
  id: string;
  telefone: string;
  texto: string;
  situacao: string;
}) {
  const [situacao, setSituacao] = useState(inicial);
  const [erro, setErro] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  const marcar = (r: "numero_errado" | "nao_quer" | "desfazer") =>
    start(async () => {
      const antes = situacao;
      setSituacao(r === "desfazer" ? "chamado" : r);
      try {
        await marcarBaseFria(id, r);
      } catch {
        setSituacao(antes);
      }
    });

  const respondeu = () =>
    start(async () => {
      setErro("");
      const r = await reativarBaseFria(id);
      if (r.erro) setErro(r.erro);
      else if (r.leadId) {
        setSituacao("virou_lead");
        router.push(`/admin/leads/${r.leadId}`);
      }
    });

  const fim = situacaoBF(situacao);
  if (
    ["virou_lead", "numero_errado", "nao_quer", "comprou", "no_crm"].includes(
      situacao,
    )
  )
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${fim?.cor}`}
        >
          {fim?.label}
        </span>
        {(situacao === "numero_errado" || situacao === "nao_quer") && (
          <button
            type="button"
            onClick={() => marcar("desfazer")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-ink-soft hover:underline"
          >
            <Undo2 size={13} /> desfazer
          </button>
        )}
      </div>
    );

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <a
        href={`https://wa.me/55${telefone}?text=${encodeURIComponent(texto)}`}
        target="_blank"
        rel="noreferrer"
        onClick={() => {
          setSituacao("chamado");
          start(() => chamarBaseFria(id).catch(() => undefined));
        }}
        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold ${situacao === "chamado" ? "bg-emerald-100 text-emerald-800" : "bg-[#25D366] text-white"}`}
      >
        {situacao === "chamado" ? (
          <Check size={13} />
        ) : (
          <MessageCircle size={13} />
        )}{" "}
        {situacao === "chamado" ? "Chamado" : "Chamar"}
      </a>
      {situacao === "chamado" && (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={respondeu}
            className="inline-flex items-center gap-1 rounded-lg bg-caixa px-2.5 py-1.5 text-xs font-bold text-white disabled:opacity-60"
          >
            {pending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <UserCheck size={13} />
            )}{" "}
            Respondeu
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => marcar("numero_errado")}
            className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-bold text-ink"
          >
            <PhoneOff size={13} /> Nº errado
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => marcar("nao_quer")}
            className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-bold text-ink"
          >
            <XCircle size={13} /> Não quer
          </button>
        </>
      )}
      {erro && (
        <span className="text-xs font-semibold text-red-700">{erro}</span>
      )}
    </div>
  );
}

/** Meta de contatos por dia. */
export function MetaBaseFria({ valor }: { valor: number }) {
  const [v, setV] = useState(String(valor));
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <label htmlFor="meta-bf" className="font-semibold">
        Chamar por dia:
      </label>
      <input
        id="meta-bf"
        type="number"
        min={0}
        max={300}
        value={v}
        onChange={(e) => setV(e.target.value)}
        className="input !py-1.5 w-20"
      />
      <button
        type="button"
        disabled={pending || v === String(valor)}
        onClick={() =>
          start(async () => {
            setMsg("");
            try {
              await salvarMetaBaseFria(Number(v));
              setMsg("Salvo!");
            } catch (e) {
              setMsg(e instanceof Error ? e.message : "Erro ao salvar.");
            }
          })
        }
        className="btn-secondary !py-1.5 disabled:opacity-50"
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : "Salvar"}
      </button>
      {msg && (
        <span className="text-xs font-semibold text-ink-soft">{msg}</span>
      )}
    </div>
  );
}

type Resumo = {
  linhas: number;
  validos: number;
  invalidos: number;
  repetidos: number;
  novos: number;
  noCrm: number;
};

/** Importa a planilha (Excel/CSV): lida aqui no navegador e enviada em lotes. */
export function ImportarBaseFria() {
  const input = useRef<HTMLInputElement>(null);
  const [etapa, setEtapa] = useState("");
  const [pct, setPct] = useState(0);
  const [erro, setErro] = useState("");
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const router = useRouter();

  async function importar(arquivo: File) {
    setErro("");
    setResumo(null);
    setPct(0);
    try {
      setEtapa("Lendo a planilha…");
      const linhas = await lerPlanilha(arquivo);
      const vistos = new Set<string>();
      const itens: ItemBaseFria[] = [];
      let invalidos = 0;
      let repetidos = 0;
      for (const l of linhas) {
        const it = itemDaLinha(l);
        if (!it) invalidos++;
        else if (vistos.has(it.telefone)) repetidos++;
        else {
          vistos.add(it.telefone);
          itens.push(it);
        }
      }
      if (!itens.length)
        throw new Error(
          "Não encontrei telefones válidos. A planilha precisa ter uma coluna “Telefone”.",
        );
      let novos = 0;
      let noCrm = 0;
      const LOTE = 1000;
      for (let i = 0; i < itens.length; i += LOTE) {
        setEtapa(
          `Enviando ${Math.min(i + LOTE, itens.length).toLocaleString("pt-BR")} de ${itens.length.toLocaleString("pt-BR")}…`,
        );
        const fim = i + LOTE >= itens.length;
        const r = await fetch("/api/admin/base-fria/importar", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            lote: arquivo.name,
            itens: itens.slice(i, i + LOTE),
            fim,
          }),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.erro ?? `Erro ${r.status}`);
        novos += j.novos ?? 0;
        noCrm += j.no_crm ?? 0;
        setPct(Math.round(((i + LOTE) / itens.length) * 100));
      }
      setResumo({
        linhas: linhas.length,
        validos: itens.length,
        invalidos,
        repetidos,
        novos,
        noCrm,
      });
      setEtapa("");
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao importar.");
      setEtapa("");
    } finally {
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <p className="text-sm text-ink-soft">
        Envie a planilha (Excel ou CSV) com pelo menos as colunas <b>Nome</b> e{" "}
        <b>Telefone</b>. Também uso, se tiver: Bairro de interesse, Zona, Renda
        informada, Prazo de compra, Status, Origem, Campanha(s), Última entrada
        e Observações. Telefones repetidos e quem já está no CRM não entram duas
        vezes.
      </p>
      <label
        className={`btn-primary mt-3 inline-flex cursor-pointer ${etapa ? "pointer-events-none opacity-60" : ""}`}
      >
        {etapa ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <FileSpreadsheet size={16} />
        )}{" "}
        {etapa || "Escolher planilha"}
        <input
          ref={input}
          type="file"
          accept=".xlsx,.csv"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importar(f);
          }}
        />
      </label>
      {etapa && pct > 0 && (
        <div className="mt-2 h-2 w-full max-w-sm overflow-hidden rounded-full bg-mist">
          <div
            className="h-full bg-caixa transition-all"
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      )}
      {erro && (
        <p className="mt-2 text-sm font-semibold text-red-700">{erro}</p>
      )}
      {resumo && (
        <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
          <p className="font-bold">Importação concluída ✅</p>
          <p>
            {resumo.linhas.toLocaleString("pt-BR")} linhas lidas ·{" "}
            <b>{resumo.novos.toLocaleString("pt-BR")} contatos novos</b> na base
            fria
            {resumo.validos - resumo.novos > 0 &&
              ` · ${(resumo.validos - resumo.novos).toLocaleString("pt-BR")} já estavam na base`}
            {resumo.noCrm > 0 &&
              ` · ${resumo.noCrm.toLocaleString("pt-BR")} já estão no CRM (não serão chamados)`}
            {resumo.repetidos > 0 &&
              ` · ${resumo.repetidos.toLocaleString("pt-BR")} telefones repetidos`}
            {resumo.invalidos > 0 &&
              ` · ${resumo.invalidos.toLocaleString("pt-BR")} sem telefone válido`}
          </p>
        </div>
      )}
    </div>
  );
}

async function lerPlanilha(arquivo: File): Promise<Record<string, unknown>[]> {
  if (/\.csv$/i.test(arquivo.name)) {
    const texto = await arquivo.text();
    const sep =
      (texto.split("\n")[0].match(/;/g)?.length ?? 0) >
      (texto.split("\n")[0].match(/,/g)?.length ?? 0)
        ? ";"
        : ",";
    const linhas = texto.split(/\r?\n/).filter((l) => l.trim());
    const cab = linhas[0].split(sep).map((c) => c.replace(/^"|"$/g, "").trim());
    return linhas.slice(1).map((l) => {
      const v = l.split(sep).map((c) => c.replace(/^"|"$/g, "").trim());
      return Object.fromEntries(cab.map((c, i) => [c, v[i] ?? null]));
    });
  }
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await arquivo.arrayBuffer());
  const valor = (v: unknown): unknown => {
    if (v && typeof v === "object" && !(v instanceof Date)) {
      const o = v as {
        text?: unknown;
        result?: unknown;
        richText?: { text: string }[];
      };
      if (o.richText) return o.richText.map((r) => r.text).join("");
      return o.result ?? o.text ?? null;
    }
    return v;
  };
  // a aba com a coluna "Telefone" e mais linhas (na planilha unificada: "Todos os leads")
  const abas = wb.worksheets
    .map((ws) => {
      const cab = ((ws.getRow(1).values as unknown[]) ?? []).map((c) =>
        String(valor(c) ?? "").trim(),
      );
      return { ws, cab };
    })
    .filter((a) => a.cab.some((c) => /^(telefone|celular|whatsapp)$/i.test(c)))
    .sort((a, b) => b.ws.rowCount - a.ws.rowCount);
  if (!abas.length)
    throw new Error("Não achei uma aba com a coluna “Telefone”.");
  const { ws, cab } = abas[0];
  const out: Record<string, unknown>[] = [];
  ws.eachRow((row, n) => {
    if (n === 1) return;
    const vals = row.values as unknown[];
    const o: Record<string, unknown> = {};
    cab.forEach((c, i) => {
      if (c) o[c] = valor(vals[i]);
    });
    out.push(o);
  });
  return out;
}
