"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
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

/** Data/hora "AAAA-MM-DDTHH:MM" (fuso de São Paulo), para o campo "Quando". */
function localSP(d: Date) {
  return `${diaSP(d)}T${horaSP(d)}`;
}

/** Soma dias a um dia "AAAA-MM-DD" (sem depender do fuso do navegador). */
function somarDias(dia: string, n: number) {
  return diaSP(new Date(new Date(`${dia}T12:00:00-03:00`).getTime() + n * 864e5));
}

/** Atalhos de horário, como no CRM da equipe. */
function atalhos() {
  const agora = Date.now();
  const hoje = diaSP();
  // daqui a 2 horas, arredondado para os próximos 15 minutos
  const q = 15 * 60 * 1000;
  const em2h = new Date(Math.ceil((agora + 2 * 3600 * 1000) / q) * q);
  return [
    { label: "Daqui a 2 horas", valor: localSP(em2h) },
    { label: "Amanhã 10h", valor: `${somarDias(hoje, 1)}T10:00` },
    { label: "Amanhã 18h", valor: `${somarDias(hoje, 1)}T18:00` },
    { label: "Em 3 dias", valor: `${somarDias(hoje, 3)}T10:00` },
    { label: "Próxima semana", valor: `${somarDias(hoje, 7)}T10:00` },
  ];
}

export function NovaTarefaForm({ leadId, leadNome }: { leadId: string; leadNome?: string }) {
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState("ligacao");
  const [quando, setQuando] = useState("");
  const [opcoes, setOpcoes] = useState<ReturnType<typeof atalhos>>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  // salvou: fecha a janela e mostra o aviso ao lado do botão
  const [state, action, pending] = useActionState<ActionState, FormData>(async (prev, fd) => {
    const r = await criarTarefa(prev, fd);
    if (r.ok) {
      setAberto(false);
      setAviso(r.mensagem ?? "Contato agendado.");
    }
    return r;
  }, {});
  const c = state.campos ?? {};

  const abrir = () => {
    const ops = atalhos();
    setOpcoes(ops);
    setQuando(ops[1].valor); // padrão: amanhã 10h
    setTipo("ligacao");
    setAviso(null);
    setAberto(true);
  };

  // Esc fecha a janela
  useEffect(() => {
    if (!aberto) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [aberto]);

  const [data, hora] = quando ? quando.split("T") : ["", ""];

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary w-full sm:w-auto" onClick={abrir}>
          <Plus size={16} /> Programar contato
        </button>
        {aviso && (
          <span className="text-sm font-medium text-emerald-700">
            <Check size={14} className="mr-1 inline" aria-hidden />
            {aviso}
          </span>
        )}
      </div>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={(e) => e.target === e.currentTarget && setAberto(false)}
        >
          <form
            action={action}
            role="dialog"
            aria-modal="true"
            aria-labelledby="t_titulo"
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-7"
          >
            <input type="hidden" name="lead_id" value={leadId} />
            <input type="hidden" name="data" value={data} />
            <input type="hidden" name="hora" value={hora} />

            <h2 id="t_titulo" className="text-2xl font-bold text-ink">Programar contato</h2>
            {leadNome && <p className="mt-1 text-ink-soft">{leadNome}</p>}

            <div className="mt-5 flex flex-wrap gap-2">
              {opcoes.map((o) => (
                <button
                  key={o.label}
                  type="button"
                  onClick={() => setQuando(o.valor)}
                  className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
                    quando === o.valor ? "border-caixa bg-caixa-50 text-caixa" : "border-line bg-white text-ink hover:bg-mist"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="t_quando">Quando</label>
                <input
                  id="t_quando"
                  type="datetime-local"
                  value={quando}
                  onChange={(e) => setQuando(e.target.value)}
                  required
                  className="input"
                />
                {c.data && <p className="field-error">{c.data}</p>}
              </div>
              <div>
                <label className="label" htmlFor="t_tipo">Tipo</label>
                <select id="t_tipo" name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} className="input">
                  {TIPOS_TAREFA.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {c.tipo && <p className="field-error">{c.tipo}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="t_desc">O que fazer</label>
                <input
                  id="t_desc"
                  name="descricao"
                  maxLength={1000}
                  className="input"
                  placeholder="Ex.: enviar a simulação do Residencial"
                />
              </div>
              <div className="sm:col-span-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                <label className="flex items-center gap-2 text-sm text-ink-soft" htmlFor="t_lembrar">
                  <Bell size={14} aria-hidden /> Me avisar
                  <select id="t_lembrar" name="lembrar_min" defaultValue="30" className="input w-auto py-1.5 text-sm">
                    {LEMBRAR_OPCOES.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>
                {tipo === "visita" && (
                  <label className="flex items-center gap-2 text-sm text-ink-soft">
                    <input type="checkbox" name="mudar_etapa" defaultChecked className="accent-caixa" />
                    Mudar a etapa para &quot;Visita agendada&quot;
                  </label>
                )}
              </div>
            </div>

            <Feedback erro={state.erro} />

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => setAberto(false)}>
                Cancelar
              </button>
              <button className="btn-primary" disabled={pending || !quando}>
                {pending ? <Loader2 size={16} className="animate-spin" /> : <CalendarPlus size={16} />} Agendar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
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
