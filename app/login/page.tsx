"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [aviso, setAviso] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setAviso(
      "O formulário está pronto. A conexão com o login ainda será implementada.",
    );
  }

  const estiloCampo =
    "w-full rounded-full bg-[#f6f8e2] px-5 py-3 " +
    "text-[#171a17] placeholder:text-[#171a17]/60 " +
    "outline-none focus:ring-2 focus:ring-[#a98aff]";

  return (
    <main className="min-h-screen bg-[#f6f8e2] text-[#171a17]">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 gap-8 px-6 pt-10 md:grid-cols-2 md:gap-12 md:px-12 md:pt-16">
        {/* Logo e mascote */}
        <div className="flex flex-col items-center">
          <div className="relative h-20 w-full max-w-72 md:h-24">
            <Image
              src="/logo.png"
              alt="Stock.io"
              fill
              priority
              sizes="288px"
              className="object-contain"
            />
          </div>

          <div className="relative mt-4 hidden min-h-96 w-full flex-1 md:block">
            <Image
              src="/mascote-login.png"
              alt=""
              fill
              priority
              sizes="(min-width: 1152px) 480px, 50vw"
              className="object-contain object-bottom"
            />
          </div>
        </div>

        {/* Formulário de login */}
        <section
          aria-labelledby="titulo-login"
          className="flex flex-col rounded-t-[2.5rem] bg-[#171a17] px-6 py-12 text-[#f6f8e2] md:rounded-t-[4rem] md:px-10 md:py-16"
        >
          <div className="mx-auto w-full max-w-sm">
            <h1
              id="titulo-login"
              className="mb-8 text-center text-2xl font-extrabold"
            >
              BEM VINDO DE VOLTA!
            </h1>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <div>
                <label htmlFor="email" className="sr-only">
                  E-mail
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="E-mail"
                  required
                  className={estiloCampo}
                />
              </div>

              <div>
                <label htmlFor="password" className="sr-only">
                  Senha
                </label>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={mostrarSenha ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Senha"
                    required
                    className={`${estiloCampo} pr-24`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarSenha((valorAtual) => !valorAtual)
                    }
                    aria-controls="password"
                    aria-pressed={mostrarSenha}
                    aria-label={
                      mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                    }
                    className="absolute inset-y-0 right-4 cursor-pointer rounded px-1 text-sm font-semibold text-[#171a17] focus-visible:outline-2 focus-visible:outline-[#6d3cf7]"
                  >
                    {mostrarSenha ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setAviso(
                    "A recuperação de senha ainda será conectada ao sistema.",
                  )
                }
                className="self-center cursor-pointer rounded text-sm underline underline-offset-4 hover:text-[#c4adff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c4adff]"
              >
                Esqueceu sua senha?
              </button>

              <button
                type="submit"
                className="cursor-pointer rounded-full bg-[#6d3cf7] px-5 py-3 font-bold transition-colors hover:bg-[#5c2de0] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f6f8e2]"
              >
                ENTRAR
              </button>

              <p
                role="status"
                aria-live="polite"
                className="text-center text-sm"
              >
                {aviso}
              </p>
            </form>

            <p className="mt-5 text-center text-sm">
              Não possui uma conta?{" "}
              <Link
                href="/cadastro"
                className="rounded font-semibold text-[#b79aff] underline underline-offset-4 hover:text-[#d0bdff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b79aff]"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}