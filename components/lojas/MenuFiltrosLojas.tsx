"use client";

import { useEffect, useRef, useState } from "react";
import {
  OPCOES_ORDENACAO_LOJAS,
  type OpcaoCategoriaFiltro,
  type OrdenacaoLojas,
} from "@/lib/lojas/catalogo";

type Props = {
  opcoesCategorias: OpcaoCategoriaFiltro[];
  categoriaId: number | null;
  ordenacao: OrdenacaoLojas;
  aoMudarCategoria: (categoriaId: number | null) => void;
  aoMudarOrdenacao: (ordenacao: OrdenacaoLojas) => void;
  aoLimparFiltros: () => void;
};

/** Dropdown de filtros (categoria e ordenação) suportados pela API de lojas. */
export default function MenuFiltrosLojas({
  opcoesCategorias,
  categoriaId,
  ordenacao,
  aoMudarCategoria,
  aoMudarOrdenacao,
  aoLimparFiltros,
}: Props) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;

    function aoClicarFora(evento: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(evento.target as Node)
      ) {
        setAberto(false);
      }
    }

    function aoPressionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setAberto(false);
      }
    }

    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoPressionarTecla);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoPressionarTecla);
    };
  }, [aberto]);

  const categoriaSelecionada =
    categoriaId !== null
      ? opcoesCategorias.find((item) => item.id === categoriaId)
      : undefined;

  const totalAtivos =
    (categoriaId !== null ? 1 : 0) + (ordenacao !== "nome-asc" ? 1 : 0);

  const resumoBotao = categoriaSelecionada
    ? `filtros: ${categoriaSelecionada.rotulo.replace(/^—\s+/, "")}`
    : "filtros";

  return (
    <div ref={containerRef} className="relative w-full sm:w-[500px]">
      <button
        type="button"
        aria-expanded={aberto}
        aria-controls="painel-filtros-lojas"
        onClick={() => setAberto((anterior) => !anterior)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-full border border-gray-100 bg-white px-5 py-2.5 text-left text-sm shadow-sm transition-colors hover:border-[#6a38ff]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff]"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={
              totalAtivos > 0
                ? "truncate font-medium text-[#6a38ff]"
                : "truncate italic text-[#6a38ff]/70"
            }
          >
            {resumoBotao}
          </span>
          {totalAtivos > 0 && (
            <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#6a38ff] px-1.5 text-xs font-bold text-white">
              {totalAtivos}
            </span>
          )}
        </span>

        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 shrink-0 text-[#6a38ff]/70 transition-transform ${
            aberto ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {aberto && (
        <div
          id="painel-filtros-lojas"
          role="region"
          aria-label="Filtros de lojas"
          className="absolute right-0 z-30 mt-2 w-full rounded-3xl border border-gray-100 bg-white p-5 shadow-lg"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="filtro-categoria-lojas"
                className="text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Categoria
              </label>
              <select
                id="filtro-categoria-lojas"
                value={categoriaId ?? ""}
                onChange={(evento) => {
                  const valor = evento.target.value;
                  aoMudarCategoria(valor === "" ? null : Number(valor));
                }}
                className="w-full cursor-pointer rounded-full border border-gray-200 bg-[#fcf9f2] px-4 py-2 text-sm text-preto outline-none focus:border-[#6a38ff] focus:ring-2 focus:ring-[#6a38ff]/30"
              >
                <option value="">Todas as categorias</option>
                {opcoesCategorias.map((opcao) => (
                  <option key={opcao.id} value={opcao.id}>
                    {opcao.rotulo}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="ordenacao-lojas"
                className="text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Ordenar por
              </label>
              <select
                id="ordenacao-lojas"
                value={ordenacao}
                onChange={(evento) =>
                  aoMudarOrdenacao(evento.target.value as OrdenacaoLojas)
                }
                className="w-full cursor-pointer rounded-full border border-gray-200 bg-[#fcf9f2] px-4 py-2 text-sm text-preto outline-none focus:border-[#6a38ff] focus:ring-2 focus:ring-[#6a38ff]/30"
              >
                {OPCOES_ORDENACAO_LOJAS.map((opcao) => (
                  <option key={opcao.valor} value={opcao.valor}>
                    {opcao.rotulo}
                  </option>
                ))}
              </select>
            </div>

            {totalAtivos > 0 && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    aoLimparFiltros();
                    setAberto(false);
                  }}
                  className="cursor-pointer rounded text-xs font-semibold text-[#6a38ff] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff]"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
