"use client";

import React from "react";
import Image from "next/image";
import type { AvaliacaoLoja } from "@/lib/avaliacoes/tipos";

type Props = {
  nomeLoja: string;
  avaliacoes: AvaliacaoLoja[];
  mediaAvaliacoes: number | null;
  usuarioLogadoId: number | null;
  aoEditarAvaliacao: (avaliacao: AvaliacaoLoja) => void;
};

function EstrelasExibicao({
  nota,
  tamanho = "md",
}: {
  nota: number;
  tamanho?: "sm" | "md";
}) {
  const classeTamanho = tamanho === "sm" ? "h-4 w-4" : "h-6 w-6";
  return (
    <div className="flex items-center justify-center gap-1" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => {
        const preenchida = i + 1 <= Math.round(nota);
        return (
          <svg
            key={i}
            className={`${classeTamanho} ${
              preenchida
                ? "text-[#C6E700] fill-[#C6E700]"
                : "text-[#C6E700]/40 fill-transparent"
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
    </div>
  );
}

export default function SecaoAvaliacoesLoja({
  nomeLoja,
  avaliacoes,
  mediaAvaliacoes,
  usuarioLogadoId,
  aoEditarAvaliacao,
}: Props) {
  return (
    <section className="w-full bg-[#000000] text-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-center tracking-tight">
          Reviews e Comentários
        </h2>

        <div className="mt-6 flex flex-col items-center gap-2">
          <span className="text-5xl sm:text-6xl font-normal text-white tabular-nums">
            {mediaAvaliacoes !== null ? mediaAvaliacoes.toFixed(2) : "--"}
          </span>
          <EstrelasExibicao nota={mediaAvaliacoes ?? 0} />
        </div>

        {avaliacoes.length === 0 ? (
          <div className="mt-10 w-full rounded-[28px] bg-[#F6F3E4] px-6 py-10 text-center text-black shadow-md">
            <p className="text-base sm:text-lg font-medium text-black/80">
              Nenhuma avaliação publicada para {nomeLoja} ainda.
            </p>
            <p className="mt-1 text-xs sm:text-sm text-black/60">
              Quando houver avaliações para esta loja, os comentários aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="mt-10 w-full flex gap-6 overflow-x-auto pb-4">
            {avaliacoes.map((avaliacao) => {
              const ehAutor = Boolean(
                usuarioLogadoId && usuarioLogadoId === avaliacao.userId
              );
              return (
                <article
                  key={avaliacao.id}
                  className="relative flex min-w-[300px] sm:min-w-[420px] max-w-xl flex-1 gap-4 rounded-[28px] bg-[#F6F3E4] p-5 sm:p-6 text-black shadow-md"
                >
                  <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-full overflow-hidden bg-white border border-black/10 flex items-center justify-center text-xl font-bold text-[#6A38F3]">
                    {avaliacao.user.profilePictureUrl ? (
                      <Image
                        src={avaliacao.user.profilePictureUrl}
                        alt={`Foto de ${avaliacao.user.name}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <span>{avaliacao.user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-medium text-black leading-tight">
                          {avaliacao.user.name}
                        </h3>
                        <span className="text-xs text-black/50">
                          @{avaliacao.user.username}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <EstrelasExibicao nota={avaliacao.rating} tamanho="sm" />
                        {ehAutor && (
                          <button
                            type="button"
                            onClick={() => aoEditarAvaliacao(avaliacao)}
                            aria-label="Editar sua avaliação"
                            title="Editar sua avaliação"
                            className="rounded-full bg-[#6A38F3] p-1.5 text-white hover:bg-[#5c2de0] transition-colors cursor-pointer"
                          >
                            <svg
                              className="h-3.5 w-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              aria-hidden="true"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm font-light text-black/85 whitespace-pre-line">
                      {avaliacao.comment || "Avaliação sem comentário."}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
