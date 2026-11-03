import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "../supabase/server";

export interface AdminCtx {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  email: string | null;
  nome: string;
  papel: "admin" | "corretor";
}

/** Garante usuário autenticado e cadastrado em admin_users. Redireciona caso contrário. */
export const requireAdmin = cache(async (): Promise<AdminCtx> => {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/admin/login");
  const { data: adm } = await supabase.from("admin_users").select("nome, papel").eq("user_id", auth.user.id).maybeSingle();
  if (!adm) redirect("/admin/login?erro=sem-permissao");
  return { supabase, userId: auth.user.id, email: auth.user.email ?? null, nome: adm.nome, papel: adm.papel };
});

/** Para Server Actions e rotas: não redireciona, lança erro. */
export async function assertAdmin(superadmin = false): Promise<AdminCtx> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Sessão expirada. Entre novamente.");
  const { data: adm } = await supabase.from("admin_users").select("nome, papel").eq("user_id", auth.user.id).maybeSingle();
  if (!adm) throw new Error("Acesso negado.");
  if (superadmin && adm.papel !== "admin") throw new Error("Apenas administradores podem fazer esta alteração.");
  return { supabase, userId: auth.user.id, email: auth.user.email ?? null, nome: adm.nome, papel: adm.papel };
}
