"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error) {
      setErro(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
      setLoading(false);
      return;
    }
    router.replace(next);
    router.refresh();
  };

  return (
    <form onSubmit={entrar} className="mt-5 space-y-4">
      <div>
        <label className="label" htmlFor="email">E-mail</label>
        <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="senha">Senha</label>
        <input id="senha" type="password" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} className="input" />
      </div>
      {erro && <p className="field-error">{erro}</p>}
      <button className="btn-primary w-full" disabled={loading}>
        {loading && <Loader2 size={16} className="animate-spin" />} Entrar
      </button>
    </form>
  );
}
