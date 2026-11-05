import type { Metadata, Viewport } from "next";
import { Gabarito, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const gabarito = Gabarito({ subsets: ["latin"], weight: ["600", "700", "800", "900"], variable: "--font-gabarito", display: "swap" });
import { getSettings } from "@/lib/data";

function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return new URL(process.env.NEXT_PUBLIC_SITE_URL);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  return undefined;
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { default: `${s.empresa_nome} — Simulador Minha Casa, Minha Vida`, template: `%s | ${s.empresa_nome}` },
    description:
      "Faça uma pré-simulação gratuita do Minha Casa, Minha Vida e encontre empreendimentos em São Paulo compatíveis com o seu perfil.",
    metadataBase: siteUrl(),
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: s.empresa_nome,
      title: `${s.empresa_nome} — Simulador Minha Casa, Minha Vida`,
      description: "Faça uma pré-simulação gratuita e veja os empreendimentos em São Paulo que combinam com o seu perfil.",
      // quadrada primeiro: o WhatsApp mostra a miniatura recortada em quadrado
      // imagem pequena (menos de 300 px): o WhatsApp mostra miniatura ao lado do texto, sem o "banner" grande
      images: [{ url: "/og-mini.jpg?v=3", width: 240, height: 240, alt: "Simulador Minha Casa, Minha Vida — Akali Imóveis" }],
    },
    twitter: { card: "summary", images: ["/og-mini.jpg?v=3"] },
  };
}

export const viewport: Viewport = {
  themeColor: "#005CA9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${gabarito.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
