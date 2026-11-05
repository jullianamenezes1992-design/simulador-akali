"use client";

import { useState, useTransition } from "react";
import { Download, HardDriveDownload, Loader2, RefreshCw } from "lucide-react";
import { fazerBackupAgora, linkDownloadBackup } from "@/app/admin/actions";

const dataDoNome = (n: string) => n.replace("backup-akali-", "").replace(".xlsx", "").split("-").reverse().join("/");

export default function Backups({ arquivos, podeGerar }: { arquivos: { nome: string; tamanho: number | null }[]; podeGerar: boolean }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const baixar = (nome: string) =>
    start(async () => {
      try {
        window.location.href = await linkDownloadBackup(nome);
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Não foi possível baixar.");
      }
    });

  return (
    <section id="backups" className="card space-y-3 p-4">
      <div className="flex items-start gap-3">
        <HardDriveDownload className="mt-0.5 shrink-0 text-caixa" size={22} aria-hidden />
        <div>
          <h2 className="font-bold">Cópias de segurança</h2>
          <p className="text-sm text-ink-soft">
            Toda semana o sistema salva uma planilha com clientes, agenda, observações e empreendimentos. Se o e-mail estiver
            configurado em Configurações, ela também chega no seu e-mail.
          </p>
        </div>
      </div>
      {arquivos.length ? (
        <ul className="divide-y divide-line rounded-xl border border-line">
          {arquivos.map((a) => (
            <li key={a.nome} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
              <span>
                Backup de <strong>{dataDoNome(a.nome)}</strong>
                {a.tamanho ? <span className="text-ink-soft"> · {Math.max(1, Math.round(a.tamanho / 1024))} KB</span> : null}
              </span>
              <button type="button" className="btn-secondary px-3 py-1.5" disabled={pending} onClick={() => baixar(a.nome)}>
                <Download size={14} /> Baixar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-soft">O primeiro backup é feito automaticamente em instantes.</p>
      )}
      {podeGerar && (
        <button
          type="button"
          className="btn-secondary"
          disabled={pending}
          onClick={() =>
            start(async () => {
              try {
                const r = await fazerBackupAgora();
                setMsg(`Backup feito agora: ${r.clientes} cliente(s) salvos.`);
              } catch (e) {
                setMsg(e instanceof Error ? e.message : "Não foi possível fazer o backup.");
              }
            })
          }
        >
          {pending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Fazer backup agora
        </button>
      )}
      {msg && <p className="rounded-lg bg-caixa-50 px-3 py-2 text-sm">{msg}</p>}
    </section>
  );
}
