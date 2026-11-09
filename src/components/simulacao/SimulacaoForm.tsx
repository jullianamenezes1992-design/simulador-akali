"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Lock, RotateCcw, Save } from "lucide-react";
import { PRAZOS_COMPRA, REGIOES, RELACOES_COMPOSICAO, RESULT_KEY, TIPOS_RENDA } from "@/lib/constants";
import { brDateToISO, maskDate, maskMoney, maskPhone, onlyDigits, parseMoney } from "@/lib/format";
import { getUtms, trackEvent } from "@/lib/tracking";
import { ETAPAS, errosPorCampo } from "@/lib/validation/simulacao";
import { RadioGroup, SelectInput, TextInput, YesNo } from "./fields";

// Formulário em 3 etapas curtas: contato → renda → imóvel.
// E-mail, estado civil, profissão, dependentes, restrição no nome e preferência de obra
// ficaram para o atendimento da corretora (não mudam o cálculo).

const DRAFT_KEY = "akali_sim_rascunho";
/** token do cadastro parcial salvo no servidor após a 1ª etapa */
const PARCIAL_KEY = "akali_sim_parcial";


interface FormState {
  nome: string;
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
  restricao_credito: string;
  regioes: string[];
  dormitorios_min: string;
  precisa_vaga: boolean | null;
  preferencia_obra: string;
  prazo_compra: string;
  consentimento: boolean;
  aceita_marketing: boolean;
}

const INICIAL: FormState = {
  nome: "",
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
  restricao_credito: "",
  regioes: [],
  dormitorios_min: "",
  precisa_vaga: null,
  preferencia_obra: "indiferente",
  prazo_compra: "",
  consentimento: false,
  aceita_marketing: false,
};

/** Converte o estado do formulário (com máscaras) no payload normalizado validado pelo servidor. */
function toPayload(f: FormState) {
  const num = (s: string) => (s.trim() === "" ? null : Number(s));
  return {
    nome: f.nome.trim().replace(/\s+/g, " "),
    telefone: onlyDigits(f.telefone),
    consentimento: f.consentimento,
    tipo_renda: f.tipo_renda || undefined,
    renda_principal: parseMoney(f.renda_principal),
    data_nascimento: brDateToISO(f.data_nascimento) ?? f.data_nascimento,
    compor_renda: f.compor_renda,
    relacao_composicao: f.compor_renda ? f.relacao_composicao || null : null,
    renda_composicao: f.compor_renda ? parseMoney(f.renda_composicao) : 0,
    idade_composicao: f.compor_renda ? num(f.idade_composicao) : null,
    tem_fgts: f.tem_fgts,
    fgts_saldo: f.tem_fgts ? parseMoney(f.fgts_saldo) : 0,
    fgts_tres_anos: f.tem_fgts ? f.fgts_tres_anos : false,
    regioes: f.regioes,
    dormitorios_min: num(f.dormitorios_min),
    precisa_vaga: f.precisa_vaga,
    prazo_compra: f.prazo_compra || undefined,
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

  // Restaura rascunho salvo no navegador
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      const d = raw ? (JSON.parse(raw) as { form: Partial<FormState>; step: number }) : null;
      // só retoma se a pessoa já tinha começado a preencher
      if (d && (d.form?.nome || d.form?.telefone)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- rascunho só existe no navegador
        setForm({ ...INICIAL, ...d.form });
        setStep(Math.min(Math.max(0, d.step ?? 0), ETAPAS.length - 1));
        setRestaurado(true);
        iniciado.current = true;
      } else {
        // Renda digitada na calculadora da página inicial (?renda=4500)
        const renda = Number(new URLSearchParams(window.location.search).get("renda"));
        if (renda > 0 && renda < 1_000_000) {
          setForm((f) => ({ ...f, renda_principal: maskMoney(String(Math.round(renda * 100))) }));
        }
      }
    } catch {}
    carregado.current = true;
  }, []);

  // Salvamento automático (debounce)
  useEffect(() => {
    if (!carregado.current || !iniciado.current) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, step, savedAt: Date.now() }));
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

  // Salva no servidor o que já foi preenchido (a partir da 1ª etapa), para a corretora retomar o contato
  const filaParcial = useRef<Promise<void>>(Promise.resolve());
  const salvarParcial = (etapaConcluida: number) => {
    const dados = payload;
    // em fila, para a 2ª chamada já usar o token devolvido pela 1ª (evita cadastro duplicado)
    filaParcial.current = filaParcial.current.then(async () => {
      try {
        const token = localStorage.getItem(PARCIAL_KEY);
        const r = await fetch("/api/simulacao/parcial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({ token, etapa: etapaConcluida, dados, rastreamento: getUtms() ?? undefined, website: honeypot }),
        });
        const j = r.ok ? ((await r.json()) as { token?: string }) : null;
        if (j?.token) localStorage.setItem(PARCIAL_KEY, j.token);
      } catch {}
    });
  };

  const avancar = () => {
    if (!validarEtapa(step)) return;
    salvarParcial(step + 1);
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
    localStorage.removeItem(PARCIAL_KEY);
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
    await filaParcial.current;
    try {
      const res = await fetch("/api/simulacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          rastreamento: getUtms() ?? undefined,
          website: honeypot,
          parcial_token: (() => {
            try {
              return localStorage.getItem(PARCIAL_KEY);
            } catch {
              return null;
            }
          })(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json.campos) {
          setErrors(json.campos);
          const idx = ETAPAS.findIndex((e) => Object.keys(json.campos).some((k) => (e.campos as readonly string[]).includes(k)));
          if (idx >= 0) setStep(idx);
        }
        setErroGeral(json.erro ?? "Não foi possível concluir a simulação. Tente novamente.");
        setEnviando(false);
        return;
      }
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem(PARCIAL_KEY);
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
        <ol className="mt-3 grid grid-cols-3 gap-2">
          {ETAPAS.map((et, i) => (
            <li
              key={et.id}
              className={`text-[11px] font-semibold leading-tight ${i === step ? "text-caixa" : i < step ? "text-ink" : "text-ink-soft/60"}`}
            >
              {i < step ? <CheckCircle2 size={12} className="mb-0.5 inline text-caixa" /> : null} {et.curto}
            </li>
          ))}
        </ol>
      </div>

      {restaurado && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-caixa-50 px-4 py-3 text-sm text-caixa-dark">
          <span>Continuamos de onde você parou.</span>
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
              <p className="-mt-2 text-sm text-ink-soft">Leva menos de 2 minutos. Grátis e sem CPF.</p>
              <TextInput label="Seu nome" autoComplete="name" value={form.nome} onChange={(ev) => set("nome", ev.target.value)} error={e.nome} />
              <TextInput
                label="Seu WhatsApp (com DDD)"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="(11) 90000-0000"
                value={form.telefone}
                onChange={(ev) => set("telefone", maskPhone(ev.target.value))}
                error={e.telefone}
              />
              <div>
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
                    e autorizo o contato pelo WhatsApp para a simulação e o atendimento sobre imóveis.
                  </span>
                </label>
                {e.consentimento && <p className="field-error">{e.consentimento}</p>}
              </div>
            </>
          )}

          {step === 1 && (
            <>
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
              <TextInput
                label="Sua data de nascimento"
                inputMode="numeric"
                placeholder="dd/mm/aaaa"
                value={form.data_nascimento}
                onChange={(ev) => set("data_nascimento", maskDate(ev.target.value))}
                error={e.data_nascimento}
                hint="A idade influencia o prazo do financiamento."
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
                    />
                  </div>
                </div>
              )}
              <YesNo label="Você tem saldo de FGTS?" name="tem_fgts" value={form.tem_fgts} onChange={(v) => set("tem_fgts", v)} error={e.tem_fgts} />
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
                    label="Soma 3 anos ou mais de carteira assinada?"
                    name="fgts_tres_anos"
                    value={form.fgts_tres_anos}
                    onChange={(v) => set("fgts_tres_anos", v)}
                    error={e.fgts_tres_anos}
                    hint="Pode somar períodos em empregos diferentes."
                  />
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <fieldset>
                <legend className="label">Onde você quer morar?</legend>
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
              <SelectInput
                label="Quando pretende comprar?"
                options={PRAZOS_COMPRA}
                value={form.prazo_compra}
                onChange={(ev) => set("prazo_compra", ev.target.value)}
                error={e.prazo_compra}
              />
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
              Ver meu resultado
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
