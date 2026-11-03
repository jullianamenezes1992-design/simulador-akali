const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const brlCents = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const formatBRL = (v: number | null | undefined, cents = false) =>
  v == null || Number.isNaN(v) ? "—" : (cents ? brlCents : brl).format(v);

export const formatDate = (iso: string | null | undefined, withTime = false) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
};

export const onlyDigits = (s: string) => (s ?? "").replace(/\D/g, "");

export const maskCPF = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
};

export const maskPhone = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export const maskDate = (v: string) => {
  const d = onlyDigits(v).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};

/** Máscara de moeda: digita-se em centavos. Retorna string formatada "R$ 1.234,56". */
export const maskMoney = (v: string) => {
  const d = onlyDigits(v).slice(0, 12);
  if (!d) return "";
  return brlCents.format(Number(d) / 100);
};

/** Converte "R$ 1.234,56" (ou número) em número. */
export const parseMoney = (v: string | number | null | undefined): number => {
  if (typeof v === "number") return v;
  if (!v) return 0;
  const d = onlyDigits(v);
  return d ? Number(d) / 100 : 0;
};

/** "dd/mm/aaaa" -> "aaaa-mm-dd" (ou null se inválida) */
export const brDateToISO = (v: string): string | null => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v ?? "");
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = new Date(`${yyyy}-${mm}-${dd}T12:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.getUTCDate() !== Number(dd) || d.getUTCMonth() + 1 !== Number(mm)) return null;
  return `${yyyy}-${mm}-${dd}`;
};

/** Idade em meses completos numa data de referência. */
export const idadeEmMeses = (nascimentoISO: string, ref = new Date()): number => {
  const n = new Date(`${nascimentoISO}T12:00:00Z`);
  let meses = (ref.getUTCFullYear() - n.getUTCFullYear()) * 12 + (ref.getUTCMonth() - n.getUTCMonth());
  if (ref.getUTCDate() < n.getUTCDate()) meses -= 1;
  return meses;
};

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\[|\]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const firstName = (nome: string) => (nome ?? "").trim().split(/\s+/)[0] ?? "";
