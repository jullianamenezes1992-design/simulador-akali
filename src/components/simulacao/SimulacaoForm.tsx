"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Lock, RotateCcw, Save } from "lucide-react";
import {
  ESTADOS_CIVIS,
  PRAZOS_COMPRA,
  PREFERENCIAS_OBRA,
  REGIOES,
  RELACOES_COMPOSICAO,
  RESULT_KEY,
  TIPOS_RENDA,
} from "@/lib/constants";
import { brDateToISO, maskCPF, maskDate, maskMoney, maskPhone, onlyDigits, parseMoney } from "@/lib/format";
import { getUtms, trackEvent } from "@/lib/tracking";
import { ETAPAS, errosPorCampo } from "@/lib/validation/simulacao";
import { RadioGroup, SelectInput, TextInput, YesNo } from "./fields";

const DRAFT_KEY = "akali_sim_rascunho";


interface FormState {
  nome: string;
  cpf: string;
  data_nascimento: string;
  email: string;
  telefone: string;
  estado_civil: string;
  profissao: string;
  tipo_renda: string;
  renda_principal: string;
  dependentes: string;
  compor_renda: boolean | null;
  relacao_composicao: string;
  renda_composicao: string;
  idade_composicao: string;
  tem_fgts: boolean | null;
  fgts_saldo: string;
  fgts_tres_anos: boolean | null;
  possui_imovel: boolean | null;
  financiamento_ativo: boolean | null;
  ja_beneficiado: boolean | null;
  restricao_credito: string;
  regioes: string[];
  dormitorios_min: string;
  precisa_vaga: boolean | null;
  preferencia_obra: string;
  entrada_disponivel: string;
  prazo_compra: string;
  consentimento: boolean;
  aceita_marketing: boolean;
}

const INICIAL: FormState = {
  nome: "",
  cpf: "",
  data_nascimento: "",
  email: "",
  telefone: "",
  estado_civil: "",
  profissao: "",
  tipo_renda: "",
  renda_principal: "",
  dependentes: "0",
  compor_renda: null,
  relacao_composicao: "",
  renda_composicao: "",
  idade_composicao: "",
  tem_fgts: null,
  fgts_saldo: "",
  fgts_tres_anos: null,
  possui_imovel: null,
  financiamento_ativo: null,
  ja_beneficiado: null,
  restricao_credito: "",
  regioes: [],
  dormitorios_min: "",
  precisa_vaga: null,
  preferencia_obra: "indiferente",
  entrada_disponivel: "",
  prazo_compra: "",
  consentimento: false,
  aceita_marketing: false,
};

/** Converte o estado do formulário (com máscaras) no payload normalizado validado pelo servidor. */
function toPayload(f: FormState) {
  const num = (s: string) => (s.trim() === "" ? null : Number(s));
  return {
    nome: f.nome.trim().replace(/\s+/g, " "),
    cpf: onlyDigits(f.cpf),
    data_nascimento: brDateToISO(f.data_nascimento) ?? f.data_nascimento,
    email: f.email.trim().toLowerCase(),
    telefone: onlyDigits(f.telefone),
    estado_civil: f.estado_civil || undefined,
    profissao: f.profissao.trim(),
    tipo_renda: f.tipo_renda || undefined,
    renda_principal: parseMoney(f.renda_principal),
    dependentes: num(f.dependentes) ?? NaN,
    compor_renda: f.compor_renda,
    relacao_composicao: f.compor_renda ? f.relacao_composicao || null : null,
    renda_composicao: f.compor_renda ? parseMoney(f.renda_composicao) : 0,
    idade_composicao: f.compor_renda ? num(f.idade_composicao) : null,
    fgts_saldo: f.tem_fgts ? parseMoney(f.fgts_saldo) : 0,
    fgts_tres_anos: f.tem_fgts ? f.fgts_tres_anos : false,
    possui_imovel: f.possui_imovel,
    financiamento_ativo: f.financiamento_ativo,
    ja_beneficiado: f.ja_beneficiado,
    restricao_credito: f.restricao_credito || undefined,
    regioes: f.regioes,
    dormitorios_min: num(f.dormitorios_min),
    precisa_vaga: f.precisa_vaga,
    preferencia_obra: f.preferencia_obra,
    entrada_disponivel: parseMoney(f.entrada_disponivel),
    prazo_compra: f.prazo_compra || undefined,
    consentimento: f.consentimento,
    aceita_marketing: f.aceita_marketing,
  };
}

export default function SimulacaoForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INICIAL);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [restaurado, setRestaurado] = useState(false);
  const [salvoEm, setSalvoEm] = useState<Date | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const iniciado = useRef(false);
  const carregado = useRef(false);
  const topoRef = useRef<HTMLDivElement>(null);

  // Restaura rascunho (sem CPF — o CPF nunca é salvo no navegador)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as { form: Partial<FormState>; step: number };
        // eslint-disable-next-line react-hooks/set-state-in-effect -- rascunho só existe no navegador
        setForm({ ...INICIAL, ...d.form, cpf: "", consentimento: false });
        setStep(Math.min(Math.max(0, d.step ?? 0), ETAPAS.length - 1));
        setRestaurado(true);
        iniciado.current = true;
      }
    } catch {}
    carregado.current = true;
  }, []);

  // Salvamento automático (debounce)
  useEffect(() => {
    if (!carregado.current) return;
    const t = setTimeout(() => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { cpf, consentimento, ...semSensiveis } = form;
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ form: semSensiveis, step, savedAt: Date.now() }));
        setSalvoEm(new Date());
      } catch {}
    }, 500);
    return () => clearTimeout(t);
  }, [form, step]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    if (!iniciado.current) {
      iniciado.current = true;
      trackEvent("simulation_start");
    }
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => {
      if (!e[k as string]) return e;
      const n = { ...e };
      delete n[k as string];
      return n;
    });
  };

  const payload = useMemo(() => toPayload(form), [form]);

  const validarEtapa = (i: number) => {
    const r = ETAPAS[i].schema.safeParse(payload);
    if (r.success) {
      setErrors({});
      return true;
    }
    setErrors(errosPorCampo(r.error));
    return false;
  };

  const rolarTopo = () => topoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const avancar = () => {
    if (!validarEtapa(step)) return;
    trackEvent("simulation_step", { etapa: step + 1 });
    setStep((s) => s + 1);
    rolarTopo();
  };

  const voltar = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
    rolarTopo();
  };

  const recomecar = () => {
    localStorage.removeItem(DRAFT_KEY);
    setForm(INICIAL);
    setStep(0);
    setErrors({});
    setRestaurado(false);
  };

  const enviar = async () => {
    // valida todas as etapas antes de enviar
    for (let i = 0; i < ETAPAS.length; i++) {
      const r = ETAPAS[i].schema.safeParse(payload);
      if (!r.success) {
        setStep(i);
        setErrors(errosPorCampo(r.error));
        rolarTopo();
        return;
      }
    }
    setEnviando(true);
    setErroGeral(null);
    try {
      const res = await fetch("/api/simulacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, rastreamento: getUtms() ?? undefined, website: honeypot }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json.campos) {
          setErrors(json.campos);
          const idx = ETAPAS.findIndex((e) => Object.keys(json.campos).some((k) => k in e.schema.shape));
          if (idx >= 0) setStep(idx);
        }
        setErroGeral(json.erro ?? "Não foi possível concluir a simulação. Tente novamente.");
        setEnviando(false);
        return;
      }
      localStorage.removeItem(DRAFT_KEY);
      localStorage.setItem(RESULT_KEY, JSON.stringify({ token: json.token, codigo: json.codigo }));
      trackEvent("simulation_complete", { faixa: json.faixa ?? undefined });
      router.push(`/resultado/${json.token}`);
    } catch {
      setErroGeral("Falha de conexão. Verifique sua internet e tente novamente.");
      setEnviando(false);
    }
  };

  const e = errors;
  const progresso = Math.round(((step + 1) / ETAPAS.length) * 100);

  return (
    <div ref={topoRef} className="scroll-mt-20">
      {/* Progresso */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-ink-soft">
          <span>
            Etapa {step + 1} de {ETAPAS.length}
          </span>
          <span className="flex items-center gap-1">
            {salvoEm && (
              <>
                <Save size={12} /> Rascunho salvo
              </>
            )}
          </span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-mist"
          role="progressbar"
          aria-valuenow={progresso}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso da simulação"
        >
          <div className="h-full rounded-full bg-caixa transition-all duration-300" style={{ width: `${progresso}%` }} />
        </div>
        <ol className="mt-3 hidden grid-cols-6 gap-2 sm:grid">
          {ETAPAS.map((et, i) => (
            <li
              key={et.id}
              className={`text-[11px] font-semibold leading-tight ${i === step ? "text-caixa" : i < step ? "text-ink" : "text-ink-soft/60"}`}
            >
              {i < step ? <CheckCircle2 size={12} className="mb-0.5 inline text-caixa" /> : null} {et.titulo}
            </li>
          ))}
        </ol>
      </div>

      {restaurado && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-caixa-50 px-4 py-3 text-sm text-caixa-dark">
          <span>Continuamos de onde você parou. Por segurança, o CPF precisa ser digitado novamente.</span>
          <button type="button" onClick={recomecar} className="flex items-center gap-1 font-semibold underline">
            <RotateCcw size={14} /> Recomeçar
          </button>
        </div>
      )}

      <form
        noValidate
        onSubmit={(ev) => {
          ev.preventDefault();
          if (step < ETAPAS.length - 1) avancar();
          else enviar();
        }}
        className="card p-5 sm:p-7"
      >
        <h2 className="text-xl font-extrabold">{ETAPAS[step].titulo}</h2>

        {/* honeypot anti-robô (oculto para pessoas) */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(ev) => setHoneypot(ev.target.value)} />
          </label>
        </div>

        <div className="mt-5 grid gap-4">
          {step === 0 && (
            <>
              <TextInput label="Nome completo" autoComplete="name" value={form.nome} onChange={(ev) => set("nome", ev.target.value)} error={e.nome} />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="CPF"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={(ev) => set("cpf", maskCPF(ev.target.value))}
                  error={e.cpf}
                  hint="Protegido por criptografia. Não aparece no WhatsApp."
                />
                <TextInput
                  label="Data de nascimento"
                  inputMode="numeric"
                  placeholder="dd/mm/aaaa"
                  value={form.data_nascimento}
                  onChange={(ev) => set("data_nascimento", maskDate(ev.target.value))}
                  error={e.data_nascimento}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="WhatsApp (com DDD)"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder="(11) 90000-0000"
                  value={form.telefone}
                  onChange={(ev) => set("telefone", maskPhone(ev.target.value))}
                  error={e.telefone}
                />
                <TextInput
                  label="E-mail (opcional)"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(ev) => set("email", ev.target.value)}
                  error={e.email}
                />
              </div>
              <SelectInput
                label="Estado civil"
                options={ESTADOS_CIVIS}
                value={form.estado_civil}
                onChange={(ev) => set("estado_civil", ev.target.value)}
                error={e.estado_civil}
              />
            </>
          )}

          {step === 1 && (
            <>
              <TextInput label="Profissão" value={form.profissao} onChange={(ev) => set("profissao", ev.target.value)} error={e.profissao} />
              <SelectInput
                label="Como você recebe a sua renda?"
                options={TIPOS_RENDA}
                value={form.tipo_renda}
                onChange={(ev) => set("tipo_renda", ev.target.value)}
                error={e.tipo_renda}
              />
              <TextInput
                label="Sua renda bruta mensal"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={form.renda_principal}
                onChange={(ev) => set("renda_principal", maskMoney(ev.target.value))}
                error={e.renda_principal}
                hint="Valor antes dos descontos. Se a renda varia, use a média dos últimos meses."
              />
            </>
          )}

          {step === 2 && (
            <>
              <TextInput
                label="Quantos dependentes moram com você?"
                inputMode="numeric"
                value={form.dependentes}
                onChange={(ev) => set("dependentes", onlyDigits(ev.target.value).slice(0, 2))}
                error={e.dependentes}
              />
              <YesNo
                label="Vai somar a renda de outra pessoa?"
                name="compor_renda"
                value={form.compor_renda}
                onChange={(v) => set("compor_renda", v)}
                error={e.compor_renda}
                hint="Cônjuge ou familiar que também vai participar do financiamento."
              />
              {form.compor_renda && (
                <div className="grid gap-4 rounded-xl bg-mist p-4">
                  <SelectInput
                    label="Quem vai compor a renda?"
                    options={RELACOES_COMPOSICAO}
                    value={form.relacao_composicao}
                    onChange={(ev) => set("relacao_composicao", ev.target.value)}
                    error={e.relacao_composicao}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput
                      label="Renda bruta mensal dessa pessoa"
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      value={form.renda_composicao}
                      onChange={(ev) => set("renda_composicao", maskMoney(ev.target.value))}
                      error={e.renda_composicao}
                    />
                    <TextInput
                      label="Idade dessa pessoa"
                      inputMode="numeric"
                      value={form.idade_composicao}
                      onChange={(ev) => set("idade_composicao", onlyDigits(ev.target.value).slice(0, 3))}
                      error={e.idade_composicao}
                      hint="A idade do mais velho influencia o prazo."
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <YesNo label="Você tem saldo de FGTS?" name="tem_fgts" value={form.tem_fgts} onChange={(v) => set("tem_fgts", v)} />
              {form.tem_fgts && (
                <div className="grid gap-4 rounded-xl bg-mist p-4">
                  <TextInput
                    label="Saldo aproximado do FGTS"
                    inputMode="numeric"
                    placeholder="R$ 0,00"
                    value={form.fgts_saldo}
                    onChange={(ev) => set("fgts_saldo", maskMoney(ev.target.value))}
                    error={e.fgts_saldo}
                  />
                  <YesNo
                    label="Soma 3 anos ou mais de trabalho com carteira assinada (FGTS)?"
                    name="fgts_tres_anos"
                    value={form.fgts_tres_anos}
                    onChange={(v) => set("fgts_tres_anos", v)}
                    error={e.fgts_tres_anos}
                    hint="Pode somar períodos em empregos diferentes."
                  />
                </div>
              )}
              <YesNo label="Você ou quem vai comprar com você já possui imóvel residencial?" name="possui_imovel" value={form.possui_imovel} onChange={(v) => set("possui_imovel", v)} error={e.possui_imovel} />
              <YesNo label="Tem algum financiamento habitacional ativo?" name="financiamento_ativo" value={form.financiamento_ativo} onChange={(v) => set("financiamento_ativo", v)} error={e.financiamento_ativo} />
              <YesNo label="Já recebeu algum benefício habitacional do governo?" name="ja_beneficiado" value={form.ja_beneficiado} onChange={(v) => set("ja_beneficiado", v)} error={e.ja_beneficiado} />
              <RadioGroup
                label="Possui restrição no nome (SPC/Serasa)?"
                name="restricao_credito"
                cols={3}
                value={(form.restricao_credito || null) as "nao" | "sim" | "nao_sei" | null}
                onChange={(v) => set("restricao_credito", v)}
                options={[
                  { value: "nao", label: "Não" },
                  { value: "sim", label: "Sim" },
                  { value: "nao_sei", label: "Não sei" },
                ]}
                error={e.restricao_credito}
              />
            </>
          )}

          {step === 4 && (
            <>
              <fieldset>
                <legend className="label">Regiões de interesse</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {REGIOES.map((r) => (
                    <label key={r.value} className="option">
                      <input
                        type="checkbox"
                        className="accent-caixa"
                        checked={form.regioes.includes(r.value)}
                        onChange={(ev) =>
                          set("regioes", ev.target.checked ? [...form.regioes, r.value] : form.regioes.filter((x) => x !== r.value))
                        }
                      />
                      {r.label}
                    </label>
                  ))}
                </div>
                <p className="hint">Deixe em branco se não tiver preferência.</p>
              </fieldset>
              <RadioGroup
                label="Quantos dormitórios, no mínimo?"
                name="dormitorios_min"
                cols={3}
                value={form.dormitorios_min || null}
                onChange={(v) => set("dormitorios_min", v)}
                options={[
                  { value: "1", label: "1 ou mais" },
                  { value: "2", label: "2 ou mais" },
                  { value: "3", label: "3 ou mais" },
                ]}
                error={e.dormitorios_min}
              />
              <YesNo label="Precisa de vaga de garagem?" name="precisa_vaga" value={form.precisa_vaga} onChange={(v) => set("precisa_vaga", v)} error={e.precisa_vaga} />
              <RadioGroup
                label="Prefere imóvel"
                name="preferencia_obra"
                cols={3}
                value={form.preferencia_obra as "indiferente"}
                onChange={(v) => set("preferencia_obra", v)}
                options={PREFERENCIAS_OBRA}
              />
            </>
          )}

          {step === 5 && (
            <>
              <TextInput
                label="Quanto você tem disponível para entrada (além do FGTS)?"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={form.entrada_disponivel}
                onChange={(ev) => set("entrada_disponivel", maskMoney(ev.target.value))}
                error={e.entrada_disponivel}
                hint="Pode ser R$ 0,00. Muitas construtoras parcelam a entrada."
              />
              <SelectInput
                label="Quando pretende comprar?"
                options={PRAZOS_COMPRA}
                value={form.prazo_compra}
                onChange={(ev) => set("prazo_compra", ev.target.value)}
                error={e.prazo_compra}
              />
              <div className="space-y-3 rounded-xl border border-line p-4">
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-5 w-5 shrink-0 accent-caixa"
                    checked={form.consentimento}
                    onChange={(ev) => set("consentimento", ev.target.checked)}
                  />
                  <span>
                    Li e concordo com a{" "}
                    <Link href="/privacidade" target="_blank" className="font-semibold text-caixa underline">
                      Política de Privacidade
                    </Link>{" "}
                    e autorizo o uso dos meus dados para realizar a pré-simulação e receber atendimento sobre imóveis.
                  </span>
                </label>
                {e.consentimento && <p className="field-error">{e.consentimento}</p>}
                <label className="flex items-start gap-3 text-sm text-ink-soft">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-5 w-5 shrink-0 accent-caixa"
                    checked={form.aceita_marketing}
                    onChange={(ev) => set("aceita_marketing", ev.target.checked)}
                  />
                  <span>Quero receber novidades e ofertas de imóveis (opcional).</span>
                </label>
              </div>
            </>
          )}
        </div>

        {erroGeral && (
          <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
            {erroGeral}
          </p>
        )}

        <div className="mt-7 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button type="button" onClick={voltar} className="btn-secondary">
              <ArrowLeft size={16} /> Voltar
            </button>
          ) : (
            <span />
          )}
          {step < ETAPAS.length - 1 ? (
            <button type="submit" className="btn-primary">
              Continuar <ArrowRight size={16} />
            </button>
          ) : (
            <button type="submit" disabled={enviando} className="btn-sol">
              {enviando ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              Ver minha simulação
            </button>
          )}
        </div>
      </form>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-ink-soft">
        <Lock size={12} /> Conexão segura. Usamos seus dados apenas para a simulação e o atendimento.
      </p>
    </div>
  );
}
