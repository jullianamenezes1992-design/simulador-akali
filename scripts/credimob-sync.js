// Roda na aba do CRM da equipe (Credimob), com o login da corretora. Não tem chave nem senha aqui.
// Define window.__credimobLer() e window.__credimobAplicar(itens).
(() => {
  const Q = "\x3f", E = "\x3d", A = "\x26";
  const chaveLS = Object.keys(localStorage).find((k) => /^sb-.*-auth-token$/.test(k));
  const sessao = () => JSON.parse(localStorage.getItem(chaveLS));
  const cfg = {};
  const q = async (path, opt = {}) => {
    if (!cfg.url) {
      const c = await (await fetch([...document.scripts].find((s) => /config\.js/.test(s.src)).src)).text();
      cfg.url = (c.match(/https:\/\/[a-z0-9]+\.supabase\.co/) || [])[0];
      cfg.key = (c.match(/sb_publishable_[\w-]+/) || c.match(/eyJ[\w.-]+/) || [])[0];
    }
    const r = await fetch(cfg.url + "/rest/v1/" + path, {
      ...opt,
      headers: { apikey: cfg.key, Authorization: "Bearer " + sessao().access_token, "Content-Type": "application/json", Prefer: "return=minimal", ...(opt.headers || {}) },
    });
    const t = await r.text();
    if (!r.ok) throw new Error("HTTP " + r.status + " " + t.slice(0, 120));
    return t ? JSON.parse(t) : null;
  };
  // etapa do Credimob -> etapa do CRM da corretora (só na primeira vez que o lead entra)
  const DE = { 1: "novo", 2: "sem_resposta", 3: "sem_resposta", 4: "em_atendimento", 5: "documentacao", 6: "documentacao", 7: "visita", 8: "visita", 9: "proposta", 10: "vendido", 11: "vendido", 12: "serasa_bacen", 13: "reprovado", 14: "reprovado", 15: "perdido", 16: "perdido", 17: "arquivado" };
  // etapa do CRM da corretora -> etapa do Credimob
  const PARA = { novo: 1, simulacao: 4, em_atendimento: 4, sem_resposta: 3, documentacao: 6, analise_credito: 6, serasa_bacen: 12, aprovado: 9, reprovado: 14, visita: 7, proposta: 9, vendido: 11, perdido: 15, arquivado: 17 };
  const MOTIVO = { reprovado: "Outro motivo · Reprovado na análise de crédito", perdido: "Não tem mais interesse", arquivado: "Outro motivo · Arquivado no CRM da corretora" };

  window.__credimobLer = async () => {
    const uid = sessao().user.id;
    const [leads, prods] = await Promise.all([
      q("leads" + Q + "select" + E + "id,nome,telefone,email,renda,produto_id,etapa_id,origem,utm_campaign,criado_em" + A + "responsavel_id" + E + "eq." + uid + A + "limit" + E + "2000"),
      q("produtos" + Q + "select" + E + "id,nome,bairro,regiao"),
    ]);
    const pp = Object.fromEntries(prods.map((p) => [p.id, p]));
    return leads.map((l) => {
      const p = pp[l.produto_id];
      return {
        id: l.id, nome: l.nome || "(sem nome)", telefone: l.telefone, email: l.email, renda: l.renda,
        campanha: l.utm_campaign, origem: l.origem, criado_em: l.criado_em, status: DE[l.etapa_id] || "novo",
        produto: p ? [p.nome, p.bairro].filter(Boolean).join(" · ") : null, regiao: p ? p.regiao : null,
      };
    });
  };

  window.__credimobAplicar = async (itens) => {
    const uid = sessao().user.id;
    const confirmados = [], erros = {};
    for (const it of itens) {
      try {
        const [lead] = await q("leads" + Q + "select" + E + "id,etapa_id,responsavel_id" + A + "id" + E + "eq." + it.id);
        if (!lead) { erros[it.fila_id] = "lead não encontrado no CRM da equipe"; continue; }
        if (it.evento === "status") {
          const etapa = PARA[it.para];
          if (etapa && etapa !== lead.etapa_id) {
            const upd = { etapa_id: etapa };
            if (MOTIVO[it.para]) upd.motivo_finalizacao = MOTIVO[it.para];
            await q("leads" + Q + "id" + E + "eq." + it.id, { method: "PATCH", body: JSON.stringify(upd) });
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
  return "ok";
})();
