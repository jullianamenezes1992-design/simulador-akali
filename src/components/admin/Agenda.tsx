"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  CalendarClock,
  CalendarPlus,
  Check,
  FileText,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  RotateCcw,
  Users,
  X,
} from "lucide-react";
import { atualizarTarefa, criarTarefa, remarcarTarefa, type ActionState } from "@/app/admin/actions";
import { LEMBRAR_OPCOES, TIPOS_TAREFA } from "@/lib/constants";
import { diaCurtoSP, diaSP, horaSP, linkGoogleAgenda, tipoTarefaLabel, type Tarefa } from "@/lib/agenda";
import { maskPhone } from "@/lib/format";
import { Feedback } from "./ui";

const ICONE: Record<string, typeof Phone> = {
  ligacao: Phone,
  whatsapp: MessageCircle,
  visita: MapPin,
  reuniao: Users,
  documentos: FileText,
  lembrete: Bell,
};

/** Próxima hora cheia, no fuso de São Paulo. */
function padraoDataHora() {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  const dia = diaSP(d);
  const hora = horaSP(d).slice(0, 2);
  return { dia, hora: `${hora}:00` };
}

export function NovaTarefaForm({ leadId }: { leadId: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(criarTarefa, {});
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState("ligacao");
  const [padrao] = useState(padraoDataHora);
  const ref = useRef<HTMLFormElement>(null);
  const c = state.campos ?? {};

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  if (!aberto) {
    return (
      <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => setAberto(true)}>
        <Plus size={16} /> Agendar
      </button>
    );
  }

  return (
    <form ref={ref} action={action} className="space-y-3 rounded-xl bg-mist p-3">
      <input type="hidden" name="lead_id" value={leadId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="t_tipo">Tipo</label>
          <select id="t_tipo" name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} className="input">
            {TIPOS_TAREFA.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {c.tipo && <p className="field-error">{c.tipo}</p>}
        </div>
        <div>
          <label className="label" htmlFor="t_lembrar">Me avisar</label>
          <select id="t_lembrar" name="lembrar_min" defaultValue="30" className="input">
            {LEMBRAR_OPCOES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="t_data">Data</label>
          <input id="t_data" name="data" type="date" defaultValue={padrao.dia} required className="input" />
          {c.data && <p className="field-error">{c.data}</p>}
        </div>
        <div>
          <label className="label" htmlFor="t_hora">Hora</label>
          <input id="t_hora" name="hora" type="time" defaultValue={padrao.hora} required className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="t_desc">Anotação (opcional)</label>
          <textarea id="t_desc" name="descricao" rows={2} maxLength={1000} className="input min-h-0" placeholder="Ex.: levar tabela do Urban Vila Maria" />
        </div>
        {tipo === "visita" && (
          <label className="option sm:col-span-2 w-fit">
            <input type="checkbox" name="mudar_etapa" defaultChecked className="accent-caixa" />
            Mudar a etapa do cliente para &quot;Visita agendada&quot;
          </label>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" disabled={pending}>
          {pending ? <Loader2 size={16} className="animate-spin" /> : <CalendarPlus size={16} />} Salvar compromisso
        </button>
        <button type="button" className="btn-secondary" onClick={() => setAberto(false)}>
          Fechar
        </button>
      </div>
      <Feedback erro={state.erro} mensagem={state.ok ? state.mensagem : undefined} />
    </form>
  );
}

export function TarefaItem({ t, mostrarCliente = false, hoje, agora }: { t: Tarefa; mostrarCliente?: boolean; hoje: string; agora: number }) {
  const [pending, start] = useTransition();
  const [remarcando, setRemarcando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const Icon = ICONE[t.tipo] ?? Bell;
  const atrasado = t.status === "pendente" && new Date(t.quando).getTime() < agora - 60_000;
  const feito = t.status !== "pendente";
  const dia = diaSP(t.quando);
  const quandoTxt = `${dia === hoje ? "Hoje" : diaCurtoSP(t.quando)} às ${horaSP(t.quando)}`;

  const run = (fn: () => Promise<unknown>) =>
    start(async () => {
      setErro(null);
      try {
        await fn();
        setRemarcando(false);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao salvar.");
      }
    });

  return (
    <li className={`rounded-xl border p-3 text-sm ${atrasado ? "border-red-200 bg-red-50" : "border-line bg-white"} ${feito ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${atrasado ? "bg-red-100 text-red-700" : "bg-caixa-50 text-caixa"}`}>
          <Icon size={16} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`font-semibold ${feito ? "line-through" : ""}`}>
            {tipoTarefaLabel(t.tipo)}
            {mostrarCliente && t.lead && (
              <>
                {" · "}
                <Link href={`/admin/leads/${t.lead.id}`} className="text-caixa hover:underline">{t.lead.nome}</Link>
              </>
            )}
          </p>
          <p className={`text-xs ${atrasado ? "font-semibold text-red-700" : "text-ink-soft"}`}>
            <CalendarClock size={12} className="mr-1 inline" aria-hidden />
            {quandoTxt}
            {atrasado && " · atrasado"}
            {t.status === "feito" && " · feito"}
            {t.status === "cancelado" && " · cancelado"}
          </p>
          {t.descricao && <p className="mt-1 whitespace-pre-line text-ink-soft">{t.descricao}</p>}

          {remarcando && (
            <form
              className="mt-2 flex flex-wrap items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                run(() => remarcarTarefa(t.id, String(f.get("data")), String(f.get("hora"))));
              }}
            >
              <input name="data" type="date" defaultValue={dia} required className="input w-auto" aria-label="Nova data" />
              <input name="hora" type="time" defaultValue={horaSP(t.quando)} required className="input w-auto" aria-label="Nova hora" />
              <button className="btn-primary" disabled={pending}>Salvar</button>
              <button type="button" className="btn-secondary" onClick={() => setRemarcando(false)}>Cancelar</button>
            </form>
          )}

          <div className="mt-2 flex flex-wrap gap-1.5">
            {!feito ? (
              <>
                <button type="button" className="chip bg-emerald-100 px-3 py-1.5 text-emerald-800 hover:bg-emerald-200" disabled={pending} onClick={() => run(() => atualizarTarefa(t.id, "feito"))}>
                  {pending ? <Loader2 size={12} className="mr-1 animate-spin" /> : <Check size={12} className="mr-1" />} Feito
                </button>
                <button type="button" className="chip bg-white px-3 py-1.5 text-ink ring-1 ring-line hover:bg-mist" onClick={() => setRemarcando((v) => !v)}>
                  <CalendarClock size={12} className="mr-1" /> Remarcar
                </button>
                {mostrarCliente && t.lead && (
                  <a href={`https://wa.me/55${t.lead.telefone}`} target="_blank" rel="noreferrer" className="chip bg-[#25D366]/15 px-3 py-1.5 text-[#128C4B] hover:bg-[#25D366]/25">
                    <MessageCircle size={12} className="mr-1" /> {maskPhone(t.lead.telefone)}
                  </a>
                )}
                {t.lead && (
                  <a href={linkGoogleAgenda(t, t.lead)} target="_blank" rel="noreferrer" className="chip bg-white px-3 py-1.5 text-ink ring-1 ring-line hover:bg-mist">
                    <CalendarPlus size={12} className="mr-1" /> Google Agenda
                  </a>
                )}
                <button type="button" className="chip bg-white px-3 py-1.5 text-ink-soft ring-1 ring-line hover:bg-mist" disabled={pending} onClick={() => run(() => atualizarTarefa(t.id, "cancelado"))}>
                  <X size={12} className="mr-1" /> Cancelar
                </button>
              </>
            ) : (
              <button type="button" className="chip bg-white px-3 py-1.5 text-ink ring-1 ring-line hover:bg-mist" disabled={pending} onClick={() => run(() => atualizarTarefa(t.id, "pendente"))}>
                <RotateCcw size={12} className="mr-1" /> Desfazer
              </button>
            )}
          </div>
          {erro && <p className="field-error">{erro}</p>}
        </div>
      </div>
    </li>
  );
}
