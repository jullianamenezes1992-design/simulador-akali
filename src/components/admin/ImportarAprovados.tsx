"use client";

import { useActionState, useState } from "react";
import { Download, Loader2, Upload, X } from "lucide-react";
import { importarAprovados } from "@/app/admin/actions";

const MODELO =
  "Nome;Telefone;Data da análise;Vencimento;Tipo de renda;Renda familiar;Financiamento;Subsídio;FGTS;Entrada;Prazo;Parcela máxima;Classificação;Região;Dormitórios;Status;Observações\n" +
  "Maria Exemplo;11912345678;01/11/2026;30/01/2027;CLT;4500,00;210000,00;20000,00;8000,00;0;420;1350,00;Quente;Zona Leste;2;Ativo;Quer perto do metrô\n";

export default function ImportarAprovados() {
  const [aberto, setAberto] = useState(false);
  const [estado, acao, pending] = useActionState(importarAprovados, {});
  if (!aberto)
    return (
      <button type="button" className="btn-secondary" onClick={() => setAberto(true)}>
        <Upload size={16} /> Importar planilha
      </button>
    );
  return (
    <section className="card w-full p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-bold">Importar planilha de aprovados</h2>
        <button type="button" onClick={() => setAberto(false)} className="rounded-lg p-1 text-ink-soft hover:bg-mist" aria-label="Fechar">
          <X size={20} />
        </button>
      </div>
      <p className="mb-3 text-sm text-ink-soft">
        Aceita Excel (.xlsx) ou CSV. A primeira linha deve ter os títulos das colunas: <strong>Nome</strong> e <strong>Telefone</strong> são obrigatórios; as
        demais (vencimento, renda, financiamento, subsídio, FGTS, entrada, prazo, parcela, classificação, região, dormitórios, status, observações) são
        opcionais. Quem já estiver cadastrado (mesmo telefone) é ignorado, e quem já for cliente do CRM é vinculado automaticamente.
      </p>
      <a
        href={`data:text/csv;charset=utf-8,${encodeURIComponent("﻿" + MODELO)}`}
        download="modelo-aprovados.csv"
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-caixa"
      >
        <Download size={14} /> Baixar planilha modelo
      </a>
      <form action={acao} className="flex flex-wrap items-center gap-3">
        <input type="file" name="arquivo" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required className="text-sm" />
        <button className="btn-primary" disabled={pending}>
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Importar
        </button>
      </form>
      {estado.mensagem && <p className={`mt-3 rounded-xl px-3 py-2 text-sm ${estado.ok ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>{estado.mensagem}</p>}
      {estado.erro && !estado.mensagem && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-900">{estado.erro}</p>}
    </section>
  );
}
