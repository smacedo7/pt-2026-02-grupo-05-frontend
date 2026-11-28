"use client";

import type { RefObject } from 'react';
import Link from 'next/link';
import type { ResumoLoja } from '@/lib/lojas/listarLojasPorId';
import BotaoTentarNovamente from './BotaoTentarNovamente';
import { ProductCard, ProductSkeleton } from './CardProdutoVitrine';
import type { SecaoCategoria } from './useVitrine';

const MAXIMO_NA_GRADE = 5;
const MAXIMO_NA_FILEIRA = 10;

const LAYOUTS = {
  grade: {
    limite: () => MAXIMO_NA_GRADE,
    classeLista: () => 'grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5',
    // Na grade de duas colunas do celular, o quinto card ficaria sozinho.
    classeItem: (indice: number) => (indice >= 4 ? 'hidden md:block' : ''),
    espacoSuperior: 'mt-10',
  },
  fileira: {
    limite: (buscando: boolean) => (buscando ? Infinity : MAXIMO_NA_FILEIRA),
    // Na fileira, a busca mostra tudo o que encontrou, quebrando em linhas.
    classeLista: (buscando: boolean) =>
      `-m-1 flex gap-4 p-1 pb-4 lg:gap-8 ${buscando ? 'flex-wrap' : 'overflow-x-auto'}`,
    classeItem: () => 'w-44 shrink-0 sm:w-[228px]',
    espacoSuperior: '',
  },
} as const;

type Props = {
  secoesVisiveis: SecaoCategoria[];
  lojas: Map<number, ResumoLoja>;
  textoBusca: string;
  buscando: boolean;
  carregandoProdutos: boolean;
  totalEncontrados: number;
  categoriasComErro: number;
  semResultados: boolean;
  erroNaBusca: string | null;
  aoLimparBusca: () => void;
  aoTentarNovamente: () => void;
  variante?: keyof typeof LAYOUTS;
  mostrarResumoBusca?: boolean;
  secaoRef?: RefObject<HTMLElement | null>;
};

/** Uma seção de produtos para cada categoria raiz, com o link "ver mais". */
export default function SecoesPorCategoria({
  secoesVisiveis,
  lojas,
  textoBusca,
  buscando,
  carregandoProdutos,
  totalEncontrados,
  categoriasComErro,
  semResultados,
  erroNaBusca,
  aoLimparBusca,
  aoTentarNovamente,
  variante = 'grade',
  mostrarResumoBusca = false,
  secaoRef,
}: Props) {
  const layout = LAYOUTS[variante];
  const maximo = layout.limite(buscando);
  const classeLista = layout.classeLista(buscando);

  return (
    <section
      ref={secaoRef}
      aria-label="Produtos por categoria"
      className={`flex scroll-mt-24 flex-col gap-16 ${layout.espacoSuperior}`}
    >
      <div role="status" aria-live="polite" className={mostrarResumoBusca ? 'empty:-mb-16' : undefined}>
        {mostrarResumoBusca && buscando && !carregandoProdutos && totalEncontrados > 0 && (
          <p className="text-sm text-gray-700">
            {totalEncontrados === 1
              ? '1 produto encontrado'
              : `${totalEncontrados} produtos encontrados`}
          </p>
        )}
        {/* Vale também sem resultado: o produto pode estar na categoria que falhou. */}
        {mostrarResumoBusca && buscando && !carregandoProdutos && !erroNaBusca && categoriasComErro > 0 && (
          <p className="text-center text-sm text-gray-700">
            Algumas categorias não carregaram e ficaram fora da busca.
          </p>
        )}
        {semResultados && (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-base text-gray-600">
              Nenhum produto encontrado para &ldquo;{textoBusca.trim()}&rdquo;.
            </p>
            <button
              type="button"
              onClick={aoLimparBusca}
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
          <BotaoTentarNovamente aoClicar={aoTentarNovamente} />
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

          <div className={classeLista}>
            {estado.status === 'carregando' &&
              Array.from({ length: MAXIMO_NA_GRADE }).map((_, index) => (
                <div key={`skeleton-${categoria.slug}-${index}`} className={layout.classeItem(index)}>
                  <ProductSkeleton />
                </div>
              ))}

            {estado.status === 'erro' && (
              <div className="col-span-full flex w-full flex-col items-center gap-3 text-center">
                <p role="alert" className="text-sm text-red-500">
                  {estado.mensagem}
                </p>
                <BotaoTentarNovamente aoClicar={aoTentarNovamente} />
              </div>
            )}

            {estado.status === 'ok' && estado.produtos.length === 0 && (
              <p className="col-span-full w-full text-center text-sm text-gray-500">
                Nenhum produto disponível.
              </p>
            )}

            {estado.status === 'ok' &&
              produtosFiltrados.slice(0, maximo).map((prod, index) => (
                <div key={prod.id} className={layout.classeItem(index)}>
                  <ProductCard produto={prod} loja={lojas.get(prod.storeId)} />
                </div>
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}
