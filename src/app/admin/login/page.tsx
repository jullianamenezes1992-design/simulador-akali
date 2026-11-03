import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";
import Logo from "@/components/site/Logo";

export const metadata: Metadata = { title: "Entrar no painel", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; erro?: string }> }) {
  const sp = await searchParams;
  const next = sp.next && sp.next.startsWith("/admin") ? sp.next : "/admin";
  return (
    <div className="flex min-h-dvh items-center justify-center bg-mist px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo nome="Painel" />
        </div>
        <div className="card p-6">
          <h1 className="text-xl font-extrabold">Entrar</h1>
          <p className="mt-1 text-sm text-ink-soft">Acesso restrito à equipe da corretora.</p>
          {sp.erro === "sem-permissao" && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              Seu usuário não tem permissão de acesso ao painel. Peça a um administrador para liberar.
            </p>
          )}
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
