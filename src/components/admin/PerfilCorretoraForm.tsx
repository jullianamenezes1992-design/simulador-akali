"use client";

/* eslint-disable @next/next/no-img-element -- foto vem do Storage */
import { useRef, useState, useTransition } from "react";
import { Camera, Loader2, Save, Trash2, UserRound } from "lucide-react";
import { salvarPerfilCorretora } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";

/** Reduz a foto no próprio celular (fotos do iPhone são grandes) e devolve um JPEG quadrado de 600px. */
async function prepararFoto(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const lado = Math.min(bmp.width, bmp.height);
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bmp, (bmp.width - lado) / 2, (bmp.height - lado) / 2, lado, lado, 0, 0, 600, 600);
  return await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("Não foi possível ler a foto."))), "image/jpeg", 0.88));
}

export default function PerfilCorretoraForm({ nome, foto }: { nome: string | null; foto: string | null }) {
  const [valorNome, setValorNome] = useState(nome ?? "");
  const [fotoAtual, setFotoAtual] = useState(foto);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  const enviarFoto = (file: File) =>
    start(async () => {
      setMsg(null);
      try {
        const blob = await prepararFoto(file);
        const supabase = createClient();
        const path = `perfil/corretora-${Date.now()}.jpg`;
        const { error } = await supabase.storage.from("empreendimentos").upload(path, blob, { contentType: "image/jpeg", upsert: false });
        if (error) throw new Error(error.message);
        const url = supabase.storage.from("empreendimentos").getPublicUrl(path).data.publicUrl;
        await salvarPerfilCorretora({ nome: valorNome, fotoUrl: url });
        setFotoAtual(url);
        setMsg("Foto salva! Ela já aparece no resultado da simulação.");
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Erro ao enviar a foto.");
      }
    });

  return (
    <section className="card mt-6 space-y-4 p-4">
      <div>
        <h2 className="font-bold">Sua apresentação para o cliente</h2>
        <p className="hint">
          Aparece no fim da simulação, com o aviso de que você vai entrar em contato. Assim o cliente já reconhece você quando receber
          a sua mensagem.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-caixa-50 ring-4 ring-white">
          {fotoAtual ? <img src={fotoAtual} alt="Sua foto" className="h-full w-full object-cover" /> : <UserRound size={40} className="text-caixa" aria-hidden />}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={input}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) enviarFoto(f);
              e.target.value = "";
            }}
          />
          <button type="button" className="btn-primary" disabled={pending} onClick={() => input.current?.click()}>
            {pending ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />} {fotoAtual ? "Trocar foto" : "Enviar foto"}
          </button>
          {fotoAtual && (
            <button
              type="button"
              className="btn-secondary"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await salvarPerfilCorretora({ nome: valorNome, fotoUrl: null });
                  setFotoAtual(null);
                  setMsg("Foto removida.");
                })
              }
            >
              <Trash2 size={16} /> Remover
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-60 flex-1">
          <label className="label" htmlFor="corretora_nome">Como você se apresenta ao cliente</label>
          <input id="corretora_nome" value={valorNome} onChange={(e) => setValorNome(e.target.value)} maxLength={80} className="input" placeholder="Ex.: Corretora Akali" />
        </div>
        <button
          type="button"
          className="btn-secondary"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await salvarPerfilCorretora({ nome: valorNome });
              setMsg("Nome salvo.");
            })
          }
        >
          <Save size={16} /> Salvar nome
        </button>
      </div>
      {msg && <p className="rounded-lg bg-caixa-50 px-3 py-2 text-sm">{msg}</p>}
    </section>
  );
}
