"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import type {
  AvaliacaoLoja,
  ComentarioAvaliacao,
} from "@/lib/avaliacoes/tipos";

type Props = {
  nomeLoja: string;
  donoLojaId: number;
  avaliacoes: AvaliacaoLoja[];
  comentariosPorAvaliacao: Record<number, ComentarioAvaliacao[]>;
  mediaAvaliacoes: number | null;
  usuarioLogadoId: number | null;
  aoAdicionarAvaliacao: () => void;
  aoEditarAvaliacao: (avaliacao: AvaliacaoLoja) => void;
  aoEnviarComentario: (
    storeRatingId: number,
    conteudo: string
  ) => Promise<string | null>;
  aoEditarComentario: (comentario: ComentarioAvaliacao) => void;
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

function AvatarAutor({
  nome,
  fotoUrl,
  tamanho = "md",
}: {
  nome: string;
  fotoUrl?: string | null;
  tamanho?: "sm" | "md";
}) {
  const dim = tamanho === "sm" ? "h-9 w-9 text-sm" : "h-14 w-14 sm:h-16 sm:w-16 text-xl";
  return (
    <div
      className={`relative ${dim} shrink-0 rounded-full overflow-hidden bg-white border border-black/10 flex items-center justify-center font-bold text-[#6A38F3]`}
    >
      {fotoUrl ? (
        <Image
          src={fotoUrl}
          alt={`Foto de ${nome}`}
          fill
          unoptimized
          className="object-cover"
        />
      ) : (
        <span>{nome.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

function CardComentarioItem({
  comentario,
  donoLojaId,
  usuarioLogadoId,
  aoEditarComentario,
}: {
  comentario: ComentarioAvaliacao;
  donoLojaId: number;
  usuarioLogadoId: number | null;
  aoEditarComentario: (comentario: ComentarioAvaliacao) => void;
}) {
  const ehAutor = Boolean(
    usuarioLogadoId && usuarioLogadoId === comentario.user.id
  );
  const ehDonoLoja = comentario.user.id === donoLojaId;

  return (
    <div className="flex items-start gap-2.5">
      <AvatarAutor
        nome={comentario.user.name}
        fotoUrl={comentario.user.profilePictureUrl}
        tamanho="sm"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-black">
                {comentario.user.name}
              </span>
              {ehDonoLoja && (
                <span className="text-[11px] font-medium text-[#6A38F3]">
                  dona da loja
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs sm:text-sm font-light text-black/85 whitespace-pre-line break-words">
              {comentario.content}
            </p>
          </div>

          {ehAutor && (
            <button
              type="button"
              onClick={() => aoEditarComentario(comentario)}
              aria-label="Editar seu comentário"
              title="Editar comentário"
              className="shrink-0 rounded-full p-1 text-black/65 hover:bg-black/10 hover:text-black transition-colors cursor-pointer"
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

        {comentario.replies && comentario.replies.length > 0 && (
          <div className="mt-2 space-y-2 border-l-2 border-black/15 pl-3">
            {comentario.replies.map((reply) => (
              <CardComentarioItem
                key={reply.id}
                comentario={reply}
                donoLojaId={donoLojaId}
                usuarioLogadoId={usuarioLogadoId}
                aoEditarComentario={aoEditarComentario}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SecaoAvaliacoesLoja({
  nomeLoja,
  donoLojaId,
  avaliacoes,
  comentariosPorAvaliacao,
  mediaAvaliacoes,
  usuarioLogadoId,
  aoAdicionarAvaliacao,
  aoEditarAvaliacao,
  aoEnviarComentario,
  aoEditarComentario,
}: Props) {
  const [rascunhos, setRascunhos] = useState<Record<number, string>>({});
  const [enviandoId, setEnviandoId] = useState<number | null>(null);

  // O dono responde às avaliações, mas não avalia a própria loja (a API recusa).
  const ehDonoDaLoja = usuarioLogadoId === donoLojaId;

  const minhaAvaliacao = usuarioLogadoId
    ? avaliacoes.find((a) => a.userId === usuarioLogadoId) ?? null
    : null;

  async function handleEnviarComentario(e: React.FormEvent, storeRatingId: number) {
    e.preventDefault();
    const texto = (rascunhos[storeRatingId] ?? "").trim();
    if (!texto) {
      toast.error("Digite um comentário antes de enviar.");
      return;
    }

    setEnviandoId(storeRatingId);
    const erro = await aoEnviarComentario(storeRatingId, texto);
    setEnviandoId(null);

    if (erro) {
      toast.error(erro);
    } else {
      setRascunhos((prev) => ({ ...prev, [storeRatingId]: "" }));
    }
  }

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

        {!ehDonoDaLoja && (
          <div className="mt-6 w-full max-w-md flex justify-center">
            {usuarioLogadoId ? (
              <button
                type="button"
                onClick={() =>
                  minhaAvaliacao
                    ? aoEditarAvaliacao(minhaAvaliacao)
                    : aoAdicionarAvaliacao()
                }
                className="w-full rounded-full bg-[#6A38F3] hover:bg-[#5c2de0] px-8 py-2.5 text-base sm:text-lg font-normal text-white shadow-md transition-colors cursor-pointer"
              >
                {minhaAvaliacao ? "Editar minha Review" : "Adicionar Review"}
              </button>
            ) : (
              <Link
                href="/login"
                className="w-full text-center rounded-full bg-[#6A38F3] hover:bg-[#5c2de0] px-8 py-2.5 text-base sm:text-lg font-normal text-white shadow-md transition-colors"
              >
                Adicionar Review
              </Link>
            )}
          </div>
        )}

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
          <div className="mt-10 w-full flex gap-6 overflow-x-auto pb-4 items-start">
            {avaliacoes.map((avaliacao) => {
              const ehAutor = Boolean(
                usuarioLogadoId && usuarioLogadoId === avaliacao.userId
              );
              const comentarios = comentariosPorAvaliacao[avaliacao.id] ?? [];
              const textoRascunho = rascunhos[avaliacao.id] ?? "";
              const enviando = enviandoId === avaliacao.id;

              return (
                <article
                  key={avaliacao.id}
                  className="relative flex min-w-[310px] sm:min-w-[440px] max-w-xl flex-1 flex-col gap-4 rounded-[28px] bg-[#F6F3E4] p-5 sm:p-6 text-black shadow-md"
                >
                  <div className="flex gap-4">
                    <AvatarAutor
                      nome={avaliacao.user.name}
                      fotoUrl={avaliacao.user.profilePictureUrl}
                    />

                    <div className="flex flex-1 flex-col justify-between gap-2 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-lg font-medium text-black leading-tight truncate">
                            {avaliacao.user.name}
                          </h3>
                          {avaliacao.user.username && (
                            <span className="text-xs text-black/50">
                              @{avaliacao.user.username}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
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

                      <p className="text-sm font-light text-black/85 whitespace-pre-line break-words">
                        {avaliacao.comment || "Avaliação sem comentário."}
                      </p>
                    </div>
                  </div>

                  {/* Respostas / Comentários na avaliação */}
                  {(comentarios.length > 0 || usuarioLogadoId) && (
                    <div className="border-t border-black/10 pt-3 space-y-3">
                      {comentarios.length > 0 && (
                        <div className="space-y-2.5 border-l-2 border-black/20 pl-3">
                          {comentarios.map((comentario) => (
                            <CardComentarioItem
                              key={comentario.id}
                              comentario={comentario}
                              donoLojaId={donoLojaId}
                              usuarioLogadoId={usuarioLogadoId}
                              aoEditarComentario={aoEditarComentario}
                            />
                          ))}
                        </div>
                      )}

                      {usuarioLogadoId && (
                        <form
                          onSubmit={(e) => handleEnviarComentario(e, avaliacao.id)}
                          className="space-y-1"
                        >
                          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 shadow-xs border border-black/10 focus-within:ring-2 focus-within:ring-[#6A38F3]">
                            <label
                              htmlFor={`novo-comentario-${avaliacao.id}`}
                              className="sr-only"
                            >
                              Adicionar comentário
                            </label>
                            <input
                              id={`novo-comentario-${avaliacao.id}`}
                              type="text"
                              value={textoRascunho}
                              onChange={(e) => {
                                setRascunhos((prev) => ({
                                  ...prev,
                                  [avaliacao.id]: e.target.value,
                                }));
                              }}
                              disabled={enviando}
                              maxLength={2000}
                              placeholder="Adicionar comentário"
                              className="flex-1 bg-transparent text-xs sm:text-sm text-black placeholder:text-gray-400 outline-none"
                            />
                            <button
                              type="submit"
                              disabled={enviando}
                              aria-label="Enviar comentário"
                              title="Enviar comentário"
                              className="rounded-full p-1.5 text-black/60 hover:text-[#6A38F3] transition-colors cursor-pointer disabled:opacity-40"
                            >
                              <svg
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                              </svg>
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
