export const dynamic = "force-static";

export function GET() {
  const manifest = {
    id: "/admin",
    name: "Akali CRM",
    short_name: "Akali CRM",
    description: "Painel da corretora Akali Imóveis: clientes, agenda e empreendimentos.",
    start_url: "/admin/agenda?app=1",
    scope: "/admin",
    display: "standalone",
    orientation: "portrait",
    background_color: "#005CA9",
    theme_color: "#005CA9",
    lang: "pt-BR",
    icons: [
      { src: "/app/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/app/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/app/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Agenda", url: "/admin/agenda", icons: [{ src: "/app/icon-192.png", sizes: "192x192" }] },
      { name: "Leads", url: "/admin/leads", icons: [{ src: "/app/icon-192.png", sizes: "192x192" }] },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" },
  });
}
