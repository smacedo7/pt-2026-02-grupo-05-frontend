"use client";

import Image from "next/image";
import Link from "next/link";
import { useSessao } from "./useSessao";

const ICONE = "h-6 w-6 shrink-0";
const BOTAO_ICONE =
  "flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roxo disabled:cursor-default disabled:hover:bg-transparent";

function IconeSacola() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={ICONE}>
      <path d="M5 8h14l-1 12H6L5 8Z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
    </svg>
  );
}

function IconeLoja() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={ICONE}>
      <path d="M4 9l1.5-5h13L20 9" strokeLinejoin="round" />
      <path d="M4 9h16v11H4z" strokeLinejoin="round" />
      <path d="M9 20v-6h6v6" strokeLinejoin="round" />
    </svg>
  );
}

function IconeUsuario() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={ICONE}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" strokeLinecap="round" />
    </svg>
  );
}

function IconeSair() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={ICONE}>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" strokeLinecap="round" />
      <path d="M3 12h11m0 0-3.5-3.5M14 12l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Navbar() {
  const { estado, encerrarSessao } = useSessao();

  return (
    <header className="bg-preto text-creme">
      <nav aria-label="Principal" className="flex items-center justify-between gap-4 px-4 py-4 md:px-10">
        <Link href="/" className="rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-roxo">
          {/* Logo em branco: o original é preto e ficaria invisível sobre a navbar preta. */}
          <Image
            src="/logo.png"
            alt="Stock.io"
            width={842}
            height={444}
            className="h-10 w-auto brightness-0 invert md:h-12"
          />
        </Link>

        <div className="flex items-center gap-1 md:gap-3">
          <button type="button" disabled title="Em breve" aria-label="Sacola de compras (em breve)" className={BOTAO_ICONE}>
            <IconeSacola />
          </button>
          <button type="button" disabled title="Em breve" aria-label="Lojas (em breve)" className={BOTAO_ICONE}>
            <IconeLoja />
          </button>

          {estado === "deslogado" && (
            <>
              <Link
                href="/login"
                className="whitespace-nowrap rounded px-2 py-2 text-sm font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roxo md:px-3"
              >
                LOGIN
              </Link>
              <Link
                href="/cadastro"
                className="whitespace-nowrap rounded-full bg-roxo px-3 py-2 text-xs font-bold text-white hover:bg-[#5c2de0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roxo md:px-4 md:text-sm"
              >
                CADASTRE-SE
              </Link>
            </>
          )}

          {estado === "logado" && (
            <>
              <button type="button" disabled title="Em breve" aria-label="Perfil (em breve)" className={BOTAO_ICONE}>
                <IconeUsuario />
              </button>
              <button
                type="button"
                onClick={encerrarSessao}
                aria-label="Sair"
                title="Sair"
                className={BOTAO_ICONE}
              >
                <IconeSair />
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
