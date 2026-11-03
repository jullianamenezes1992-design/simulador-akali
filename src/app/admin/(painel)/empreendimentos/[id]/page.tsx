import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import DevelopmentForm from "@/components/admin/DevelopmentForm";
import MediaManager from "@/components/admin/MediaManager";
import DeleteDevelopment from "@/components/admin/DeleteDevelopment";
import { PageHeader } from "@/components/admin/ui";
import { normalizeDev, type Development } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Editar empreendimento" };

export default async function EditarEmpreendimento({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ criado?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, papel } = await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await supabase.from("developments").select("*, development_media(*)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const dev = normalizeDev(data) as Development;

  const { data: hist } = await supabase
    .from("audit_log")
    .select("id, acao, dados_novos, created_at, ator_id")
    .in("tabela", ["developments"])
    .eq("registro_id", id)
    .order("created_at", { ascending: false })
    .limit(15);
  const { data: equipe } = await supabase.from("admin_users").select("user_id, nome");
  const nomes = new Map((equipe ?? []).map((e) => [e.user_id, e.nome]));

  return (
    <>
      <Link href="/admin/empreendimentos" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-caixa hover:underline">
        <ArrowLeft size={14} /> Empreendimentos
      </Link>
      <PageHeader titulo={dev.nome} descricao={`Página pública: /empreendimentos/${dev.slug}`}>
        <Link href={`/empreendimentos/${dev.slug}`} target="_blank" className="btn-secondary">
          <ExternalLink size={16} /> Ver no site
        </Link>
      </PageHeader>
      {sp.criado && (
        <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Empreendimento cadastrado. Agora envie as fotos e plantas.
        </p>
      )}
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="order-2 xl:order-1">
          <DevelopmentForm dev={dev} />
        </div>
        <div className="order-1 space-y-4 xl:order-2">
          <MediaManager developmentId={dev.id} media={dev.development_media ?? []} capaUrl={dev.capa_url} />
          <section className="card p-4">
            <h2 className="font-bold">Histórico de alterações</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {(hist ?? []).map((h) => (
                <li key={h.id} className="border-l-2 border-caixa-100 pl-3">
                  <p className="font-medium">
                    {h.acao === "insert" ? "Cadastro" : h.acao === "update" ? "Alteração" : h.acao}
                    {h.acao === "update" && h.dados_novos ? `: ${Object.keys(h.dados_novos).join(", ")}` : ""}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {nomes.get(h.ator_id ?? "") ?? "sistema"} • {formatDate(h.created_at, true)}
                  </p>
                </li>
              ))}
              {(hist ?? []).length === 0 && <li className="text-ink-soft">Sem registros.</li>}
            </ul>
          </section>
          {papel === "admin" && <DeleteDevelopment id={dev.id} nome={dev.nome} />}
        </div>
      </div>
    </>
  );
}
