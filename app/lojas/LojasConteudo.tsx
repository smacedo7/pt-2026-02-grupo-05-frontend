"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import BarraBusca from "@/components/home/BarraBusca";
import type { EstadoListaCategorias } from "@/components/home/categorias";
import FaixaCategoriasLojas from "@/components/lojas/FaixaCategoriasLojas";
import CardLoja, { CardLojaSkeleton } from "@/components/lojas/CardLoja";
import MenuFiltrosLojas from "@/components/lojas/MenuFiltrosLojas";
import {
  filtrarEOrdenarLojas,
  montarOpcoesCategoriasFiltro,
  prepararCategoriasRaizLojas,
  type OrdenacaoLojas,
} from "@/lib/lojas/catalogo";
import { listarTodasCategorias, listarTodasLojas } from "@/lib/lojas/lojasApi";
import type { CategoriaResumo, Loja } from "@/lib/lojas/tipos";

type EstadoLojas =
  | { status: "carregando" }
  | { status: "ok"; lojas: Loja[] }
  | { status: "erro"; mensagem: string };

const MENSAGEM_CONEXAO =
  "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
const MENSAGEM_ERRO_CATEGORIAS = "Não foi possível carregar as categorias.";

export default function LojasConteudo() {
  const buscaRef = useRef<HTMLInputElement>(null);
  const listaRef = useRef<HTMLElement>(null);

  const [textoBusca, setTextoBusca] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [ordenacao, setOrdenacao] = useState<OrdenacaoLojas>("nome-asc");
  const [tentativa, setTentativa] = useState(0);

  const [estadoLojas, setEstadoLojas] = useState<EstadoLojas>({
    status: "carregando",
  });
  const [categoriasApi, setCategoriasApi] = useState<CategoriaResumo[]>([]);
  const [estadoCategorias, setEstadoCategorias] =
    useState<EstadoListaCategorias>({ status: "carregando" });

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      const [resLojas, resCategorias] = await Promise.all([
        listarTodasLojas(),
        listarTodasCategorias(),
      ]);

      if (cancelado) return;

      if (resCategorias.tipo === "sucesso") {
        setCategoriasApi(resCategorias.categorias);
        setEstadoCategorias({
          status: "ok",
          categorias: prepararCategoriasRaizLojas(resCategorias.categorias),
        });
      } else {
        setCategoriasApi([]);
        setEstadoCategorias({
          status: "erro",
          mensagem:
            resCategorias.tipo === "conexao"
              ? MENSAGEM_CONEXAO
              : MENSAGEM_ERRO_CATEGORIAS,
        });
      }

      if (resLojas.tipo === "sucesso") {
        setEstadoLojas({ status: "ok", lojas: resLojas.lojas });
      } else {
        setEstadoLojas({
          status: "erro",
          mensagem:
            resLojas.tipo === "conexao" ? MENSAGEM_CONEXAO : resLojas.mensagem,
        });
      }
    }

    carregar();

    return () => {
      cancelado = true;
    };
  }, [tentativa]);

  const tentarNovamente = () => {
    setEstadoLojas({ status: "carregando" });
    setEstadoCategorias({ status: "carregando" });
    setTentativa((anterior) => anterior + 1);
  };

  const mapaCategoriasPorId = useMemo(() => {
    const mapa = new Map<number, string>();
    for (const cat of categoriasApi) {
      mapa.set(cat.id, cat.name);
    }
    return mapa;
  }, [categoriasApi]);

  const opcoesCategoriasFiltro = useMemo(
    () => montarOpcoesCategoriasFiltro(categoriasApi),
    [categoriasApi],
  );

  const lojasFiltradas = useMemo(() => {
    if (estadoLojas.status !== "ok") return [];
    return filtrarEOrdenarLojas(estadoLojas.lojas, categoriasApi, {
      busca: textoBusca,
      categoriaId,
      ordenacao,
    });
  }, [estadoLojas, categoriasApi, textoBusca, categoriaId, ordenacao]);

  const haFiltrosAtivos =
    textoBusca.trim() !== "" ||
    categoriaId !== null ||
    ordenacao !== "nome-asc";

  const limparFiltros = () => {
    setTextoBusca("");
    setCategoriaId(null);
    setOrdenacao("nome-asc");
  };

  const limparBusca = () => {
    setTextoBusca("");
    buscaRef.current?.focus();
  };

  const rolarParaLojas = () => {
    listaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[#fcf9f2] font-sans text-preto">
      <Navbar />

      <FaixaCategoriasLojas
        lista={estadoCategorias}
        aoTentarNovamente={tentarNovamente}
      />

      <section
        ref={listaRef}
        aria-labelledby="titulo-lojas"
        className="flex-1 bg-[#fcf9f2] pb-20 pt-8 scroll-mt-6"
      >
        <div className="mx-auto max-w-7xl px-6">
          <BarraBusca
            valor={textoBusca}
            aoMudar={setTextoBusca}
            aoEnviar={rolarParaLojas}
            aoLimpar={limparBusca}
            inputRef={buscaRef}
            ariaLabel="Buscar lojas"
            className="mb-5 flex justify-end"
          />

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1
              id="titulo-lojas"
              className="font-sans text-2xl font-bold text-black md:text-[32px]"
            >
              Lojas
            </h1>

            <MenuFiltrosLojas
              opcoesCategorias={opcoesCategoriasFiltro}
              categoriaId={categoriaId}
              ordenacao={ordenacao}
              aoMudarCategoria={setCategoriaId}
              aoMudarOrdenacao={setOrdenacao}
              aoLimparFiltros={() => {
                setCategoriaId(null);
                setOrdenacao("nome-asc");
              }}
            />
          </div>

          {estadoLojas.status === "ok" && estadoLojas.lojas.length > 0 && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <p role="status" aria-live="polite" className="text-sm text-gray-600">
                {lojasFiltradas.length === 1
                  ? "1 loja encontrada"
                  : `${lojasFiltradas.length} lojas encontradas`}
              </p>

              {haFiltrosAtivos && (
                <button
                  type="button"
                  onClick={limparFiltros}
                  className="cursor-pointer rounded text-sm font-semibold text-[#6a38ff] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff]"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}

          {estadoLojas.status === "carregando" && (
            <div aria-busy="true">
              <p role="status" className="sr-only">
                Carregando lojas...
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {Array.from({ length: 10 }).map((_, indice) => (
                  <CardLojaSkeleton key={`skeleton-loja-${indice}`} />
                ))}
              </div>
            </div>
          )}

          {estadoLojas.status === "erro" && (
            <div
              role="alert"
              className="flex flex-col items-center gap-4 rounded-3xl bg-white px-6 py-12 text-center shadow-sm"
            >
              <p className="text-base font-medium text-red-600">
                {estadoLojas.mensagem}
              </p>
              <button
                type="button"
                onClick={tentarNovamente}
                className="cursor-pointer rounded-full bg-roxo px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#5c2de0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff] focus-visible:ring-offset-2"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {estadoLojas.status === "ok" && estadoLojas.lojas.length === 0 && (
            <div
              role="status"
              className="rounded-3xl bg-white px-6 py-12 text-center shadow-sm"
            >
              <p className="text-lg font-semibold text-preto">
                Nenhuma loja cadastrada ainda.
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Quando novas lojas forem criadas, elas aparecerão aqui.
              </p>
            </div>
          )}

          {estadoLojas.status === "ok" &&
            estadoLojas.lojas.length > 0 &&
            lojasFiltradas.length === 0 && (
              <div
                role="status"
                className="flex flex-col items-center gap-3 rounded-3xl bg-white px-6 py-12 text-center shadow-sm"
              >
                <p className="text-lg font-semibold text-preto">
                  Nenhuma loja encontrada
                </p>
                <p className="text-sm text-gray-600">
                  Tente outro nome ou remova os filtros aplicados.
                </p>
                <button
                  type="button"
                  onClick={limparFiltros}
                  className="cursor-pointer rounded-full bg-roxo px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#5c2de0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff] focus-visible:ring-offset-2"
                >
                  Limpar filtros
                </button>
              </div>
            )}

          {estadoLojas.status === "ok" && lojasFiltradas.length > 0 && (
            <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {lojasFiltradas.map((loja) => (
                <li key={loja.id}>
                  <CardLoja
                    loja={loja}
                    categoriaNome={
                      loja.category?.name ??
                      mapaCategoriasPorId.get(loja.categoryId)
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
