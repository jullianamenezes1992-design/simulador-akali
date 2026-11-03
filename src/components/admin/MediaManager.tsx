"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState, useTransition } from "react";
import { Image as ImageIcon, Loader2, Star, Trash2, Upload, Video } from "lucide-react";
import { adicionarMidia, definirCapa, removerMidia } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";
import type { Media } from "@/lib/data";

const TIPOS = [
  { value: "foto", label: "Fotos", accept: "image/jpeg,image/png,image/webp,image/avif", icon: ImageIcon },
  { value: "planta", label: "Plantas", accept: "image/jpeg,image/png,image/webp,image/svg+xml,application/pdf", icon: ImageIcon },
  { value: "video", label: "Vídeos", accept: "video/mp4,video/webm", icon: Video },
] as const;

const MAX_MB = { foto: 8, planta: 10, video: 50 };

export default function MediaManager({ developmentId, media, capaUrl }: { developmentId: string; media: Media[]; capaUrl: string | null }) {
  const [tipo, setTipo] = useState<"foto" | "planta" | "video">("foto");
  const [progresso, setProgresso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [urlVideo, setUrlVideo] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const atual = TIPOS.find((t) => t.value === tipo)!;
  const lista = media.filter((m) => m.tipo === tipo);

  const enviar = async (files: FileList | null) => {
    if (!files?.length) return;
    setErro(null);
    const supabase = createClient();
    let i = 0;
    for (const file of Array.from(files)) {
      i++;
      if (file.size > MAX_MB[tipo] * 1024 * 1024) {
        setErro(`"${file.name}" excede ${MAX_MB[tipo]} MB.`);
        continue;
      }
      setProgresso(`Enviando ${i} de ${files.length}…`);
      const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${developmentId}/${tipo}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("empreendimentos").upload(path, file, { contentType: file.type, upsert: false });
      if (error) {
        setErro(`Falha ao enviar "${file.name}": ${error.message}`);
        continue;
      }
      const { data } = supabase.storage.from("empreendimentos").getPublicUrl(path);
      await adicionarMidia({ developmentId, tipo, url: data.publicUrl, storagePath: path, legenda: null });
    }
    setProgresso(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section className="card p-4">
      <h2 className="font-bold">Fotos, plantas e vídeos</h2>
      <div className="mt-3 flex gap-1.5">
        {TIPOS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTipo(t.value)}
            className={`chip px-3 py-1.5 ${tipo === t.value ? "bg-caixa text-white" : "bg-mist text-ink"}`}
          >
            {t.label} ({media.filter((m) => m.tipo === t.value).length})
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {lista.map((m) => (
          <div key={m.id} className="group relative overflow-hidden rounded-xl border border-line bg-mist">
            {m.tipo === "video" ? (
              <div className="flex aspect-[4/3] items-center justify-center p-2 text-center text-xs break-all text-ink-soft">
                <Video size={18} className="mr-1 shrink-0" /> {m.url.split("/").pop()}
              </div>
            ) : m.url.toLowerCase().endsWith(".pdf") ? (
              <a href={m.url} target="_blank" rel="noreferrer" className="flex aspect-[4/3] items-center justify-center text-sm font-semibold text-caixa">PDF</a>
            ) : (
              <img src={m.url} alt={m.legenda ?? ""} className="aspect-[4/3] w-full object-cover" />
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5">
              {m.tipo === "foto" ? (
                <button
                  type="button"
                  title="Usar como capa"
                  onClick={() => start(() => definirCapa(developmentId, m.url))}
                  className={`rounded-lg p-1.5 ${capaUrl === m.url ? "bg-sol text-ink" : "bg-white/90 text-ink"}`}
                >
                  <Star size={14} />
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                title="Remover"
                onClick={() => confirm("Remover este arquivo?") && start(() => removerMidia(m.id))}
                className="rounded-lg bg-white/90 p-1.5 text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={!!progresso}
          className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-sm font-semibold text-caixa hover:border-caixa"
        >
          {progresso ? <Loader2 className="animate-spin" /> : <Upload />}
          {progresso ?? `Enviar ${atual.label.toLowerCase()}`}
        </button>
      </div>
      <input ref={inputRef} type="file" multiple accept={atual.accept} className="hidden" onChange={(e) => enviar(e.target.files)} />

      {tipo === "video" && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            value={urlVideo}
            onChange={(e) => setUrlVideo(e.target.value)}
            placeholder="Ou cole um link do YouTube/Vimeo"
            className="input"
          />
          <button
            type="button"
            className="btn-secondary"
            disabled={!urlVideo || pending}
            onClick={() =>
              start(async () => {
                try {
                  new URL(urlVideo);
                  await adicionarMidia({ developmentId, tipo: "video", url: urlVideo });
                  setUrlVideo("");
                } catch {
                  setErro("Link inválido.");
                }
              })
            }
          >
            Adicionar link
          </button>
        </div>
      )}
      {erro && <p className="field-error mt-3">{erro}</p>}
      <p className="hint mt-3">
        Fotos até {MAX_MB.foto} MB, plantas até {MAX_MB.planta} MB, vídeos até {MAX_MB.video} MB. A estrela define a foto de capa.
      </p>
    </section>
  );
}
