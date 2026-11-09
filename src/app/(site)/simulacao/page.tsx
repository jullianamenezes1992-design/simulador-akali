import type { Metadata } from "next";
import SimulacaoForm from "@/components/simulacao/SimulacaoForm";
import { getActiveParams } from "@/lib/data";

export const metadata: Metadata = {
  title: "Pré-simulação Minha Casa, Minha Vida",
  description: "Preencha a pré-simulação e veja os empreendimentos compatíveis com o seu perfil.",
};

export default async function SimulacaoPage() {
  const ativo = await getActiveParams();
  return (
    <div className="bg-mist">
      <div className="container-page max-w-2xl py-8 sm:py-12">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Simulação Minha Casa, Minha Vida</h1>
        <p className="mt-2 text-sm text-ink-soft">
          São só 3 passos rápidos para ver quanto você pode financiar e os imóveis que combinam com você. O resultado é uma
          estimativa e depende da análise e aprovação da Caixa.
        </p>
        {!ativo && (
          <p className="mt-4 rounded-xl bg-sol-50 px-4 py-3 text-sm font-medium text-ink">
            Os parâmetros de simulação ainda não foram configurados. Você pode preencher o formulário, mas o envio ficará
            indisponível até a configuração no painel.
          </p>
        )}
        <div className="mt-6">
          <SimulacaoForm />
        </div>
      </div>
    </div>
  );
}
