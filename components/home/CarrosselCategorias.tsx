"use client";

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { EstadoListaCategorias } from './categorias';

type Props = {
  lista: EstadoListaCategorias;
  aoTentarNovamente: () => void;
};

const BOTAO_CARROSSEL =
  'rounded-full border border-gray-100 bg-white p-2 text-[#6a38ff] shadow-sm select-none transition-all hover:bg-gray-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff] focus-visible:ring-offset-2';

/** Carrossel horizontal de categorias da página inicial com controles de rolagem. */
export default function CarrosselCategorias({ lista, aoTentarNovamente }: Props) {
  const categoriasRef = useRef<HTMLDivElement>(null);
  const scrollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopScroll = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
  };

  useEffect(() => stopScroll, []);

  const startScroll = (direcao: 'esquerda' | 'direita') => {
    if (scrollInterval.current) return;
    const passo = direcao === 'esquerda' ? -12 : 12;
    scrollInterval.current = setInterval(() => {
      categoriasRef.current?.scrollBy({ left: passo, behavior: 'auto' });
    }, 20);
  };

  const scrollStep = (direcao: 'esquerda' | 'direita') => {
    const passo = direcao === 'esquerda' ? -220 : 220;
    categoriasRef.current?.scrollBy({ left: passo, behavior: 'smooth' });
  };

  return (
    <section id="categorias" aria-labelledby="titulo-categorias">
      <div className="mb-6 flex items-center justify-between">
        <h2 id="titulo-categorias" className="font-sans text-3xl text-black">
          Categoria
        </h2>

        <div className="hidden gap-2 md:flex">
          <button
            type="button"
            onClick={() => scrollStep('esquerda')}
            onMouseDown={() => startScroll('esquerda')}
            onMouseUp={stopScroll}
            onMouseLeave={stopScroll}
            onTouchStart={() => startScroll('esquerda')}
            onTouchEnd={stopScroll}
            aria-label="Ver categorias anteriores"
            aria-controls="lista-categorias"
            className={BOTAO_CARROSSEL}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollStep('direita')}
            onMouseDown={() => startScroll('direita')}
            onMouseUp={stopScroll}
            onMouseLeave={stopScroll}
            onTouchStart={() => startScroll('direita')}
            onTouchEnd={stopScroll}
            aria-label="Ver próximas categorias"
            aria-controls="lista-categorias"
            className={BOTAO_CARROSSEL}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      <div
        id="lista-categorias"
        ref={categoriasRef}
        role="region"
        aria-label="Categorias de produtos"
        tabIndex={0}
        className="mb-10 flex gap-10 overflow-x-auto rounded-lg scroll-smooth pb-6 pr-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff] lg:gap-14 [-ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden"
      >
        {lista.status === 'carregando' && (
          <>
            <p role="status" className="sr-only">
              Carregando categorias...
            </p>
            {Array.from({ length: 8 }).map((_, indice) => (
              <div
                key={indice}
                aria-hidden="true"
                className="h-[110px] w-[110px] shrink-0 animate-pulse rounded-3xl bg-white shadow-sm"
              />
            ))}
          </>
        )}

        {lista.status === 'erro' && (
          <div className="flex w-full flex-col items-center gap-3 py-4 text-center">
            <p role="alert" className="text-sm text-red-500">
              {lista.mensagem}
            </p>
            <button
              type="button"
              onClick={aoTentarNovamente}
              className="cursor-pointer rounded-full bg-roxo px-5 py-2 text-sm font-bold text-white hover:bg-[#5c2de0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff] focus-visible:ring-offset-2"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {lista.status === 'ok' && lista.categorias.length === 0 && (
          <p role="status" className="w-full py-4 text-center text-sm text-gray-500">
            Nenhuma categoria cadastrada.
          </p>
        )}

        {lista.status === 'ok' &&
          lista.categorias.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categorias/${cat.slug}`}
              aria-label={`Ir para categoria ${cat.nome}`}
              className="flex h-[110px] w-[110px] shrink-0 cursor-pointer items-center justify-center rounded-3xl bg-white p-3 shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff] focus-visible:ring-offset-2"
            >
              {cat.imagem ? (
                <Image
                  src={cat.imagem}
                  alt=""
                  width={70}
                  height={70}
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
    </section>
  );
}
