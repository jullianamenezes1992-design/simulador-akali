// Akali · CRM da equipe — roda dentro da aba do Credimob, com o login da corretora.
// Lê os leads dela no CRM da equipe e manda para o CRM dela (pelo background, com a chave salva na extensão).
// Também aplica no CRM da equipe as mudanças de etapa e observações feitas no CRM dela.
(() => {
  if (window.__akaliSync) return;
  window.__akaliSync = true;

  const INTERVALO = 20000; // 20 s com a aba aberta (o Chrome pode espaçar para 1 min em aba escondida)
  const LOTE = 100;

  // etapa do Credimob -> status do CRM da corretora
  const DE = { 1: "novo", 2: "sem_resposta", 3: "sem_resposta", 4: "em_atendimento", 5: "documentacao", 6: "documentacao", 7: "visita", 8: "visita", 9: "proposta", 10: "vendido", 11: "vendido", 12: "serasa_bacen", 13: "reprovado", 14: "reprovado", 15: "perdido", 16: "perdido", 17: "arquivado" };
  // status do CRM da corretora -> etapa do Credimob
  const PARA = { novo: 1, simulacao: 4, em_atendimento: 4, sem_resposta: 3, documentacao: 6, analise_credito: 6, serasa_bacen: 12, aprovado: 9, reprovado: 14, visita: 7, proposta: 9, vendido: 11, perdido: 15, arquivado: 17 };
  const MOTIVO = { reprovado: "Outro motivo · Reprovado na análise de crédito", perdido: "Não tem mais interesse", arquivado: "Outro motivo · Arquivado no CRM da corretora" };

  const bg = (msg) =>
    new Promise((ok) => {
      try {
        chrome.runtime.sendMessage(msg, (r) => ok(r || { erro: chrome.runtime.lastError?.message || "sem resposta da extensão" }));
      } catch (e) {
        ok({ erro: "extensão recarregada: atualize esta página" });
      }
    });

  const sessao = () => {
    const k = Object.keys(localStorage).find((x) => /^sb-.*-auth-token$/.test(x));
    if (!k) return null;
    try {
      const s = JSON.parse(localStorage.getItem(k));
      return s && s.access_token && s.user ? s : null;
    } catch {
      return null;
    }
  };

  let cfg = null;
  const config = async () => {
    if (cfg) return cfg;
    const src = [...document.scripts].find((s) => /config\.js/.test(s.src))?.src;
    if (!src) throw new Error("não achei a configuração do CRM da equipe");
    const c = await (await fetch(src)).text();
    const url = (c.match(/https:\/\/[a-z0-9]+\.supabase\.co/) || [])[0];
    const key = (c.match(/sb_publishable_[\w-]+/) || c.match(/eyJ[\w.-]+/) || [])[0];
    if (!url || !key) throw new Error("configuração do CRM da equipe mudou");
    cfg = { url, key };
    return cfg;
  };

  const q = async (path, opt = {}) => {
    const { url, key } = await config();
    const s = sessao();
    if (!s) throw new Error("sem login no CRM da equipe");
    const r = await fetch(url + "/rest/v1/" + path, {
      ...opt,
      headers: { apikey: key, Authorization: "Bearer " + s.access_token, "Content-Type": "application/json", Prefer: "return=minimal", ...(opt.headers || {}) },
    });
    const t = await r.text();
    if (r.status === 401) throw new Error("login do CRM da equipe expirou: recarregue a página");
    if (!r.ok) throw new Error("CRM da equipe respondeu " + r.status + " " + t.slice(0, 100));
    return t ? JSON.parse(t) : null;
  };

  const ler = async (uid) => {
    const [leads, prods] = await Promise.all([
      q("leads?select=id,nome,telefone,email,renda,produto_id,etapa_id,origem,utm_campaign,criado_em&responsavel_id=eq." + encodeURIComponent(uid) + "&limit=2000"),
      q("produtos?select=id,nome,bairro,regiao"),
    ]);
    const pp = Object.fromEntries((prods || []).map((p) => [p.id, p]));
    return (leads || []).map((l) => {
      const p = pp[l.produto_id];
      return {
        id: l.id, nome: l.nome || "(sem nome)", telefone: l.telefone, email: l.email, renda: l.renda,
        campanha: l.utm_campaign, origem: l.origem, criado_em: l.criado_em, status: DE[l.etapa_id] || "novo",
        produto: p ? [p.nome, p.bairro].filter(Boolean).join(" · ") : null, regiao: p ? p.regiao : null,
      };
    });
  };

  const aplicar = async (itens, uid) => {
    const confirmados = [], erros = {};
    for (const it of itens) {
      try {
        const [lead] = (await q("leads?select=id,etapa_id&id=eq." + encodeURIComponent(it.id))) || [];
        if (!lead) { erros[it.fila_id] = "lead não encontrado no CRM da equipe"; continue; }
        if (it.evento === "status") {
          const etapa = PARA[it.para];
          if (etapa && etapa !== lead.etapa_id) {
            const upd = { etapa_id: etapa };
            if (MOTIVO[it.para]) upd.motivo_finalizacao = MOTIVO[it.para];
            await q("leads?id=eq." + encodeURIComponent(it.id), { method: "PATCH", body: JSON.stringify(upd) });
          }
          if (["aprovado", "analise_credito", "simulacao"].includes(it.para))
            await q("eventos", { method: "POST", body: JSON.stringify({ lead_id: it.id, tipo: "nota", texto: "(CRM da corretora) Etapa: " + it.para_nome, autor_id: uid }) });
        } else if (it.evento === "observacao" && it.texto) {
          await q("eventos", { method: "POST", body: JSON.stringify({ lead_id: it.id, tipo: "nota", texto: "(CRM da corretora) " + it.texto, autor_id: uid }) });
        }
        confirmados.push(it.fila_id);
      } catch (e) {
        erros[it.fila_id] = String(e.message || e).slice(0, 200);
      }
    }
    return { confirmados, erros };
  };

  const assinatura = (l) => JSON.stringify([l.nome, l.telefone, l.email, l.renda, l.status, l.produto, l.campanha]);

  let rodando = false;
  const ciclo = async () => {
    if (rodando) return;
    rodando = true;
    try {
      const s = sessao();
      if (!s) {
        await bg({ tipo: "estado", erro: "Entre no CRM da equipe no Chrome." });
        return;
      }
      const vez = await bg({ tipo: "vez" }); // só uma aba sincroniza por vez
      if (!vez.ok) return;
      if (vez.semChave) {
        await bg({ tipo: "estado", erro: "Cole a chave da integração na extensão (clique no ícone)." });
        return;
      }
      const uid = s.user.id;

      // 1) o que mudou no CRM da corretora e precisa ir para o CRM da equipe
      const pend = await bg({ tipo: "pendentes" });
      if (pend.erro) throw new Error(pend.erro);
      const r = pend.itens && pend.itens.length ? await aplicar(pend.itens, uid) : { confirmados: [], erros: {} };

      // 2) leads novos ou alterados no CRM da equipe
      const leads = await ler(uid);
      const { sigs = {} } = await chrome.storage.local.get("sigs");
      const mudados = leads.filter((l) => sigs[l.id] !== assinatura(l));

      let criados = 0, atualizados = 0;
      const novos = [], errosLeads = [];
      const temRetorno = r.confirmados.length || Object.keys(r.erros).length;
      for (let i = 0; i < Math.max(mudados.length, temRetorno ? 1 : 0); i += LOTE) {
        const lote = mudados.slice(i, i + LOTE);
        const corpo = { leads: lote, ...(i === 0 ? r : {}) };
        const resp = await bg({ tipo: "enviar", corpo });
        if (resp.erro) throw new Error(resp.erro);
        criados += resp.criados || 0;
        atualizados += resp.atualizados || 0;
        novos.push(...(resp.novos || []));
        errosLeads.push(...(resp.erros || []));
        for (const l of lote) sigs[l.id] = assinatura(l);
        await chrome.storage.local.set({ sigs });
      }

      await bg({
        tipo: "estado",
        ok: true,
        lidos: leads.length,
        criados,
        atualizados,
        novos,
        levados: r.confirmados.length,
        errosLevar: Object.values(r.erros),
        errosLeads,
      });
    } catch (e) {
      await bg({ tipo: "estado", erro: String(e.message || e).slice(0, 200) });
    } finally {
      rodando = false;
    }
  };

  chrome.runtime.onMessage.addListener((m, _s, responder) => {
    if (m && m.tipo === "agora") {
      ciclo().finally(() => responder({ ok: true }));
      return true;
    }
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) ciclo(); });
  setInterval(ciclo, INTERVALO);
  setTimeout(ciclo, 1500);
})();
