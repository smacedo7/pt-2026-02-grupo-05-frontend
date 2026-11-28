"use client";

import Image from "next/image";
import Link from "next/link";
import LinkNavbar from "./LinkNavbar";
import { useSessao } from "./useSessao";

const ICONE = "h-6 w-6 shrink-0";
const BOTAO_ICONE =
  "flex h-11 w-11 items-center justify-center rounded-full md:h-10 md:w-10 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roxo";

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
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={ICONE}>
      {/* Toldo cheio com três frestas (evenodd) sobre a parede e o balcão. */}
      <path fillRule="evenodd" d="M5 3h14l2 4.5V13H3V7.5L5 3Zm2 6v2.5h2V9H7Zm4 0v2.5h2V9h-2Zm4 0v2.5h2V9h-2Z" />
      <path d="M4 13h1.75v8H4v-8Zm4 0h1.75v6.25h8.5V13H20v8H8v-8Z" />
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
      {/* Uma linha só a partir de 320px; a quebra fica para telas ainda mais estreitas. */}
      <nav aria-label="Principal" className="flex flex-wrap items-center justify-between gap-1 px-2 py-2 min-[320px]:flex-nowrap min-[360px]:gap-x-2 min-[360px]:px-3 md:gap-4 md:px-10 md:py-4">
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

        <div className="ml-auto flex flex-wrap items-center justify-end min-[320px]:flex-nowrap min-[360px]:gap-0.5 md:gap-3">
          <LinkNavbar href="/produtos" rotulo="Produtos" className={BOTAO_ICONE} classeAtiva="text-limao">
            <IconeSacola />
          </LinkNavbar>
          <LinkNavbar href="/lojas" rotulo="Lojas" className={BOTAO_ICONE} classeAtiva="text-limao">
            <IconeLoja />
          </LinkNavbar>

          {estado === "deslogado" && (
            <>
              <LinkNavbar
                href="/login"
                className="flex min-h-11 min-w-11 items-center justify-center whitespace-nowrap rounded px-0.5 text-sm min-[360px]:px-2 md:min-h-0 md:py-2 font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roxo md:px-3"
                classeAtiva="text-limao"
              >
                LOGIN
              </LinkNavbar>
              <LinkNavbar
                href="/cadastro"
                className="flex min-h-11 items-center whitespace-nowrap rounded-full px-2 text-xs min-[360px]:px-3 md:min-h-0 md:py-2 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roxo md:px-4 md:text-sm"
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
