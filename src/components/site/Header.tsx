import Link from "next/link";
import Logo from "./Logo";

export default function Header({ empresa }: { empresa: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link href="/" aria-label="Página inicial">
          <Logo nome={empresa} />
        </Link>
        <nav className="flex items-center gap-1 text-sm font-semibold sm:gap-2">
          <Link href="/empreendimentos" className="rounded-lg px-3 py-2 text-ink hover:bg-mist hover:text-caixa">
            Imóveis
          </Link>
          <Link href="/simulacao" className="btn-primary min-h-10 px-4 py-2">
            Simular
          </Link>
        </nav>
      </div>
    </header>
  );
}
