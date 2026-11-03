import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSettings } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { default: `${s.empresa_nome} — Simulador Minha Casa, Minha Vida`, template: `%s | ${s.empresa_nome}` },
    description:
      "Faça uma pré-simulação gratuita do Minha Casa, Minha Vida e encontre empreendimentos em São Paulo compatíveis com o seu perfil.",
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  };
}

export const viewport: Viewport = {
  themeColor: "#005CA9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
