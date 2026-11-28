"use client";

import React, { useState } from "react";

type Props = {
  nota: number | null;
  ocupado: boolean;
  aoSelecionar: (novaNota: number) => void;
  tamanho?: "md" | "lg";
  textoVazio?: string;
};

/** Seletor interativo de 0 a 5 estrelas compartilhado entre criação e edição de avaliação. */
export default function SeletorEstrelasAvaliacao({
  nota,
  ocupado,
  aoSelecionar,
  tamanho = "lg",
  textoVazio = "Clique nas estrelas para escolher uma nota",
}: Props) {
  const [notaHover, setNotaHover] = useState<number | null>(null);
  const notaExibida = notaHover ?? nota ?? 0;
  const classeTamanho =
    tamanho === "lg" ? "h-11 w-11 sm:h-14 sm:w-14" : "h-10 w-10 sm:h-12 sm:w-12";

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        role="radiogroup"
        aria-label="Nota da avaliação em estrelas"
        className="flex items-center gap-3 sm:gap-4"
        onMouseLeave={() => setNotaHover(null)}
      >
        {[1, 2, 3, 4, 5].map((estrela) => {
          const ativa = estrela <= notaExibida;
          return (
            <button
              key={estrela}
              type="button"
              role="radio"
              aria-checked={nota === estrela}
              aria-label={`${estrela} ${estrela === 1 ? "estrela" : "estrelas"}`}
              onClick={() => aoSelecionar(estrela)}
              onMouseEnter={() => setNotaHover(estrela)}
              disabled={ocupado}
              className="p-1 transition-transform hover:scale-110 cursor-pointer disabled:opacity-50"
            >
              <svg
                className={`${classeTamanho} transition-colors ${
                  ativa
                    ? "text-[#C6E700] fill-[#C6E700] drop-shadow-xs"
                    : "text-[#6A38F3]/70 fill-transparent"
                }`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={tamanho === "lg" ? 1.3 : 1.4}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3 text-xs font-medium text-black/60">
        <span>
          {nota === null ? textoVazio : `Nota selecionada: ${nota} de 5`}
        </span>
        {nota !== 0 && (
          <button
            type="button"
            onClick={() => aoSelecionar(0)}
            disabled={ocupado}
            className="text-[#6A38F3] hover:underline cursor-pointer"
          >
            (0 estrelas)
          </button>
        )}
      </div>
    </div>
  );
}
