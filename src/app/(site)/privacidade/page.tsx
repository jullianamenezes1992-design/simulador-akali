import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { CONSENT_VERSION } from "@/lib/constants";

export const metadata: Metadata = { title: "Política de Privacidade" };

export default async function Privacidade() {
  const s = await getSettings();
  const contato = s.encarregado_dados ?? s.email_contato ?? "o canal de atendimento informado no site";
  return (
    <article className="container-page max-w-3xl py-10 sm:py-14">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-ink-soft">Versão {CONSENT_VERSION}. Modelo base — revise com a assessoria jurídica da empresa antes da publicação.</p>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-ink [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-extrabold [&_li]:ml-5 [&_li]:list-disc [&_p]:text-ink-soft [&_li]:text-ink-soft">
        <p>
          Esta política explica como a <strong className="text-ink">{s.empresa_nome}</strong>
          {s.creci ? ` (${s.creci})` : ""} trata os dados pessoais coletados nesta plataforma, em conformidade com a Lei Geral de
          Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD).
        </p>

        <h2>1. Quem somos</h2>
        <p>
          Somos uma corretora de imóveis independente. Esta plataforma <strong className="text-ink">não é um canal oficial</strong>{" "}
          da Caixa Econômica Federal, do Governo Federal ou do programa Minha Casa, Minha Vida, e a pré-simulação não substitui a
          análise do agente financeiro.
        </p>

        <h2>2. Dados que coletamos</h2>
        <ul>
          <li>Identificação e contato: nome, data de nascimento, estado civil, telefone/WhatsApp e e-mail.</li>
          <li>Informações financeiras declaradas: profissão, tipo e valor de renda, composição de renda, saldo de FGTS e restrição cadastral.</li>
          <li>Preferências de imóvel: regiões, dormitórios, vaga e prazo de compra.</li>
          <li>Navegação: empreendimentos visualizados, cliques no WhatsApp, origem da visita (parâmetros de campanha) e, com o seu consentimento, cookies de medição do Google e da Meta.</li>
        </ul>

        <h2>3. Para que usamos</h2>
        <ul>
          <li>Calcular a pré-simulação e indicar empreendimentos compatíveis com o seu perfil.</li>
          <li>Entrar em contato para o atendimento que você solicitar e acompanhar o processo de compra.</li>
          <li>Enviar novidades e ofertas, apenas se você autorizar.</li>
          <li>Medir o desempenho do site e das campanhas, apenas com o seu consentimento de cookies.</li>
        </ul>

        <h2>4. Bases legais</h2>
        <p>
          Tratamos os dados com base no seu consentimento (art. 7º, I), em procedimentos preliminares a contrato a seu pedido
          (art. 7º, V) e no legítimo interesse para segurança e prevenção a fraudes (art. 7º, IX), sempre respeitando seus
          direitos.
        </p>

        <h2>5. Compartilhamento</h2>
        <p>
          Seus dados podem ser compartilhados com construtoras/incorporadoras dos empreendimentos de seu interesse, com
          correspondentes bancários e com o agente financeiro para análise de crédito — somente quando você seguir com o
          atendimento. Também usamos fornecedores de tecnologia (hospedagem e banco de dados) que atuam como operadores. Não
          vendemos dados pessoais.
        </p>

        <h2>6. Segurança</h2>
        <ul>
          <li>A simulação não pede CPF nem documentos. Eles só são solicitados no atendimento, se você seguir com a compra.</li>
          <li>O acesso ao painel exige autenticação e cada alteração fica registrada em histórico.</li>
          <li>O link de WhatsApp gerado pela plataforma não contém dados financeiros.</li>
        </ul>

        <h2>7. Por quanto tempo guardamos</h2>
        <p>
          Mantemos os dados pelo tempo necessário ao atendimento e às obrigações legais. Cadastros sem andamento comercial
          podem ser anonimizados periodicamente ou a qualquer momento a seu pedido.
        </p>

        <h2>8. Seus direitos</h2>
        <p>
          Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade, eliminação dos dados
          tratados com consentimento, informação sobre compartilhamentos e revogação do consentimento. Para isso, fale com o
          nosso encarregado de dados: <strong className="text-ink">{contato}</strong>.
        </p>

        <h2>9. Cookies</h2>
        <p>
          Cookies de medição (Google Analytics, Google Ads e Meta Pixel) só são ativados se você aceitar no aviso de cookies.
          Você pode mudar sua escolha a qualquer momento em &ldquo;Preferências de cookies&rdquo;, no rodapé.
        </p>
      </div>
    </article>
  );
}
