import { TIPOS_TAREFA, TZ } from "./constants";

export interface Tarefa {
  id: string;
  lead_id: string;
  tipo: string;
  quando: string;
  descricao: string | null;
  status: "pendente" | "feito" | "cancelado";
  lembrar_min: number | null;
  concluido_em: string | null;
  lead?: { id: string; nome: string; codigo: string; telefone: string } | null;
}

export const tipoTarefaLabel = (v: string) => TIPOS_TAREFA.find((t) => t.value === v)?.label ?? v;

/** "2026-11-05" no fuso de São Paulo. */
export function diaSP(d: Date | string = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(d));
}

/** "14:30" no fuso de São Paulo. */
export function horaSP(d: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(d));
}

/** Hora cheia atual em São Paulo (0–23). */
export function horaAtualSP(): number {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", hourCycle: "h23" }).format(new Date()));
}

/** "qui., 05/11" */
export function diaCurtoSP(d: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, weekday: "short", day: "2-digit", month: "2-digit" }).format(new Date(d));
}

/** Data/hora digitadas no painel (horário de Brasília, sem horário de verão) → ISO. */
export function isoDeDataHoraSP(data: string, hora: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !/^\d{2}:\d{2}$/.test(hora)) return null;
  const d = new Date(`${data}T${hora}:00-03:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Soma dias a um "AAAA-MM-DD". */
export function somarDias(dia: string, n: number): string {
  const d = new Date(`${dia}T12:00:00-03:00`);
  d.setUTCDate(d.getUTCDate() + n);
  return diaSP(d);
}

/** Link "Adicionar ao Google Agenda" (1 hora de duração). Só nome e código do cliente, sem dados financeiros. */
export function linkGoogleAgenda(t: Pick<Tarefa, "tipo" | "quando" | "descricao">, cliente: { nome: string; codigo: string }) {
  const ini = new Date(t.quando);
  const fim = new Date(ini.getTime() + 60 * 60 * 1000);
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `${tipoTarefaLabel(t.tipo)} – ${cliente.nome}`,
    dates: `${f(ini)}/${f(fim)}`,
    details: [t.descricao, `Cliente ${cliente.codigo} (Akali Imóveis)`].filter(Boolean).join("\n"),
    ctz: TZ,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

/** Momento atual (função separada para não chamar Date.now() direto no render). */
export const agoraMs = () => Date.now();
