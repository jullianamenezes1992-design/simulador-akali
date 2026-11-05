"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2, PlusSquare, Share, Smartphone } from "lucide-react";
import { removerInscricaoPush, salvarInscricaoPush, testarPush } from "@/app/admin/actions";

type Estado = "carregando" | "sem-suporte" | "instalar-primeiro" | "bloqueado" | "desligado" | "ligado";

function base64ParaUint8(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const b = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
}

function nomeAparelho() {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android";
  if (/Mac/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows";
  return "Navegador";
}

/** Instalação do app e ativação das notificações neste aparelho. */
export default function AppCelular({ vapidPublic }: { vapidPublic: string | null }) {
  const [estado, setEstado] = useState<Estado>("carregando");
  const [ios, setIos] = useState(false);
  const [instalado, setInstalado] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    const ehIos = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    (async () => {
      let e: Estado;
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        e = ehIos && !standalone ? "instalar-primeiro" : "sem-suporte";
      } else if (Notification.permission === "denied") {
        e = "bloqueado";
      } else {
        const reg = await navigator.serviceWorker.getRegistration("/admin/");
        const sub = await reg?.pushManager.getSubscription();
        e = sub ? "ligado" : "desligado";
      }
      setIos(ehIos);
      setInstalado(standalone);
      setEstado(e);
    })();
  }, []);

  const ativar = async () => {
    if (!vapidPublic) return setMsg("Não foi possível preparar as notificações. Tente de novo em instantes.");
    setOcupado(true);
    setMsg(null);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setEstado(perm === "denied" ? "bloqueado" : "desligado");
        return;
      }
      const reg = (await navigator.serviceWorker.getRegistration("/admin/")) ?? (await navigator.serviceWorker.register("/admin/sw.js", { scope: "/admin/" }));
      await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64ParaUint8(vapidPublic) }));
      const j = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      await salvarInscricaoPush({ endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth, aparelho: nomeAparelho() });
      setEstado("ligado");
      const n = await testarPush();
      setMsg(n > 0 ? "Pronto! Enviamos uma notificação de teste para este aparelho." : "Notificações ativadas.");
    } catch (e) {
      setMsg(e instanceof Error ? `Não deu certo: ${e.message}` : "Não deu certo. Tente de novo.");
    } finally {
      setOcupado(false);
    }
  };

  const desativar = async () => {
    setOcupado(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/admin/");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await removerInscricaoPush(sub.endpoint);
        await sub.unsubscribe();
      }
      setEstado("desligado");
      setMsg("Notificações desligadas neste aparelho.");
    } finally {
      setOcupado(false);
    }
  };

  const testar = async () => {
    setOcupado(true);
    try {
      const n = await testarPush();
      setMsg(n > 0 ? "Notificação de teste enviada." : "Nenhum aparelho recebeu. Desative e ative de novo.");
    } finally {
      setOcupado(false);
    }
  };

  return (
    <section className="card space-y-4 p-4">
      <div className="flex items-start gap-3">
        <Smartphone className="mt-0.5 shrink-0 text-caixa" size={22} aria-hidden />
        <div>
          <h2 className="font-bold">App no celular</h2>
          <p className="text-sm text-ink-soft">Instale o painel como aplicativo e receba no celular os novos clientes e os lembretes da agenda.</p>
        </div>
      </div>

      {!instalado && (
        <div className="rounded-xl bg-mist p-3 text-sm">
          <p className="font-semibold">{ios ? "Como instalar no iPhone" : "Como instalar"}</p>
          {ios ? (
            <ol className="mt-2 list-decimal space-y-1.5 pl-5">
              <li>Abra este painel no <strong>Safari</strong>.</li>
              <li>
                Toque em <Share size={14} className="inline align-[-2px]" aria-label="Compartilhar" /> <strong>Compartilhar</strong> (na barra de baixo).
              </li>
              <li>
                Role e toque em <PlusSquare size={14} className="inline align-[-2px]" aria-hidden /> <strong>Adicionar à Tela de Início</strong>.
              </li>
              <li>Deixe ligado <strong>&quot;Abrir como app&quot;</strong>, se aparecer, e toque em <strong>Adicionar</strong>.</li>
              <li>Abra o <strong>Akali CRM</strong> pelo ícone novo e volte nesta tela para ativar as notificações.</li>
            </ol>
          ) : (
            <ol className="mt-2 list-decimal space-y-1.5 pl-5">
              <li>No Chrome do celular, toque nos <strong>três pontinhos</strong> e em <strong>Instalar app</strong> (ou &quot;Adicionar à tela inicial&quot;).</li>
              <li>No computador, clique no ícone de instalar na barra de endereço do Chrome.</li>
            </ol>
          )}
        </div>
      )}

      <div className="text-sm">
        {estado === "carregando" && <p className="text-ink-soft">Verificando este aparelho…</p>}
        {estado === "instalar-primeiro" && (
          <p className="text-ink-soft">No iPhone, as notificações só funcionam depois de instalar o app (passos acima) e abri-lo pelo ícone.</p>
        )}
        {estado === "sem-suporte" && <p className="text-ink-soft">Este navegador não aceita notificações. Use o app instalado ou o Chrome.</p>}
        {estado === "bloqueado" && (
          <p className="text-red-700">
            As notificações foram bloqueadas neste aparelho. No iPhone: <strong>Ajustes → Notificações → Akali CRM</strong> e ligue
            &quot;Permitir Notificações&quot;.
          </p>
        )}
        {estado === "desligado" && (
          <button type="button" className="btn-primary w-full sm:w-auto" onClick={ativar} disabled={ocupado}>
            {ocupado ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />} Ativar notificações neste aparelho
          </button>
        )}
        {estado === "ligado" && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip bg-emerald-100 px-3 py-1.5 text-emerald-800">
              <Bell size={14} className="mr-1" /> Notificações ativadas neste aparelho
            </span>
            <button type="button" className="btn-secondary" onClick={testar} disabled={ocupado}>
              Enviar teste
            </button>
            <button type="button" className="btn-secondary" onClick={desativar} disabled={ocupado}>
              <BellOff size={16} /> Desligar
            </button>
          </div>
        )}
        {msg && <p className="mt-2 rounded-lg bg-caixa-50 px-3 py-2">{msg}</p>}
      </div>
    </section>
  );
}
