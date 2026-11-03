export function PageHeader({ titulo, descricao, children }: { titulo: string; descricao?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold">{titulo}</h1>
        {descricao && <p className="mt-1 text-sm text-ink-soft">{descricao}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function StatCard({ label, valor, sub }: { label: string; valor: string | number; sub?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink">{valor}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}

export function Feedback({ erro, mensagem }: { erro?: string; mensagem?: string }) {
  if (erro) return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{erro}</p>;
  if (mensagem) return <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">{mensagem}</p>;
  return null;
}
