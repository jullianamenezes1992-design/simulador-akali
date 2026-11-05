import type { Metadata, Viewport } from "next";
import RegistrarApp from "@/components/admin/RegistrarApp";

// O painel funciona como app instalável (PWA): ícone na tela de início, tela cheia e notificações.
export const metadata: Metadata = {
  manifest: "/admin/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Akali CRM", statusBarStyle: "default" },
  icons: { apple: [{ url: "/app/apple-touch-icon.png", sizes: "180x180" }] },
};

export const viewport: Viewport = {
  themeColor: "#005CA9",
  viewportFit: "cover",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RegistrarApp />
      {children}
    </>
  );
}
