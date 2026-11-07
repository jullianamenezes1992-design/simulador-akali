"use client";

import { useActionState, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { salvarConfiguracoes, type ActionState } from "@/app/admin/actions";
import type { SiteSettings } from "@/lib/data";
import { Feedback } from "./ui";

export default function SettingsForm({ s }: { s: SiteSettings }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(salvarConfiguracoes, {});
  const [beneficios, setBeneficios] = useState(s.landing_conteudo.beneficios ?? []);
  const c = state.campos ?? {};
  const err = (k: string) => (c[k] ? <p className="field-error">{c[k]}</p> : null);
  const lc = s.landing_conteudo;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="beneficios" value={JSON.stringify(beneficios)} />

      <section className="card grid gap-4 p-4 sm:grid-cols-2">
        <h2 className="font-bold sm:col-span-2">Empresa e atendimento</h2>
        <div>
          <label className="label" htmlFor="empresa_nome">Nome exibido</label>
          <input id="empresa_nome" name="empresa_nome" defaultValue={s.empresa_nome} className="input" />
          {err("empresa_nome")}
        </div>
        <div>
          <label className="label" htmlFor="creci">CRECI</label>
          <input id="creci" name="creci" defaultValue={s.creci ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="whatsapp_numero">WhatsApp de atendimento *</label>
          <input id="whatsapp_numero" name="whatsapp_numero" inputMode="numeric" defaultValue={s.whatsapp_numero ?? ""} placeholder="5511999999999" className="input" />
          {err("whatsapp_numero")}
          <p className="hint">Com DDI 55 e DDD, só números. É para onde os clientes são encaminhados.</p>
        </div>
        <div>
          <label className="label" htmlFor="email_contato">E-mail de contato</label>
          <input id="email_contato" name="email_contato" type="email" defaultValue={s.email_contato ?? ""} className="input" />
          {err("email_contato")}
        </div>
        {(
          [
            ["instagram", "Instagram", "@seuperfil"],
            ["tiktok", "TikTok", "@seuperfil"],
            ["facebook", "Facebook", "facebook.com/suapagina"],
            ["youtube", "YouTube", "@seucanal"],
          ] as const
        ).map(([k, rotulo, ph]) => (
          <div key={k}>
            <label className="label" htmlFor={`rede_${k}`}>{rotulo} (aparece no rodapé do site)</label>
            <input id={`rede_${k}`} name={`rede_${k}`} defaultValue={s.redes_sociais?.[k] ?? ""} placeholder={ph} className="input" />
          </div>
        ))}
        <div className="sm:col-span-2">
          <label className="label" htmlFor="encarregado_dados">Encarregado de dados (LGPD) — nome e contato</label>
          <input id="encarregado_dados" name="encarregado_dados" defaultValue={s.encarregado_dados ?? ""} className="input" />
        </div>
      </section>

      <section className="card grid gap-4 p-4 sm:grid-cols-2">
        <h2 className="font-bold sm:col-span-2">Rastreamento</h2>
        <div>
          <label className="label" htmlFor="ga4_id">Google Analytics 4 (ID de medição)</label>
          <input id="ga4_id" name="ga4_id" defaultValue={s.ga4_id ?? ""} placeholder="G-XXXXXXXXXX" className="input" />
          {err("ga4_id")}
        </div>
        <div>
          <label className="label" htmlFor="meta_pixel_id">Meta Pixel (ID)</label>
          <input id="meta_pixel_id" name="meta_pixel_id" inputMode="numeric" defaultValue={s.meta_pixel_id ?? ""} className="input" />
          {err("meta_pixel_id")}
        </div>
        <div>
          <label className="label" htmlFor="google_ads_id">Google Ads (ID da conta)</label>
          <input id="google_ads_id" name="google_ads_id" defaultValue={s.google_ads_id ?? ""} placeholder="AW-XXXXXXXXX" className="input" />
          {err("google_ads_id")}
        </div>
        <div>
          <label className="label" htmlFor="google_ads_label_simulacao">Rótulo de conversão — simulação concluída</label>
          <input id="google_ads_label_simulacao" name="google_ads_label_simulacao" defaultValue={s.google_ads_label_simulacao ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="google_ads_label_whatsapp">Rótulo de conversão — clique no WhatsApp</label>
          <input id="google_ads_label_whatsapp" name="google_ads_label_whatsapp" defaultValue={s.google_ads_label_whatsapp ?? ""} className="input" />
        </div>
        <p className="hint sm:col-span-2">
          Eventos enviados: simulation_start, simulation_step, simulation_complete (Lead), view_development (ViewContent),
          whatsapp_click (Contact). Os scripts só carregam após o consentimento de cookies.
        </p>
      </section>

      <section className="card grid gap-4 p-4">
        <h2 className="font-bold">Conteúdo da página inicial</h2>
        <div>
          <label className="label" htmlFor="hero_titulo">Título principal</label>
          <input id="hero_titulo" name="hero_titulo" defaultValue={lc.hero_titulo ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="hero_subtitulo">Subtítulo</label>
          <textarea id="hero_subtitulo" name="hero_subtitulo" rows={2} defaultValue={lc.hero_subtitulo ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="programa_texto">Explicação do programa</label>
          <textarea id="programa_texto" name="programa_texto" rows={4} defaultValue={lc.programa_texto ?? ""} className="input" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <span className="label">Benefícios do programa</span>
            <button type="button" className="text-sm font-semibold text-caixa" onClick={() => setBeneficios([...beneficios, { titulo: "", texto: "" }])}>
              <Plus size={14} className="inline" /> Adicionar
            </button>
          </div>
          <div className="space-y-2">
            {beneficios.map((b, i) => (
              <div key={i} className="grid gap-2 rounded-xl bg-mist p-2 sm:grid-cols-[200px_1fr_auto]">
                <input
                  value={b.titulo}
                  onChange={(e) => setBeneficios(beneficios.map((x, j) => (j === i ? { ...x, titulo: e.target.value } : x)))}
                  placeholder="Título"
                  className="input"
                />
                <input
                  value={b.texto}
                  onChange={(e) => setBeneficios(beneficios.map((x, j) => (j === i ? { ...x, texto: e.target.value } : x)))}
                  placeholder="Descrição"
                  className="input"
                />
                <button type="button" aria-label="Remover" onClick={() => setBeneficios(beneficios.filter((_, j) => j !== i))} className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <p className="hint">As faixas de renda exibidas na página vêm automaticamente da versão ativa dos parâmetros.</p>
        </div>
        <div>
          <label className="label" htmlFor="aviso_rodape">Aviso de independência (rodapé)</label>
          <textarea id="aviso_rodape" name="aviso_rodape" rows={2} defaultValue={lc.aviso_rodape ?? ""} className="input" />
        </div>
      </section>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <button className="btn-primary" disabled={pending}>
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar configurações
        </button>
        <div className="flex-1">
          <Feedback erro={state.erro} mensagem={state.ok ? state.mensagem : undefined} />
        </div>
      </div>
    </form>
  );
}
