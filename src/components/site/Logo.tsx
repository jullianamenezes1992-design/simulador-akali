/** Marca própria da corretora (não utiliza logotipo da Caixa). */
export default function Logo({ nome, light = false }: { nome: string; light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <rect width="34" height="34" rx="9" fill={light ? "#ffffff" : "#005CA9"} />
        <path d="M8 18.5 17 10l9 8.5V26a1 1 0 0 1-1 1h-5.5v-5.5h-5V27H9a1 1 0 0 1-1-1z" fill={light ? "#005CA9" : "#ffffff"} />
        <rect x="21.5" y="7" width="4" height="4" rx="1" fill="#F5A623" />
      </svg>
      <span className={`text-lg font-extrabold tracking-tight ${light ? "text-white" : "text-ink"}`}>{nome}</span>
    </span>
  );
}
