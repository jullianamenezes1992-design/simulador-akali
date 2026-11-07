import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import EditorMensagens from "@/components/admin/EditorMensagens";
import { LEAD_STATUS } from "@/lib/constants";
import { mensagensDaEtapa, VARIAVEIS } from "@/lib/mensagens-prontas";
import { requireAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Mensagens prontas" };

export default async function MensagensPage() {
  const { supabase, papel } = await requireAdmin();
  const { data: salvas } = await supabase.from("mensagens_prontas").select("status, ordem, titulo, texto");
  return (
    <>
      <PageHeader titulo="Mensagens prontas" descricao="Na ficha do cliente aparecem 3 mensagens de WhatsApp para a etapa em que ele está. Aqui você ajusta os textos." />
      <section className="card mb-4 p-4 text-sm">
        <p className="mb-2 font-semibold">Palavras que são trocadas automaticamente:</p>
        <ul className="grid gap-1 sm:grid-cols-2">
          {VARIAVEIS.map((v) => (
            <li key={v.chave}>
              <code className="rounded bg-mist px-1.5 py-0.5 font-bold text-caixa">{v.chave}</code> {v.desc}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-ink-soft">Trechos entre colchetes, como [DIA] ou [DOCUMENTO], você completa na hora de enviar. *Asteriscos* deixam o texto em negrito no WhatsApp.</p>
      </section>
      {papel !== "admin" ? (
        <p className="card p-4 text-sm text-ink-soft">Somente administradores podem editar as mensagens.</p>
      ) : (
        <div className="space-y-3">
          {LEAD_STATUS.map((s) => (
            <EditorMensagens
              key={s.value}
              status={s.value}
              etapa={s.label}
              itens={mensagensDaEtapa(s.value, salvas ?? []).map(({ ordem, titulo, texto }) => ({ ordem, titulo, texto }))}
              personalizada={(salvas ?? []).some((x) => x.status === s.value)}
            />
          ))}
        </div>
      )}
    </>
  );
}
