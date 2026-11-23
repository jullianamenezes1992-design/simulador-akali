"use client";

import { useActionState, useState, useTransition } from "react";
import { Check, Copy, Loader2, Save, Send, Users } from "lucide-react";
import { enviarAgoraEquipe, salvarIntegracaoEquipe, type ActionState } from "@/app/admin/actions";
import { Feedback } from "./ui";

export interface IntegracaoView {
  ativo: boolean;
  chave: string | null;
  url_retorno: string | null;
  ultimo_recebido: string | null;
  ultimo_envio: string | null;
  ultimo_erro: string | null;
  pendentes: number;
  leads: number;
  endereco: string;
}

const quando = (v: string | null) =>
  v ? new Date(v).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }) : "nunca";

function Copiar({ texto, rotulo }: { texto: string; rotulo: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(texto).then(() => (setOk(true), setTimeout(() => setOk(false), 2000)))}
      className="btn-secondary !py-1.5 text-sm"
    >
      {ok ? <Check size={15} /> : <Copy size={15} />} {ok ? "Copiado" : rotulo}
    </button>
  );
}

export default function IntegracaoEquipeForm({ i }: { i: IntegracaoView }) {
  const [state, action, pending] = useActionState<ActionState & { chave?: string }, FormData>(salvarIntegracaoEquipe, {});
  const [envio, setEnvio] = useState<string | null>(null);
  const [enviando, startEnvio] = useTransition();
  const chave = state.chave ?? i.chave;
  const texto = textoGerente(i.endereco, chave ?? "<gere a chave primeiro>");

  return (
    <form action={action} className="card mt-6 space-y-4 p-4">
      <div className="flex items-start gap-3">
        <Users className="mt-0.5 shrink-0 text-caixa" size={22} />
        <div>
          <h2 className="font-bold">CRM da equipe (do seu gerente)</h2>
          <p className="hint">
            Os leads que o CRM da equipe mandar para você entram aqui em Leads (origem “Equipe”). Quando você muda a etapa ou escreve uma
            observação nesses leads, o CRM da equipe é avisado.
          </p>
        </div>
      </div>

      <label className="option w-fit">
        <input type="checkbox" name="ativo" defaultChecked={i.ativo} className="accent-caixa" /> Integração ligada
      </label>

      <div className="grid gap-1">
        <span className="label">Endereço do seu CRM para receber leads</span>
        <div className="flex flex-wrap items-center gap-2">
          <code className="rounded bg-mist px-2 py-1 text-xs [overflow-wrap:anywhere]">{i.endereco}</code>
          <Copiar texto={i.endereco} rotulo="Copiar endereço" />
        </div>
      </div>

      <div className="grid gap-1">
        <span className="label">Chave da integração</span>
        {chave ? (
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded bg-mist px-2 py-1 text-xs [overflow-wrap:anywhere]">{chave.slice(0, 10)}••••••••</code>
            <Copiar texto={chave} rotulo="Copiar chave" />
            <label className="option w-fit text-xs">
              <input type="checkbox" name="nova_chave" value="1" className="accent-caixa" /> gerar uma chave nova ao salvar (a antiga para de funcionar)
            </label>
          </div>
        ) : (
          <p className="text-sm text-ink-soft">Salve uma vez que a chave é criada automaticamente.</p>
        )}
        <p className="hint">Passe a chave só para o seu gerente, em particular. Ela é a “senha” entre os dois CRMs.</p>
      </div>

      <label className="grid gap-1">
        <span className="label">Endereço do CRM da equipe que recebe as suas atualizações</span>
        <input name="url_retorno" defaultValue={i.url_retorno ?? ""} placeholder="https://crm-da-equipe.vercel.app/api/..." className="input" />
        <span className="hint">O seu gerente te passa esse endereço depois de preparar o CRM dele.</span>
      </label>

      <div className="rounded-xl bg-mist p-3 text-sm">
        <p>
          <strong>{i.leads}</strong> lead(s) da equipe no seu CRM · último lead recebido: <strong>{quando(i.ultimo_recebido)}</strong>
        </p>
        <p>
          Última atualização enviada: <strong>{quando(i.ultimo_envio)}</strong> · na fila: <strong>{i.pendentes}</strong>
        </p>
        {i.ultimo_erro && <p className="mt-1 font-semibold text-red-700">Último erro ao enviar: {i.ultimo_erro}</p>}
      </div>

      <details className="rounded-xl border border-line p-3">
        <summary className="cursor-pointer font-semibold">Texto para o seu gerente colar no Claude do CRM dele</summary>
        <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded bg-mist p-2 text-xs">{texto}</pre>
        <div className="mt-2">
          <Copiar texto={texto} rotulo="Copiar texto" />
        </div>
      </details>

      <Feedback erro={state.erro} mensagem={state.ok ? (state.chave ? "Salvo. Chave criada — copie e mande para o seu gerente." : "Salvo.") : undefined} />
      <div className="flex flex-wrap gap-2">
        <button disabled={pending} className="btn-primary">
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar
        </button>
        <button
          type="button"
          disabled={enviando}
          onClick={() =>
            startEnvio(async () => {
              const r = await enviarAgoraEquipe();
              setEnvio(r.erro ? `Falhou: ${r.erro}` : `${r.enviados} atualização(ões) enviada(s).`);
            })
          }
          className="btn-secondary"
        >
          {enviando ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Enviar atualizações agora
        </button>
      </div>
      {envio && <p className="text-sm">{envio}</p>}
    </form>
  );
}

function textoGerente(endereco: string, chave: string) {
  return `Quero integrar o meu CRM com o CRM da corretora Julliana (Corretora Akali), nos dois sentidos. Implemente no meu CRM:

1) ENVIAR LEADS PARA O CRM DELA
Sempre que um lead da campanha for atribuído a ela (e também os que já estão com ela hoje), faça um POST para:
${endereco}
Cabeçalhos: Content-Type: application/json e Authorization: Bearer ${chave}
Corpo (um lead ou uma lista de até 200):
{
  "id": "id do lead no meu CRM (texto, único)",
  "nome": "Nome do cliente",
  "telefone": "11999998888",
  "email": "opcional",
  "renda": 3500,
  "campanha": "nome da campanha do Facebook",
  "origem": "Facebook Ads",
  "regiao": "opcional",
  "observacao": "opcional",
  "criado_em": "2026-11-23T14:00:00-03:00"
}
Resposta: {"ok":true,"criados":1,"atualizados":0,"erros":0,"resultados":[...]}. Mandar o mesmo id de novo não duplica (só completa dados vazios e adiciona a observação).
Se a resposta não for 200, tente de novo mais tarde.

2) RECEBER AS ATUALIZAÇÕES DELA
Crie no meu CRM um endereço (rota) que aceite POST com JSON, só se o cabeçalho for "Authorization: Bearer ${chave}". Ele recebe:
{
  "evento": "status" ou "observacao",
  "id": "o mesmo id do lead no meu CRM",
  "nome": "Nome do cliente",
  "status": "codigo da etapa", "status_nome": "nome da etapa", "status_anterior": "codigo ou null",
  "observacao": "texto (quando evento = observacao)",
  "quando": "data e hora",
  "corretora": "Corretora Akali"
}
Ao receber, atualize a etapa do lead e registre a observação no histórico dele. Responda 200 quando der certo.
Etapas possíveis: novo, simulacao, em_atendimento, sem_resposta, documentacao, analise_credito, serasa_bacen, aprovado, reprovado, visita, proposta, vendido, perdido, arquivado.
Depois me passe o endereço completo dessa rota para eu colocar no CRM dela.`;
}
