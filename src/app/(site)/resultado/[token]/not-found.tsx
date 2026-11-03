import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page max-w-lg py-20 text-center">
      <h1 className="text-2xl font-extrabold">Simulação não encontrada</h1>
      <p className="mt-2 text-ink-soft">O link pode estar incorreto ou os dados foram removidos a pedido do titular.</p>
      <Link href="/simulacao" className="btn-primary mt-6">
        Fazer nova simulação
      </Link>
    </div>
  );
}
