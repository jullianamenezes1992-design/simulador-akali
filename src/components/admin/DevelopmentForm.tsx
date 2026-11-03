"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { salvarEmpreendimento, type ActionState } from "@/app/admin/actions";
import { REGIOES, STATUS_OBRA } from "@/lib/constants";
import { maskMoney } from "@/lib/format";
import type { Development } from "@/lib/data";
import { Feedback } from "./ui";

const moneyDefault = (v: number | null | undefined) => (v == null ? "" : maskMoney(String(Math.round(v * 100))));

export default function DevelopmentForm({ dev }: { dev?: Development }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(salvarEmpreendimento, {});
  const c = state.campos ?? {};
  const err = (k: string) => (c[k] ? <p className="field-error">{c[k]}</p> : null);
  const onMoney = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = maskMoney(e.currentTarget.value);
  };

  return (
    <form action={action} className="space-y-4">
      {dev && <input type="hidden" name="id" value={dev.id} />}

      <section className="card grid gap-4 p-4 sm:grid-cols-2">
        <h2 className="font-bold sm:col-span-2">Identificação</h2>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="nome">Nome do empreendimento *</label>
          <input id="nome" name="nome" defaultValue={dev?.nome} required className="input" />
          {err("nome")}
        </div>
        <div>
          <label className="label" htmlFor="construtora">Construtora</label>
          <input id="construtora" name="construtora" defaultValue={dev?.construtora ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="status_obra">Estágio *</label>
          <select id="status_obra" name="status_obra" defaultValue={dev?.status_obra ?? "lancamento"} className="input">
            {STATUS_OBRA.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="descricao">Descrição</label>
          <textarea id="descricao" name="descricao" rows={4} defaultValue={dev?.descricao ?? ""} className="input" />
        </div>
      </section>

      <section className="card grid gap-4 p-4 sm:grid-cols-2">
        <h2 className="font-bold sm:col-span-2">Localização</h2>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="endereco">Endereço</label>
          <input id="endereco" name="endereco" defaultValue={dev?.endereco ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="bairro">Bairro</label>
          <input id="bairro" name="bairro" defaultValue={dev?.bairro ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="regiao">Região *</label>
          <select id="regiao" name="regiao" defaultValue={dev?.regiao ?? ""} className="input">
            <option value="">Selecione</option>
            {REGIOES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          {err("regiao")}
        </div>
        <div>
          <label className="label" htmlFor="cidade">Cidade *</label>
          <input id="cidade" name="cidade" defaultValue={dev?.cidade ?? "São Paulo"} className="input" />
          {err("cidade")}
        </div>
        <div>
          <label className="label" htmlFor="uf">UF *</label>
          <input id="uf" name="uf" maxLength={2} defaultValue={dev?.uf ?? "SP"} className="input uppercase" />
          {err("uf")}
        </div>
        <div>
          <label className="label" htmlFor="latitude">Latitude</label>
          <input id="latitude" name="latitude" inputMode="decimal" defaultValue={dev?.latitude ?? ""} placeholder="-23.5505" className="input" />
          {err("latitude")}
        </div>
        <div>
          <label className="label" htmlFor="longitude">Longitude</label>
          <input id="longitude" name="longitude" inputMode="decimal" defaultValue={dev?.longitude ?? ""} placeholder="-46.6333" className="input" />
          {err("longitude")}
          <p className="hint">Opcional. Sem coordenadas, o mapa usa o endereço.</p>
        </div>
      </section>

      <section className="card grid gap-4 p-4 sm:grid-cols-2">
        <h2 className="font-bold sm:col-span-2">Valores e perfil</h2>
        <div>
          <label className="label" htmlFor="preco_min">Preço a partir de</label>
          <input id="preco_min" name="preco_min" inputMode="numeric" defaultValue={moneyDefault(dev?.preco_min)} onInput={onMoney} className="input" />
          {err("preco_min")}
          <p className="hint">Deixe vazio para exibir &ldquo;Sob consulta&rdquo;.</p>
        </div>
        <div>
          <label className="label" htmlFor="preco_max">Preço até</label>
          <input id="preco_max" name="preco_max" inputMode="numeric" defaultValue={moneyDefault(dev?.preco_max)} onInput={onMoney} className="input" />
          {err("preco_max")}
        </div>
        <fieldset className="sm:col-span-2">
          <legend className="label">Faixas de renda do MCMV atendidas</legend>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((f) => (
              <label key={f} className="option">
                <input type="checkbox" name="faixas" value={f} defaultChecked={dev?.faixas.includes(f)} className="accent-caixa" /> Faixa {f}
              </label>
            ))}
          </div>
          <p className="hint">Usado pelo motor de compatibilidade para cruzar com a renda do cliente.</p>
        </fieldset>
        <div>
          <label className="label" htmlFor="renda_minima">Renda mínima sugerida</label>
          <input id="renda_minima" name="renda_minima" inputMode="numeric" defaultValue={moneyDefault(dev?.renda_minima)} onInput={onMoney} className="input" />
        </div>
      </section>

      <section className="card grid gap-4 p-4 sm:grid-cols-2">
        <h2 className="font-bold sm:col-span-2">Unidades</h2>
        <fieldset className="sm:col-span-2">
          <legend className="label">Dormitórios disponíveis *</legend>
          <div className="flex flex-wrap gap-2">
            {[
              [0, "Studio"],
              [1, "1 dorm."],
              [2, "2 dorm."],
              [3, "3 dorm."],
              [4, "4 dorm."],
            ].map(([v, l]) => (
              <label key={v} className="option">
                <input type="checkbox" name="dormitorios" value={v} defaultChecked={dev ? dev.dormitorios.includes(v as number) : v === 2} className="accent-caixa" /> {l}
              </label>
            ))}
          </div>
          {err("dormitorios")}
        </fieldset>
        <div>
          <label className="label" htmlFor="area_min">Área mínima (m²)</label>
          <input id="area_min" name="area_min" inputMode="decimal" defaultValue={dev?.area_min ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="area_max">Área máxima (m²)</label>
          <input id="area_max" name="area_max" inputMode="decimal" defaultValue={dev?.area_max ?? ""} className="input" />
          {err("area_max")}
        </div>
        <label className="option sm:col-span-2">
          <input type="checkbox" name="vagas" defaultChecked={dev?.vagas} className="accent-caixa" /> Possui vaga de garagem
        </label>
      </section>

      <section className="card grid gap-4 p-4 sm:grid-cols-2">
        <h2 className="font-bold sm:col-span-2">Disponibilidade e comercial</h2>
        <div>
          <label className="label" htmlFor="unidades_disponiveis">Unidades disponíveis</label>
          <input id="unidades_disponiveis" name="unidades_disponiveis" inputMode="numeric" defaultValue={dev?.unidades_disponiveis ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="previsao_entrega">Previsão de entrega</label>
          <input id="previsao_entrega" name="previsao_entrega" defaultValue={dev?.previsao_entrega ?? ""} placeholder="Ex.: Dezembro/2028" className="input" />
        </div>
        <label className="option">
          <input type="checkbox" name="disponivel" defaultChecked={dev ? dev.disponivel : true} className="accent-caixa" /> Com unidades à venda
        </label>
        <label className="option">
          <input type="checkbox" name="ativo" defaultChecked={dev ? dev.ativo : true} className="accent-caixa" /> Ativo (visível no site)
        </label>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="condicoes_comerciais">Condições comerciais</label>
          <textarea id="condicoes_comerciais" name="condicoes_comerciais" rows={3} defaultValue={dev?.condicoes_comerciais ?? ""} className="input" />
        </div>
        <label className="option">
          <input type="checkbox" name="oferta_destaque" defaultChecked={dev?.oferta_destaque} className="accent-caixa" /> Destacar como lançamento/oferta
        </label>
        <div>
          <label className="label" htmlFor="oferta_texto">Selo da oferta</label>
          <input id="oferta_texto" name="oferta_texto" defaultValue={dev?.oferta_texto ?? ""} placeholder="Ex.: Condições de lançamento" className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="diferenciais">Diferenciais (um por linha)</label>
          <textarea id="diferenciais" name="diferenciais" rows={4} defaultValue={dev?.diferenciais.join("\n") ?? ""} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="video_url">Vídeo (link do YouTube/Vimeo)</label>
          <input id="video_url" name="video_url" type="url" defaultValue={dev?.video_url ?? ""} className="input" />
          {err("video_url")}
        </div>
        <input type="hidden" name="capa_url" value={dev?.capa_url ?? ""} />
      </section>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <button className="btn-primary" disabled={pending}>
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {dev ? "Salvar alterações" : "Cadastrar e adicionar fotos"}
        </button>
        <div className="flex-1">
          <Feedback erro={state.erro} mensagem={state.ok ? state.mensagem : undefined} />
        </div>
      </div>
    </form>
  );
}
