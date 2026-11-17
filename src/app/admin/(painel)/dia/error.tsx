"use client";

/** Se algo quebrar no Meu dia, mostra o motivo (para o suporte) em vez de uma tela em branco. */
export default function ErroMeuDia({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="card p-5">
      <h1 className="text-lg font-bold">Não consegui abrir o Meu dia</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Tente de novo. Se continuar, mande um print desta tela.
      </p>
      <pre className="mt-3 whitespace-pre-wrap text-xs text-red-700">
        {error.message}
        {error.digest ? `\n(código ${error.digest})` : ""}
        {"\n"}
        {(error.stack ?? "").split("\n").slice(1, 8).join("\n")}
      </pre>
      <button type="button" onClick={reset} className="btn-primary mt-3">
        Tentar de novo
      </button>
    </div>
  );
}
