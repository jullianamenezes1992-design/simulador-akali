const $ = (id) => document.getElementById(id);
const hora = (iso) => (iso ? new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

async function mostrar() {
  const { estado = {}, historico = [], chave = "" } = await chrome.storage.local.get(["estado", "historico", "chave"]);
  const abas = await chrome.tabs.query({ url: "https://apartamentonaplantasp.com.br/crm/*" });
  const st = $("st");
  if (!chave) {
    st.className = "st erro";
    st.textContent = "Falta a chave da integração. Abra “Chave da integração” aqui embaixo e cole a chave.";
    $("cfg").open = true;
  } else if (!abas.length) {
    st.className = "st erro";
    st.textContent = "O CRM da equipe não está aberto. Abra ele numa aba (pode deixar fixada) para a sincronização rodar.";
  } else if (estado.erro && (!estado.quando || estado.erroEm > estado.quando)) {
    st.className = "st erro";
    st.innerHTML = "⚠️ " + esc(estado.erro) + "<br><span class='mini'>" + hora(estado.erroEm) + "</span>";
  } else if (estado.quando) {
    st.className = "st ok";
    st.innerHTML = "✅ Sincronizado às " + hora(estado.quando) + "<br><span class='mini'>" + (estado.lidos ?? 0) + " leads seus no CRM da equipe</span>" +
      ((estado.errosLeads || []).length ? "<br><span class='mini'>Não entraram: " + estado.errosLeads.map((e) => esc(e.erro)).join(", ") + "</span>" : "");
  } else {
    st.className = "st";
    st.textContent = "Esperando a primeira sincronização…";
  }
  $("hist").innerHTML = historico.length
    ? "<p class='mini' style='margin:12px 0 0'><b>Últimas novidades</b></p><ul>" + historico.slice(0, 6).map((h) => "<li>" + hora(h.quando) + " · " + esc(h.texto) + "</li>").join("") + "</ul>"
    : "";
  chrome.runtime.sendMessage({ tipo: "visto" });
}

$("agora").onclick = async () => {
  $("agora").textContent = "Sincronizando…";
  const r = await chrome.runtime.sendMessage({ tipo: "agora" });
  $("agora").textContent = "Sincronizar agora";
  if (!r || !r.ok) {
    $("st").className = "st erro";
    $("st").textContent = "Não achei a aba do CRM da equipe pronta. Abra (ou atualize) a página do CRM da equipe e tente de novo.";
    return;
  }
  mostrar();
};
$("abrir").onclick = () => chrome.tabs.create({ url: "https://apartamentonaplantasp.com.br/crm/#/leads", pinned: true });
$("salvar").onclick = async () => {
  const v = $("chave").value.trim();
  if (!v) { $("msg").textContent = "Cole a chave primeiro."; return; }
  await chrome.storage.local.set({ chave: v });
  $("chave").value = "";
  $("msg").textContent = "Chave salva. Sincronizando…";
  await chrome.runtime.sendMessage({ tipo: "agora" });
  $("msg").textContent = "Chave salva.";
  mostrar();
};
chrome.storage.onChanged.addListener(mostrar);
mostrar();
