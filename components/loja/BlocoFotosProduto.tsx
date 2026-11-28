"use client";

import React from "react";
import Image from "next/image";

export const MAX_FOTOS_PRODUTO = 3;
export const URL_PRODUTO_REGEX = /^https?:\/\/.+/i;

export type ImagemProdutoRascunho = {
  id?: number;
  imageUrl: string;
};

export function parsearPreco(texto: string): number {
  const limpo = texto.replace(/[^\d.,]/g, "").replace(",", ".");
  const parsed = Number(limpo);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : Number.NaN;
}

/** Valida uma nova URL de foto antes de adicioná-la ao rascunho. */
export function validarNovaImagemProduto(
  novaUrl: string,
  totalAtual: number
): { erro?: string; urlLimpa?: string } {
  const limpa = novaUrl.trim();
  if (!limpa) return {};
  if (totalAtual >= MAX_FOTOS_PRODUTO) {
    return {
      erro: `Você pode anexar no máximo ${MAX_FOTOS_PRODUTO} fotos por produto.`,
    };
  }
  if (!URL_PRODUTO_REGEX.test(limpa) || limpa.length > 255) {
    return {
      erro: "Informe uma URL válida (http:// ou https://) com até 255 caracteres.",
    };
  }
  return { urlLimpa: limpa };
}

/** Validação compartilhada entre criação e edição de produto. */
export function validarCamposProduto(dados: {
  nome: string;
  categoriaId: number;
  descricao: string;
  precoTexto: string;
  estoque: number;
  novaUrlImagem: string;
  mensagemCategoria?: string;
}): { erros: Record<string, string>; precoNumero: number } {
  const erros: Record<string, string> = {};
  const nomeTrim = dados.nome.trim();
  if (!nomeTrim) erros.name = "O nome do produto é obrigatório.";
  else if (nomeTrim.length > 255) {
    erros.name = "O nome não pode exceder 255 caracteres.";
  }

  if (!dados.categoriaId || Number.isNaN(dados.categoriaId)) {
    erros.categoryId = dados.mensagemCategoria || "Selecione uma categoria válida.";
  }

  if (dados.descricao && dados.descricao.length > 5000) {
    erros.description = "A descrição não pode ter mais de 5000 caracteres.";
  }

  const precoNumero = parsearPreco(dados.precoTexto);
  if (Number.isNaN(precoNumero) || precoNumero < 0 || precoNumero > 999999.99) {
    erros.price = "Informe um preço válido entre R$ 0,00 e R$ 999.999,99.";
  }

  if (!Number.isInteger(dados.estoque) || dados.estoque < 0 || dados.estoque > 2147483647) {
    erros.stock = "Informe uma quantidade de estoque válida (0 ou maior).";
  }

  if (dados.novaUrlImagem.trim()) {
    erros.images =
      'Clique em "Adicionar" para incluir a URL digitada ou limpe o campo.';
  }

  return { erros, precoNumero };
}

type BlocoFotosProdutoProps = {
  inputId: string;
  imagens: ImagemProdutoRascunho[];
  novaUrlImagem: string;
  erro?: string;
  ocupado: boolean;
  onChangeNovaUrl: (valor: string) => void;
  onAdicionarImagem: () => void;
  onRemoverImagem: (indice: number) => void;
};

/** Bloco tracejado para anexar URLs de fotos de produto e visualizar até 3 slots. */
export function BlocoFotosProduto({
  inputId,
  imagens,
  novaUrlImagem,
  erro,
  ocupado,
  onChangeNovaUrl,
  onAdicionarImagem,
  onRemoverImagem,
}: BlocoFotosProdutoProps) {
  return (
    <div className="space-y-3">
      <div
        className={`rounded-[10px] border-2 border-dashed bg-white/80 p-4 transition-colors ${
          erro ? "border-red-500 bg-red-50/40" : "border-[#6A38F3]"
        }`}
      >
        <div className="flex flex-col items-center text-center gap-1.5 mb-3">
          <svg
            className="h-7 w-7 text-[#6A38F3]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <label htmlFor={inputId} className="text-sm font-medium text-black">
            Anexe as fotos do seu produto ({imagens.length}/{MAX_FOTOS_PRODUTO})
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            id={inputId}
            type="url"
            value={novaUrlImagem}
            onChange={(e) => onChangeNovaUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAdicionarImagem();
              }
            }}
            disabled={ocupado || imagens.length >= MAX_FOTOS_PRODUTO}
            placeholder={
              imagens.length >= MAX_FOTOS_PRODUTO
                ? `Limite de ${MAX_FOTOS_PRODUTO} fotos atingido`
                : "https://exemplo.com/foto-produto.png"
            }
            className="flex-1 rounded-full bg-white px-4 py-2 text-xs text-[#171a17] shadow-xs outline-none border border-black/15 transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-[#6A38F3] disabled:opacity-60"
          />
          <button
            type="button"
            onClick={onAdicionarImagem}
            disabled={
              ocupado ||
              imagens.length >= MAX_FOTOS_PRODUTO ||
              !novaUrlImagem.trim()
            }
            className="shrink-0 rounded-full bg-[#6A38F3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#5c2de0] transition-colors cursor-pointer disabled:opacity-50"
          >
            Adicionar
          </button>
        </div>
        {erro && <p className="text-xs font-semibold text-red-600 px-2 mt-1.5">{erro}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: MAX_FOTOS_PRODUTO }).map((_, indice) => {
          const item = imagens[indice];
          return (
            <div
              key={indice}
              className="relative aspect-square rounded-[10px] border-2 border-dashed border-[#6A38F3]/50 bg-white/80 overflow-hidden flex items-center justify-center shadow-xs"
            >
              {item ? (
                <>
                  <Image
                    src={item.imageUrl}
                    alt={`Foto ${indice + 1} do produto`}
                    fill
                    unoptimized
                    className="object-contain p-1.5"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoverImagem(indice)}
                    disabled={ocupado}
                    aria-label={`Remover foto ${indice + 1}`}
                    title="Remover foto"
                    className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/70 text-white text-xs font-bold flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <svg
                  className="h-7 w-7 text-[#6A38F3]/75"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type StepperEstoqueProps = {
  estoque: number;
  erro?: string;
  ocupado: boolean;
  onChange: (novoEstoque: number) => void;
};

/** Seletor de estoque com botões circulares - / + conforme protótipo do Figma. */
export function StepperEstoqueProduto({
  estoque,
  erro,
  ocupado,
  onChange,
}: StepperEstoqueProps) {
  return (
    <div className="flex flex-col items-center gap-1 pt-2">
      <span className="text-xs font-semibold text-black/70">Quantidade em estoque</span>
      <div className="flex items-center justify-center gap-8 py-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, estoque - 1))}
          disabled={ocupado || estoque <= 0}
          aria-label="Diminuir estoque"
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#6A38F3] text-2xl font-bold text-[#6A38F3] hover:bg-[#6A38F3] hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
        >
          −
        </button>

        <input
          aria-label="Quantidade em estoque"
          type="number"
          min={0}
          max={2147483647}
          value={estoque}
          onChange={(e) => {
            const val = Number.parseInt(e.target.value, 10);
            onChange(Number.isNaN(val) ? 0 : Math.max(0, val));
          }}
          disabled={ocupado}
          className="w-24 text-center text-4xl font-normal text-[#6A38F3] bg-transparent outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />

        <button
          type="button"
          onClick={() => onChange(estoque + 1)}
          disabled={ocupado}
          aria-label="Aumentar estoque"
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#6A38F3] text-2xl font-bold text-[#6A38F3] hover:bg-[#6A38F3] hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
        >
          +
        </button>
      </div>
      {erro && <p className="text-xs font-semibold text-red-600">{erro}</p>}
    </div>
  );
}
