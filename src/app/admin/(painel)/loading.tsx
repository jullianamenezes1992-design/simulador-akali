/** Aparece na hora em que você toca numa aba, enquanto a página carrega. */
export default function CarregandoPainel() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Carregando">
      <div className="h-7 w-48 rounded-lg bg-line" />
      <div className="h-4 w-72 max-w-full rounded bg-line/70" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-white" />
        ))}
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 rounded-2xl bg-white" />
      ))}
    </div>
  );
}
