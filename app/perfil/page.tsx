"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import CardProduto from "@/app/categorias/[slug]/CardProduto";
import type { Produto } from "@/lib/categorias/tipos";
import { buscarPerfil, type UsuarioPerfil } from "./buscarPerfil";
import { buscarProdutos } from "./buscarProdutos";

const MENSAGEM_CONEXAO =
  "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
const MENSAGEM_ERRO = "Não foi possível carregar as informações.";

type EstadoPerfil =
  | { status: "carregando" }
  | { status: "ok"; usuario: UsuarioPerfil }
  | { status: "erro"; mensagem: string };

type EstadoProdutos =
  | { status: "carregando" }
  | { status: "ok"; produtos: Produto[] }
  | { status: "erro"; mensagem: string };

export default function PerfilPage() {
  const router = useRouter();
  const [estado, setEstado] = useState<EstadoPerfil>({ status: "carregando" });
  const [estadoProdutos, setEstadoProdutos] = useState<EstadoProdutos>({
    status: "carregando",
  });

  // Perfil
  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      const resultado = await buscarPerfil();
      if (cancelado) return;

      if (resultado.tipo === "ok") {
        setEstado({ status: "ok", usuario: resultado.usuario });
      } else if (resultado.tipo === "sem-sessao") {
        router.replace("/login");
      } else {
        setEstado({
          status: "erro",
          mensagem:
            resultado.tipo === "conexao" ? MENSAGEM_CONEXAO : MENSAGEM_ERRO,
        });
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [router]);

  // Produtos (só busca depois que o perfil carregar)
  useEffect(() => {
    if (estado.status !== "ok") return;
    let cancelado = false;

    async function carregarProdutos() {
      const resultado = await buscarProdutos(10);
      if (cancelado) return;

      if (resultado.tipo === "ok") {
        setEstadoProdutos({ status: "ok", produtos: resultado.produtos });
      } else {
        setEstadoProdutos({
          status: "erro",
          mensagem:
            resultado.tipo === "conexao" ? MENSAGEM_CONEXAO : MENSAGEM_ERRO,
        });
      }
    }

    carregarProdutos();
    return () => {
      cancelado = true;
    };
  }, [estado]);

  useEffect(() => {
    if (estado.status === "ok") {
      document.title = `Perfil de ${estado.usuario.name} | Stock.io`;
    }
  }, [estado]);

  const usuario = estado.status === "ok" ? estado.usuario : null;
  const inicial = usuario ? usuario.name.charAt(0).toUpperCase() : "";

  return (
    <div className="min-h-screen bg-creme pb-12">
      <a
        href="#conteudo-perfil"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:outline-none focus:ring-2 focus:ring-[#6D3BFF]"
      >
        Pular para o conteúdo do perfil
      </a>

      <div className="relative w-full bg-preto pt-28">
        <div className="absolute inset-x-0 top-0 z-20">
          <Navbar />
        </div>
        <div className="relative mx-auto h-24 max-w-7xl px-6 sm:h-40 lg:h-[325px]">
          <Link
            href="/"
            aria-label="Voltar para a página inicial"
            className="absolute bottom-4 left-2 h-9 w-6 rounded text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:bottom-8 sm:left-6 sm:h-11 sm:w-7 lg:bottom-[52px] lg:h-[55px] lg:w-9"
          >
            <svg
              viewBox="0 0 35 55"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-full w-full"
              aria-hidden="true"
            >
              <path d="M31 3L4 27.5L31 52" />
            </svg>
          </Link>
        </div>
      </div>

      <main
        id="conteudo-perfil"
        tabIndex={-1}
        aria-busy={estado.status === "carregando"}
        className="mx-auto max-w-7xl px-6 focus:outline-none"
      >
        {estado.status === "carregando" && (
          <p aria-hidden="true" className="mt-10 text-lg text-gray-600">
            Carregando perfil...
          </p>
        )}

        {estado.status === "erro" && (
          <div role="alert" className="mt-10 flex flex-col items-start gap-4">
            <p className="text-lg text-red-700">{estado.mensagem}</p>
          </div>
        )}

        {usuario && (
          <>
            <section
              aria-labelledby="nome-usuario"
              className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 lg:ml-[72px]">
                <div className="relative z-10 -mt-14 ml-12 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gray-300 sm:-mt-24 sm:ml-0 sm:h-44 sm:w-44 lg:-mt-[190px] lg:h-[230px] lg:w-[230px]">
                  {usuario.profilePictureUrl ? (
                    <img
                      src={usuario.profilePictureUrl}
                      alt={`Foto de perfil de ${usuario.name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span
                      role="img"
                      aria-label={`${usuario.name} ainda não tem foto de perfil`}
                      className="text-4xl font-bold text-gray-700 sm:text-6xl lg:text-8xl"
                    >
                      {inicial}
                    </span>
                  )}
                </div>

                <h1
                  id="nome-usuario"
                  className="mt-3 break-words text-3xl font-bold sm:text-5xl lg:leading-none"
                >
                  {usuario.name}
                </h1>
                <dl className="text-lg text-gray-600 sm:text-2xl">
                  <div className="mt-2 sm:mt-3">
                    <dt className="sr-only">Nome de usuário</dt>
                    <dd className="lg:leading-none">
                      <span aria-hidden="true">@ </span>
                      {usuario.username}
                    </dd>
                  </div>
                  <div className="mt-2 sm:mt-3.5">
                    <dt className="sr-only">E-mail</dt>
                    <dd className="flex items-center gap-2 break-all lg:leading-none">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 shrink-0 sm:h-6 sm:w-6 lg:h-[22px] lg:w-[22px]"
                        aria-hidden="true"
                      >
                        <path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v.5l-10 6.25L2 6.5V6zm0 3.35V18a2 2 0 002 2h16a2 2 0 002-2V9.35l-9.47 5.92a1 1 0 01-1.06 0L2 9.35z" />
                      </svg>
                      {usuario.email}
                    </dd>
                  </div>
                </dl>
              </div>

              <Link
                href="/perfil/editar"
                aria-label={`Editar perfil de ${usuario.name}`}
                className="flex w-full items-center justify-center rounded-full border-2 border-transparent bg-[#6D3BFF] px-8 py-3 text-lg font-medium text-white shadow-md hover:bg-[#5a2ee0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D3BFF] focus-visible:ring-offset-2 sm:mt-6 sm:w-auto lg:mt-8 lg:h-11 lg:w-[324px] lg:py-0 lg:text-xl"
              >
                Editar Perfil
              </Link>
            </section>

            <section className="mt-10 lg:mt-16" aria-labelledby="titulo-produtos">
              <div className="flex items-baseline justify-between">
                <h2
                  id="titulo-produtos"
                  className="text-2xl font-bold sm:text-3xl lg:text-[32px] lg:leading-none"
                >
                  Produtos
                </h2>
                {estadoProdutos.status === "ok" && estadoProdutos.produtos.length > 0 && (
                  <Link
                    href="/perfil/produtos"
                    aria-label="Ver mais produtos"
                    className="rounded text-sm font-semibold text-[#6D3BFF] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D3BFF] focus-visible:ring-offset-2"
                  >
                    ver mais
                  </Link>
                )}
              </div>

              {estadoProdutos.status === "carregando" && (
                <p className="mt-4 text-gray-600">Carregando produtos...</p>
              )}

              {estadoProdutos.status === "erro" && (
                <p role="alert" className="mt-4 text-red-600">
                  {estadoProdutos.mensagem}
                </p>
              )}

              {estadoProdutos.status === "ok" && estadoProdutos.produtos.length === 0 && (
                <p className="mt-4 text-gray-600">
                  Nenhum produto cadastrado ainda.
                </p>
              )}

              {estadoProdutos.status === "ok" && estadoProdutos.produtos.length > 0 && (
                <div
                  role="region"
                  aria-labelledby="titulo-produtos"
                  tabIndex={0}
                  className="mt-4 snap-x overflow-x-auto rounded-lg pb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D3BFF] lg:mt-11"
                >
                  <ul role="list" className="flex gap-4 lg:gap-8">
                    {estadoProdutos.produtos.map((produto) => (
                      <li
                        key={produto.id}
                        className="w-48 shrink-0 snap-start sm:w-56 lg:w-[229px]"
                      >
                        <CardProduto produto={produto} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}