/** Dias especiais da rotina (folga e dias externos). Fica fora do componente cliente para a página do servidor também poder usar. */
export const TIPOS_DIA = {
  folga: { emoji: "🌴", label: "Folga" },
  evento: { emoji: "🎪", label: "Evento" },
  meeting: { emoji: "💼", label: "Meeting" },
  live: { emoji: "🎥", label: "Live" },
} as const;
