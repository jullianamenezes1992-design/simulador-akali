/** Aparece na hora do toque, enquanto a página do site carrega. */
export default function CarregandoSite() {
  return (
    <div className="container-page animate-pulse space-y-4 py-10" aria-busy="true" aria-label="Carregando">
      <div className="h-8 w-64 max-w-full rounded-lg bg-line" />
      <div className="h-4 w-96 max-w-full rounded bg-line/70" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 rounded-2xl bg-mist" />
        ))}
      </div>
    </div>
  );
}
