"use client";

import React, { useCallback, useEffect } from "react";

type ModalBaseProps = {
  aberto?: boolean;
  ocupado?: boolean;
  tituloId: string;
  titulo?: string;
  subtitulo?: string;
  tituloApenasLeitor?: boolean;
  largura?: "lg" | "2xl";
  aoVoltar?: () => void;
  aoFechar: () => void;
  children: React.ReactNode;
};

export function ModalBase({
  aberto = true,
  ocupado = false,
  tituloId,
  titulo,
  subtitulo,
  tituloApenasLeitor = false,
  largura = "2xl",
  aoVoltar,
  aoFechar,
  children,
}: ModalBaseProps) {
  const tratarKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !ocupado) {
        aoFechar();
      }
    },
    [aoFechar, ocupado]
  );

  useEffect(() => {
    if (!aberto) return;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", tratarKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", tratarKeyDown);
    };
  }, [aberto, tratarKeyDown]);

  if (!aberto) return null;

  const classeLargura = largura === "lg" ? "max-w-lg" : "max-w-2xl";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !ocupado) {
          aoFechar();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={tituloId}
    >
      <div
        className={`relative w-full ${classeLargura} my-auto rounded-[29px] bg-[#EDEDED] text-[#000000] shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[92vh]`}
      >
        {/* Barra superior de controle (voltar opcional + título opcional + fechar) */}
        <div className="relative flex items-center justify-center px-6 pt-7 pb-2 shrink-0">
          {aoVoltar && (
            <button
              type="button"
              onClick={aoVoltar}
              disabled={ocupado}
              aria-label="Voltar"
              className="absolute left-5 top-5 rounded-full p-2 text-black/70 hover:bg-black/10 hover:text-black transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {titulo && (
            <div className={tituloApenasLeitor ? "sr-only" : "text-center px-10"}>
              <h2
                id={tituloId}
                className="text-2xl sm:text-3xl font-normal tracking-tight text-black"
              >
                {titulo}
              </h2>
              {subtitulo && (
                <p className="mt-1 text-base font-medium text-[#6A38F3]">
                  {subtitulo}
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={aoFechar}
            disabled={ocupado}
            aria-label="Fechar modal"
            className="absolute right-5 top-5 rounded-full p-2 text-black/70 hover:bg-black/10 hover:text-black transition-colors focus-visible:outline-2 focus-visible:outline-[#6A38F3] disabled:opacity-50 cursor-pointer"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 sm:px-10 pb-8 pt-2">
          {children}
        </div>
      </div>
    </div>
  );
}

type BotaoDeletarConfirmacaoProps = {
  idDialogo: string;
  rotuloBotao?: string;
  textoConfirmacao: string;
  confirmando: boolean;
  ocupado: boolean;
  deletando: boolean;
  textoDeletando?: string;
  variante?: "filled" | "outline";
  aoIniciarConfirmacao: () => void;
  aoCancelar: () => void;
  aoConfirmar: () => void;
};

export function BotaoDeletarConfirmacao({
  idDialogo,
  rotuloBotao = "DELETAR",
  textoConfirmacao,
  confirmando,
  ocupado,
  deletando,
  textoDeletando = "Deletando...",
  variante = "filled",
  aoIniciarConfirmacao,
  aoCancelar,
  aoConfirmar,
}: BotaoDeletarConfirmacaoProps) {
  if (!confirmando) {
    const classeBotao =
      variante === "outline"
        ? "w-full rounded-full border border-[#AF052A] bg-white/80 hover:bg-[#AF052A] text-[#AF052A] hover:text-white py-2.5 text-base font-normal shadow-sm transition-colors cursor-pointer disabled:opacity-50"
        : "w-full rounded-full bg-[#FF0000] hover:bg-[#d90000] py-3 text-base font-medium uppercase tracking-wide text-white shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#FF0000] disabled:opacity-50 cursor-pointer";

    return (
      <button
        type="button"
        onClick={aoIniciarConfirmacao}
        disabled={ocupado}
        className={classeBotao}
      >
        {rotuloBotao}
      </button>
    );
  }

  return (
    <div
      role="alertdialog"
      aria-labelledby={idDialogo}
      className="rounded-2xl border border-red-300 bg-red-50 p-4 text-center space-y-3"
    >
      <p id={idDialogo} className="text-xs sm:text-sm font-semibold text-red-900">
        {textoConfirmacao}
      </p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <button
          type="button"
          onClick={aoCancelar}
          disabled={deletando}
          className="rounded-full bg-white border border-black/15 px-5 py-2 text-xs font-bold text-black hover:bg-black/5 transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={aoConfirmar}
          disabled={deletando}
          className="rounded-full bg-[#FF0000] hover:bg-[#d90000] px-6 py-2 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          {deletando ? textoDeletando : "Confirmar exclusão"}
        </button>
      </div>
    </div>
  );
}
