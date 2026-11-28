"use client";

import React from "react";
import Image from "next/image";

export const URL_IMAGEM_REGEX = /^https?:\/\/.+/i;

/** Validação compartilhada entre ModalCriarLoja e ModalEditarLoja. */
export function validarCamposLoja(dados: {
  nome: string;
  categoriaId: number;
  descricao?: string;
  logoUrl: string;
  stickerUrl: string;
  bannerUrl: string;
}): Record<string, string> {
  const erros: Record<string, string> = {};
  const nomeTrim = dados.nome.trim();
  if (!nomeTrim) erros.name = "O nome da loja é obrigatório.";
  else if (nomeTrim.length > 255) erros.name = "O nome não pode exceder 255 caracteres.";

  if (!dados.categoriaId || Number.isNaN(dados.categoriaId)) {
    erros.categoryId = "Selecione uma categoria válida.";
  }

  if (dados.descricao && dados.descricao.length > 5000) {
    erros.description = "A descrição não pode ter mais de 5000 caracteres.";
  }

  const midias: Array<{ chave: string; valor: string; rotulo: string }> = [
    { chave: "logoUrl", valor: dados.logoUrl, rotulo: "foto de perfil" },
    { chave: "stickerUrl", valor: dados.stickerUrl, rotulo: "logo/selo" },
    { chave: "bannerUrl", valor: dados.bannerUrl, rotulo: "banner" },
  ];

  for (const item of midias) {
    const limpo = item.valor.trim();
    if (limpo && !URL_IMAGEM_REGEX.test(limpo)) {
      erros[item.chave] =
        "Informe uma URL válida (http:// ou https://) ou deixe em branco.";
    } else if (limpo.length > 255) {
      erros[item.chave] =
        `A URL de ${item.rotulo} não pode ter mais de 255 caracteres.`;
    }
  }

  return erros;
}

type CampoMidiaLojaProps = {
  id: string;
  titulo: string;
  placeholder: string;
  valor: string;
  erro?: string;
  desabilitado: boolean;
  previewTipo: "avatar" | "banner" | "selo";
  onChange: (novoValor: string) => void;
};

/** Campo de URL de mídia com borda tracejada roxa e prévia visual, compartilhado entre criação e edição de loja. */
export function CampoMidiaLoja({
  id,
  titulo,
  placeholder,
  valor,
  erro,
  desabilitado,
  previewTipo,
  onChange,
}: CampoMidiaLojaProps) {
  const urlValida = Boolean(valor.trim() && URL_IMAGEM_REGEX.test(valor.trim()));

  return (
    <div
      className={`rounded-[10px] border-2 border-dashed bg-white/80 p-4 transition-colors ${
        erro ? "border-red-500 bg-red-50/40" : "border-[#6A38F3]"
      }`}
    >
      <div className="flex flex-col items-center text-center gap-2 mb-3">
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
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <label htmlFor={id} className="text-sm font-medium text-black cursor-pointer">
          {titulo}
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          id={id}
          type="url"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          disabled={desabilitado}
          placeholder={placeholder}
          className={`flex-1 rounded-full bg-white px-4 py-2 text-xs text-[#171a17] shadow-xs outline-none border transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-[#6A38F3] ${
            erro ? "border-red-500 ring-2 ring-red-500/30" : "border-black/15"
          }`}
        />
        {valor && (
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={desabilitado}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            Remover
          </button>
        )}
      </div>

      {erro && <p className="text-xs font-semibold text-red-600 px-2 mt-1.5">{erro}</p>}

      {urlValida && (
        <div
          className={
            previewTipo === "banner"
              ? "space-y-1 pt-3"
              : "flex items-center justify-center gap-3 pt-3"
          }
        >
          <span className="text-xs text-gray-500 block text-center">
            {previewTipo === "banner" ? "Prévia do banner:" : "Prévia:"}
          </span>
          <div
            className={
              previewTipo === "avatar"
                ? "relative h-12 w-12 rounded-full overflow-hidden border-2 border-[#6A38F3] shadow-sm bg-gray-100"
                : previewTipo === "selo"
                  ? "relative h-11 w-11 rounded-lg overflow-hidden border border-black/15 shadow-sm bg-white p-1"
                  : "relative h-20 w-full rounded-xl overflow-hidden border border-black/15 shadow-sm bg-gray-100"
            }
          >
            <Image
              src={valor.trim()}
              alt={`Prévia (${previewTipo})`}
              fill
              unoptimized
              className={previewTipo === "selo" ? "object-contain" : "object-cover"}
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
