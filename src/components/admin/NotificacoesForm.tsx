"use client";

import { useActionState, useState, useTransition } from "react";
import { BellRing, Loader2, Save, Send } from "lucide-react";
import { salvarNotificacoes, testarNotificacoes, type ActionState } from "@/app/admin/actions";
import { Feedback } from "./ui";

export interface NotificacoesView {
  email_ativo: boolean;
  email_destino: string | null;
  tem_resend: boolean;
  whatsapp_ativo: boolean;
  whatsapp_numero: string | null;
  tem_callmebot: boolean;
  notificar_incompletas: boolean;
}

export default function NotificacoesForm({ n }: { n: NotificacoesView }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(salvarNotificacoes, {});
  const [teste, setTeste] = useState<{ email?: string; whatsapp?: string } | null>(null);
  const [testando, startTeste] = useTransition();
  const c = state.campos ?? {};
  const err = (k: string) => (c[k] ? <p className="field-error">{c[k]}</p> : null);
  const resultado = (v?: string) => (v === "ok" ? "Enviado ✓" : v === "desativado" ? "Desativado" : `Falhou: ${v}`);

  return (
    <form action={action} className="card mt-6 space-y-5 p-4">
      <div className="flex items-start gap-3">
        <BellRing className="mt-0.5 shrink-0 text-caixa" size={22} />
        <div>
          <h2 className="font-bold">Avisos de novos cadastros</h2>
          <p className="hint">Você recebe um aviso quando um cliente preenche nome e WhatsApp e outro quando conclui a simulação.</p>
        </div>
      </div>

      <label className="option w-fit">
        <input type="checkbox" name="notificar_incompletas" defaultChecked={n.notificar_incompletas} className="accent-caixa" />
        Avisar também quem começou e ainda não terminou a simulação
      </label>

      <fieldset className="grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-2">
        <legend className="px-1 font-semibold">E-mail</legend>
        <label className="option sm:col-span-2 w-fit">
          <input type="checkbox" name="email_ativo" defaultChecked={n.email_ativo} className="accent-caixa" />
          Enviar aviso por e-mail
        </label>
        <div>
          <label className="label" htmlFor="email_destino">E-mail que recebe os avisos</label>
          <input id="email_destino" name="email_destino" type="email" defaultValue={n.email_destino ?? ""} className="input" />
          {err("email_destino")}
          <p className="hint">Use o mesmo e-mail da sua conta no Resend.</p>
        </div>
        <div>
          <label className="label" htmlFor="resend_api_key">Chave do Resend</label>
          <input id="resend_api_key" name="resend_api_key" type="password" autoComplete="off" placeholder={n.tem_resend ? "•••••••• (já salva)" : "re_..."} className="input" />
          <p className="hint">Deixe em branco para manter a chave salva.</p>
        </div>
      </fieldset>

      <fieldset className="grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-2">
        <legend className="px-1 font-semibold">WhatsApp</legend>
        <label className="option sm:col-span-2 w-fit">
          <input type="checkbox" name="whatsapp_ativo" defaultChecked={n.whatsapp_ativo} className="accent-caixa" />
          Enviar aviso pelo WhatsApp
        </label>
        <div>
          <label className="label" htmlFor="notif_whatsapp">Seu WhatsApp (que recebe os avisos)</label>
          <input id="notif_whatsapp" name="whatsapp_numero" inputMode="numeric" defaultValue={n.whatsapp_numero ?? ""} placeholder="5511999999999" className="input" />
          {err("whatsapp_numero")}
          <p className="hint">Com DDI 55 e DDD, só números. O mesmo número que ativou o CallMeBot.</p>
        </div>
        <div>
          <label className="label" htmlFor="callmebot_api_key">Chave do CallMeBot (apikey)</label>
          <input id="callmebot_api_key" name="callmebot_api_key" type="password" autoComplete="off" placeholder={n.tem_callmebot ? "•••••••• (já salva)" : "Ex.: 1234567"} className="input" />
          <p className="hint">Deixe em branco para manter a chave salva.</p>
        </div>
        <p className="hint sm:col-span-2">
          Por segurança, a mensagem do WhatsApp leva só nome, telefone e código do cliente (sem renda), porque passa por um serviço de terceiros.
        </p>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-primary" disabled={pending}>
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar avisos
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={testando}
          onClick={() => startTeste(async () => setTeste(await testarNotificacoes()))}
        >
          {testando ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Enviar aviso de teste
        </button>
      </div>
      <Feedback erro={state.erro} mensagem={state.ok ? state.mensagem : undefined} />
      {teste && (
        <p className="rounded-xl bg-mist px-4 py-3 text-sm">
          <strong>E-mail:</strong> {resultado(teste.email)}
          <br />
          <strong>WhatsApp:</strong> {resultado(teste.whatsapp)}
        </p>
      )}
    </form>
  );
}
