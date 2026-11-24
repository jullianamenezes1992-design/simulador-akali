// Akali · CRM da equipe — fala com o CRM da corretora usando a chave salva na extensão.
const CRM = "https://simulador-akali.vercel.app";
const API = CRM + "/api/equipe/extensao";
const ABA_EQUIPE = "https://apartamentonaplantasp.com.br/crm/*";

const chave = async () => (await chrome.storage.local.get("chave")).chave || "";

async function api(metodo, corpo) {
  const k = await chave();
  if (!k) return { erro: "Cole a chave da integração na extensão (clique no ícone)." };
  try {
    const r = await fetch(API, {
      method: metodo,
      headers: { Authorization: "Bearer " + k, "Content-Type": "application/json" },
      body: corpo ? JSON.stringify(corpo) : undefined,
      cache: "no-store",
    });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401) return { erro: "Seu CRM recusou a chave (" + (j.erro || "chave inválida") + "). Confira em Configurações → CRM da equipe." };
    if (!r.ok) return { erro: "Seu CRM respondeu " + r.status + (j.erro ? ": " + j.erro : "") };
    return j;
  } catch (e) {
    return { erro: "Sem conexão com o seu CRM (" + (e.message || e) + ")" };
  }
}

async function badge(estado) {
  if (estado.erro) {
    await chrome.action.setBadgeBackgroundColor({ color: "#C62828" });
    await chrome.action.setBadgeText({ text: "!" });
    return;
  }
  const { naoVistos = 0 } = await chrome.storage.local.get("naoVistos");
  await chrome.action.setBadgeBackgroundColor({ color: "#2E7D32" });
  await chrome.action.setBadgeText({ text: naoVistos ? String(Math.min(naoVistos, 99)) : "" });
}

async function salvarEstado(m) {
  const agora = new Date().toISOString();
  const { estado: ant = {}, naoVistos = 0, historico = [] } = await chrome.storage.local.get(["estado", "naoVistos", "historico"]);
  const estado = m.erro
    ? { ...ant, erro: m.erro, erroEm: agora }
    : {
        ok: true,
        quando: agora,
        lidos: m.lidos,
        ultimaMudancaEm: m.criados || m.levados ? agora : ant.ultimaMudancaEm || null,
        errosLeads: (m.errosLeads || []).slice(0, 5),
        errosLevar: (m.errosLevar || []).slice(0, 5),
      };
  const novos = m.novos || [];
  const levados = m.levados || 0;
  const hist = [...historico];
  if (novos.length) hist.unshift({ quando: agora, texto: novos.length + " lead(s) novo(s): " + novos.join(", ") });
  if (levados) hist.unshift({ quando: agora, texto: levados + " atualização(ões) levada(s) para o CRM da equipe" });
  await chrome.storage.local.set({ estado, naoVistos: naoVistos + novos.length, historico: hist.slice(0, 15) });
  await badge(estado);
}

async function abasEquipe() {
  return chrome.tabs.query({ url: ABA_EQUIPE });
}

async function cutucar() {
  const abas = await abasEquipe();
  for (const t of abas) {
    try {
      await chrome.tabs.sendMessage(t.id, { tipo: "agora" });
      return true;
    } catch {
      /* aba ainda sem o script (aberta antes de instalar): tenta a próxima */
    }
  }
  return false;
}

chrome.runtime.onMessage.addListener((m, sender, responder) => {
  (async () => {
    switch (m && m.tipo) {
      case "vez": {
        // trava simples para duas abas do Credimob não aplicarem a mesma coisa ao mesmo tempo
        const agora = Date.now();
        const { vez } = await chrome.storage.session.get("vez");
        const aba = sender.tab ? sender.tab.id : 0;
        if (vez && vez.aba !== aba && vez.ate > agora) return { ok: false };
        await chrome.storage.session.set({ vez: { aba, ate: agora + 50000 } });
        return { ok: true, semChave: !(await chave()) };
      }
      case "pendentes":
        return api("GET");
      case "enviar":
        return api("POST", m.corpo);
      case "estado":
        await salvarEstado(m);
        return { ok: true };
      case "agora":
        return { ok: await cutucar() };
      case "visto":
        await chrome.storage.local.set({ naoVistos: 0 });
        await badge((await chrome.storage.local.get("estado")).estado || {});
        return { ok: true };
      default:
        return { erro: "mensagem desconhecida" };
    }
  })().then(responder);
  return true;
});

// a cada 30 s cutuca a aba do Credimob (o Chrome atrasa os timers de abas escondidas)
chrome.runtime.onInstalled.addListener(() => chrome.alarms.create("sync", { periodInMinutes: 0.5 }));
chrome.runtime.onStartup.addListener(() => chrome.alarms.create("sync", { periodInMinutes: 0.5 }));
chrome.alarms.onAlarm.addListener((a) => { if (a.name === "sync") cutucar(); });
