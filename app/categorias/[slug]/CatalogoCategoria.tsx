"use client";

import { useMemo, useState } from "react";
import { filtrarEOrdenar, OPCOES_ORDENACAO, type Ordenacao } from "@/lib/categorias/catalogo";
import type { Categoria, Produto } from "@/lib/categorias/tipos";
import CardProduto from "./CardProduto";

const BOTAO_FILTRO =
  "cursor-pointer rounded-full border border-roxo px-4 py-1.5 text-sm font-medium text-roxo transition-colors hover:bg-roxo/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roxo aria-pressed:bg-roxo aria-pressed:text-white";

type Props = {
  categoria: Categoria;
  produtos: Produto[];
};

export default function CatalogoCategoria({ categoria, produtos }: Props) {
  const [busca, setBusca] = useState("");
  const [subcategoriaSlug, setSubcategoriaSlug] = useState<string | null>(null);
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("padrao");

  const resultado = useMemo(
    () => filtrarEOrdenar(produtos, { busca, subcategoriaSlug, ordenacao }),
    [produtos, busca, subcategoriaSlug, ordenacao],
  );

  const haFiltrosAtivos = busca.trim() !== "" || subcategoriaSlug !== null || ordenacao !== "padrao";

  function limparFiltros() {
    setBusca("");
    setSubcategoriaSlug(null);
    setOrdenacao("padrao");
  }

  return (
    <section aria-labelledby="titulo-produtos" className="flex flex-col gap-6">
      <h2 id="titulo-produtos" className="sr-only">
        Produtos de {categoria.nome}
      </h2>

      <div className="flex flex-col gap-4">
        <div role="search" className="flex justify-center md:justify-end">
          <label htmlFor="busca-categoria" className="sr-only">
            Buscar nesta categoria
          </label>
          <input
            id="busca-categoria"
            type="search"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Procurar por..."
            className="w-full rounded-full bg-white px-5 py-2.5 text-sm text-preto placeholder:text-roxo/70 outline-none focus:ring-2 focus:ring-roxo md:max-w-md"
          />
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div role="group" aria-label="Subcategorias" className="flex flex-wrap gap-2">
            {categoria.subcategorias.map((subcategoria) => (
              <button
                key={subcategoria.slug}
                type="button"
                aria-pressed={subcategoriaSlug === subcategoria.slug}
                onClick={() =>
                  setSubcategoriaSlug((atual) => (atual === subcategoria.slug ? null : subcategoria.slug))
                }
                className={BOTAO_FILTRO}
              >
                {subcategoria.nome}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1 md:w-64">
            <label htmlFor="ordenacao" className="text-sm font-medium text-preto">
              Ordenar por
            </label>
            <select
              id="ordenacao"
              value={ordenacao}
              onChange={(evento) => setOrdenacao(evento.target.value as Ordenacao)}
              className="cursor-pointer rounded-full bg-white px-4 py-2.5 text-sm text-preto outline-none focus:ring-2 focus:ring-roxo"
            >
              {OPCOES_ORDENACAO.map((opcao) => (
                <option key={opcao.valor} value={opcao.valor}>
                  {opcao.rotulo}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="text-sm text-preto">
          {resultado.length === 1 ? "1 produto encontrado" : `${resultado.length} produtos encontrados`}
        </p>
        {haFiltrosAtivos && (
          <button
            type="button"
            onClick={limparFiltros}
            className="cursor-pointer rounded text-sm font-semibold text-roxo underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roxo"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {resultado.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white px-6 py-12 text-center">
          <p className="text-lg font-semibold text-preto">Nenhum produto encontrado</p>
          <p className="text-sm text-preto/80">Tente outra busca ou remova os filtros aplicados.</p>
          {haFiltrosAtivos && (
            <button
              type="button"
              onClick={limparFiltros}
              className="cursor-pointer rounded-full bg-roxo px-5 py-2 text-sm font-bold text-white hover:bg-[#5c2de0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roxo"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {resultado.map((produto) => (
            <li key={produto.id}>
              <CardProduto produto={produto} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
