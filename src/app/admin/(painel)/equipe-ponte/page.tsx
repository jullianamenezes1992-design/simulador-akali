import type { Metadata } from "next";
import { requireAdmin } from "@/lib/server/auth";
import PonteEquipe from "@/components/admin/PonteEquipe";

export const metadata: Metadata = { title: "Sincronizando com o CRM da equipe" };

/** Aberta pela aba do CRM da equipe (login da corretora): recebe os leads e devolve as atualizações pendentes. */
export default async function PontePage() {
  await requireAdmin();
  return <PonteEquipe />;
}
