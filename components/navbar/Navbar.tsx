"use client";

import Image from "next/image";
import Link from "next/link";
import LinkNavbar from "./LinkNavbar";
import { useSessao } from "./useSessao";

const ICONE = "h-6 w-6 shrink-0";
const BOTAO_ICONE =
  "flex h-11 w-11 items-center justify-center rounded-full md:h-10 md:w-10 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roxo disabled:cursor-default disabled:hover:bg-transparent";

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
      <nav aria-label="Principal" className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-3 py-2 md:flex-nowrap md:gap-4 md:px-10 md:py-4">
        <Link href="/" className="flex min-h-11 shrink-0 items-center rounded md:min-h-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-roxo">
          {/* Logo em branco: o original é preto e ficaria invisível sobre a navbar preta. */}
          <Image
            src="/logo.png"
            alt="Stock.io"
            width={842}
            height={444}
            className="h-8 w-auto brightness-0 invert md:h-12"
          />
        </Link>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-0.5 md:gap-3">
          <LinkNavbar href="/produtos" rotulo="Produtos" className={BOTAO_ICONE} classeAtiva="text-limao">
            <IconeSacola />
          </LinkNavbar>
          <button type="button" disabled title="Em breve" aria-label="Lojas (em breve)" className={BOTAO_ICONE}>
            <IconeLoja />
          </button>

          {estado === "deslogado" && (
            <>
              <LinkNavbar
                href="/login"
                className="flex min-h-11 items-center whitespace-nowrap rounded px-2 text-sm md:min-h-0 md:py-2 font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roxo md:px-3"
                classeAtiva="text-limao"
              >
                LOGIN
              </LinkNavbar>
              <LinkNavbar
                href="/cadastro"
                className="flex min-h-11 items-center whitespace-nowrap rounded-full px-3 text-xs md:min-h-0 md:py-2 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roxo md:px-4 md:text-sm"
                classeAtiva="bg-limao text-preto"
                classeInativa="bg-roxo text-white hover:bg-[#5c2de0]"
              >
                CADASTRE-SE
              </LinkNavbar>
            </>
          )}

          {estado === "logado" && (
            <>
              <LinkNavbar href="/perfil" rotulo="Perfil" className={BOTAO_ICONE} classeAtiva="text-limao">
                <IconeUsuario />
              </LinkNavbar>
              <button
                type="button"
                onClick={encerrarSessao}
                aria-label="Sair"
                title="Sair"
                className={`cursor-pointer ${BOTAO_ICONE}`}
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
