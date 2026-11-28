"use client";

import Image from "next/image";
import Link from "next/link";
import type { EstadoListaCategorias } from "@/components/home/categorias";

type Props = {
  lista: EstadoListaCategorias;
  aoTentarNovamente: () => void;
};

/** Faixa superior de categorias exibida na tela geral de Lojas. */
export default function FaixaCategoriasLojas({ lista, aoTentarNovamente }: Props) {
  return (
    <section
      aria-labelledby="titulo-categorias-lojas"
      className="w-full bg-preto pb-10 pt-6 text-white md:pb-12 md:pt-8"
    >
      <div className="mx-auto max-w-7xl px-6">
        <h2
          id="titulo-categorias-lojas"
          className="mb-6 font-sans text-2xl font-medium text-white md:text-[28px]"
        >
          Categoria
        </h2>

        <div
          role="region"
          aria-label="Categorias"
          tabIndex={0}
          className="flex gap-6 overflow-x-auto rounded-lg pb-2 pr-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff] sm:gap-8 lg:gap-10 [-ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden"
        >
          {lista.status === "carregando" && (
            <>
              <p role="status" className="sr-only">
                Carregando categorias...
              </p>
              {Array.from({ length: 8 }).map((_, indice) => (
                <div
                  key={indice}
                  aria-hidden="true"
                  className="h-[104px] w-[104px] shrink-0 animate-pulse rounded-3xl bg-white/90 sm:h-[110px] sm:w-[110px]"
                />
              ))}
            </>
          )}

          {lista.status === "erro" && (
            <div className="flex w-full flex-col items-center gap-3 py-4 text-center">
              <p role="alert" className="text-sm text-red-300">
                {lista.mensagem}
              </p>
              <button
                type="button"
                onClick={aoTentarNovamente}
                className="cursor-pointer rounded-full bg-roxo px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#5c2de0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff] focus-visible:ring-offset-2 focus-visible:ring-offset-preto"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {lista.status === "ok" && lista.categorias.length === 0 && (
            <p role="status" className="w-full py-4 text-center text-sm text-white/70">
              Nenhuma categoria cadastrada.
            </p>
          )}

          {lista.status === "ok" &&
            lista.categorias.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categorias/${cat.slug}`}
                aria-label={`Ir para categoria ${cat.nome}`}
                className="flex h-[104px] w-[104px] shrink-0 items-center justify-center rounded-3xl bg-white p-3 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff] focus-visible:ring-offset-2 focus-visible:ring-offset-preto sm:h-[110px] sm:w-[110px]"
              >
                {cat.imagem ? (
                  <Image
                    src={cat.imagem}
                    alt=""
                    width={76}
                    height={76}
                    className="object-contain"
                    aria-hidden="true"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="line-clamp-3 break-words text-center text-xs font-medium text-[#6a38ff]"
                  >
                    {cat.nome}
                  </span>
                )}
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
}
