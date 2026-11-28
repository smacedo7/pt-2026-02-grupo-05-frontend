"use client";

import type { RefObject } from 'react';
import Link from 'next/link';
import { ProductCard, ProductSkeleton } from './CardProdutoHome';
import type { useVitrine } from './useVitrine';

const MAXIMO_POR_SECAO = 5;

type Props = {
  vitrine: ReturnType<typeof useVitrine>;
  ref?: RefObject<HTMLElement | null>;
};

function BotaoTentarNovamente({ aoClicar }: { aoClicar: () => void }) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      className="cursor-pointer rounded-full bg-roxo px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#5c2de0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff] focus-visible:ring-offset-2"
    >
      Tentar novamente
    </button>
  );
}

/** Uma seção de produtos para cada categoria raiz, com o link "ver mais". */
export default function SecoesPorCategoria({ vitrine, ref }: Props) {
  const { textoBusca, limparBusca, tentarNovamente, secoesVisiveis, semResultados, erroNaBusca } =
    vitrine;

  return (
    <section
      ref={ref}
      aria-label="Produtos por categoria"
      className="mt-10 flex scroll-mt-24 flex-col gap-16"
    >
      <div role="status" aria-live="polite">
        {semResultados && (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-base text-gray-600">
              Nenhum produto encontrado para &ldquo;{textoBusca.trim()}&rdquo;.
            </p>
            <button
              type="button"
              onClick={limparBusca}
              className="cursor-pointer rounded-full bg-roxo px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#5c2de0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff] focus-visible:ring-offset-2"
            >
              Limpar busca
            </button>
          </div>
        )}
      </div>

      {erroNaBusca && (
        <div className="flex flex-col items-center gap-3 text-center">
          <p role="alert" className="text-sm text-red-500">
            {erroNaBusca}
          </p>
          <BotaoTentarNovamente aoClicar={tentarNovamente} />
        </div>
      )}

      {secoesVisiveis.map(({ categoria, estado, produtosFiltrados }) => (
        <div key={categoria.slug}>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-black">
              Produtos <span className="text-sm font-normal lowercase text-black">em</span>{' '}
              <span className="text-sm font-normal text-[#6a38ff]">{categoria.nome}</span>
            </h2>
            <Link
              href={`/categorias/${categoria.slug}`}
              aria-label={`Ver mais produtos em ${categoria.nome}`}
              className="rounded text-sm font-semibold text-[#6a38ff] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff]"
            >
              ver mais
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
            {estado.status === 'carregando' &&
              Array.from({ length: MAXIMO_POR_SECAO }).map((_, index) => (
                <div
                  key={`skeleton-${categoria.slug}-${index}`}
                  className={index >= 4 ? 'hidden md:block' : ''}
                >
                  <ProductSkeleton />
                </div>
              ))}

            {estado.status === 'erro' && (
              <div className="col-span-full flex flex-col items-center gap-3 text-center">
                <p role="alert" className="text-sm text-red-500">
                  {estado.mensagem}
                </p>
                <BotaoTentarNovamente aoClicar={tentarNovamente} />
              </div>
            )}

            {estado.status === 'ok' && estado.produtos.length === 0 && (
              <p className="col-span-full text-center text-sm text-gray-500">
                Nenhum produto disponível.
              </p>
            )}

            {estado.status === 'ok' &&
              produtosFiltrados.slice(0, MAXIMO_POR_SECAO).map((prod, index) => (
                <div key={prod.id} className={index >= 4 ? 'hidden md:block' : ''}>
                  <ProductCard produto={prod} categoriaNome={categoria.nome} />
                </div>
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}
