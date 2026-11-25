"use client";

import React, { useState } from "react";
import {
  BannerErroModal,
  BotaoDeletarConfirmacao,
  ModalBase,
} from "@/components/ui/ModalBase";
import type { AvaliacaoLoja } from "@/lib/avaliacoes/tipos";
import {
  atualizarAvaliacaoLoja,
  deletarAvaliacaoLoja,
} from "@/lib/avaliacoes/avaliacoesApi";

export type ModalEditarAvaliacaoProps = {
  avaliacao: AvaliacaoLoja | null;
  nomeLoja: string;
  aberto: boolean;
  aoFechar: () => void;
  aoSalvar: (avaliacaoAtualizada: AvaliacaoLoja) => void;
  aoDeletar: (avaliacaoId: number) => void;
};

export default function ModalEditarAvaliacao(props: ModalEditarAvaliacaoProps) {
  if (!props.aberto || !props.avaliacao) return null;
  return (
    <ModalEditarAvaliacaoDialog
      key={`${props.avaliacao.id}-${props.avaliacao.updatedAt}`}
      {...props}
      avaliacao={props.avaliacao}
    />
  );
}

function ModalEditarAvaliacaoDialog({
  avaliacao,
  nomeLoja,
  aoFechar,
  aoSalvar,
  aoDeletar,
}: Omit<ModalEditarAvaliacaoProps, "avaliacao"> & { avaliacao: AvaliacaoLoja }) {
  const [nota, setNota] = useState<number>(avaliacao.rating);
  const [notaHover, setNotaHover] = useState<number | null>(null);
  const [comentario, setComentario] = useState(avaliacao.comment ?? "");

  const [salvando, setSalvando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [deletando, setDeletando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const ocupado = salvando || deletando;
  const notaExibida = notaHover ?? nota;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErroGeral(null);

    if (nota < 0 || nota > 5) {
      setErroGeral("Selecione uma nota entre 0 e 5 estrelas.");
      return;
    }

    if (comentario.length > 5000) {
      setErroGeral("O comentário não pode exceder 5000 caracteres.");
      return;
    }

    setSalvando(true);
    const resultado = await atualizarAvaliacaoLoja(avaliacao.id, {
      rating: nota,
      comment: comentario.trim() ? comentario.trim() : null,
    });
    setSalvando(false);

    if (resultado.tipo === "sucesso") {
      aoSalvar(resultado.avaliacao);
      aoFechar();
      return;
    }

    if (resultado.tipo === "validacao" || resultado.tipo === "proibido") {
      setErroGeral(resultado.mensagem);
    } else if (resultado.tipo === "nao-autorizado") {
      setErroGeral("Sessão expirada. Faça login novamente.");
    } else if (resultado.tipo === "nao-encontrado") {
      setErroGeral("Esta avaliação não foi encontrada no servidor.");
    } else if (resultado.tipo === "conflito") {
      setErroGeral("Conflito ao salvar a avaliação. Tente novamente.");
    } else if (resultado.tipo === "conexao") {
      setErroGeral("Não foi possível conectar ao servidor.");
    } else {
      setErroGeral(resultado.mensagem || "Erro ao atualizar avaliação.");
    }
  }

  async function handleConfirmarExclusao() {
    setErroGeral(null);
    setDeletando(true);
    const resultado = await deletarAvaliacaoLoja(avaliacao.id);
    setDeletando(false);

    if (resultado.tipo === "sucesso") {
      aoFechar();
      aoDeletar(avaliacao.id);
      return;
    }

    setConfirmandoExclusao(false);
    if (resultado.tipo === "proibido") setErroGeral(resultado.mensagem);
    else if (resultado.tipo === "nao-autorizado")
      setErroGeral("Sessão expirada. Faça login novamente.");
    else if (resultado.tipo === "nao-encontrado")
      setErroGeral("Avaliação já removida.");
    else if (resultado.tipo === "conflito")
      setErroGeral("Conflito ao deletar avaliação. Tente novamente.");
    else if (resultado.tipo === "conexao")
      setErroGeral("Não foi possível conectar ao servidor.");
    else setErroGeral(resultado.mensagem || "Erro ao deletar avaliação.");
  }

  return (
    <ModalBase
      tituloId="titulo-modal-editar-avaliacao"
      titulo="Editar avaliação"
      subtitulo={nomeLoja}
      ocupado={ocupado}
      aoFechar={aoFechar}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <BannerErroModal mensagem={erroGeral} />

        {/* Seletor de 5 Estrelas conforme Figma */}
        <div className="flex flex-col items-center gap-2">
          <div
            role="radiogroup"
            aria-label="Nota da avaliação em estrelas"
            className="flex items-center gap-3"
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
                  onClick={() => setNota(estrela)}
                  onMouseEnter={() => setNotaHover(estrela)}
                  disabled={ocupado}
                  className="p-1 transition-transform hover:scale-110 cursor-pointer disabled:opacity-50"
                >
                  <svg
                    className={`h-10 w-10 sm:h-12 sm:w-12 transition-colors ${
                      ativa
                        ? "text-[#C6E700] fill-[#C6E700] drop-shadow-xs"
                        : "text-black/25 fill-transparent"
                    }`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.6}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              );
            })}
          </div>
          <span className="text-xs font-medium text-black/60">
            Nota selecionada: {nota} de 5
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-3">
            <label htmlFor="avaliacao-comentario" className="text-xs font-semibold text-black/70">
              Seu comentário <span className="font-normal text-black/50">(opcional)</span>
            </label>
            <span className="text-xs text-black/50">{comentario.length}/5000</span>
          </div>
          <textarea
            id="avaliacao-comentario"
            rows={5}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            disabled={ocupado}
            placeholder="Escreva sua opinião sobre esta loja..."
            maxLength={5000}
            className="w-full rounded-[27px] bg-white px-6 py-4 text-sm sm:text-base font-light text-black shadow-xs outline-none border border-transparent placeholder:text-gray-400 focus:ring-2 focus:ring-[#6A38F3]"
          />
        </div>

        <div className="pt-2 space-y-3">
          <BotaoDeletarConfirmacao
            idDialogo="titulo-confirmar-exclusao-avaliacao"
            textoConfirmacao="Deseja remover permanentemente sua avaliação desta loja?"
            confirmando={confirmandoExclusao}
            ocupado={ocupado}
            deletando={deletando}
            aoIniciarConfirmacao={() => setConfirmandoExclusao(true)}
            aoCancelar={() => setConfirmandoExclusao(false)}
            aoConfirmar={handleConfirmarExclusao}
          />

          <div className="flex justify-center pt-1">
            <button
              type="submit"
              disabled={ocupado}
              className="w-full sm:w-[373px] rounded-full bg-[#6A38F3] hover:bg-[#5c2de0] py-3 text-lg font-normal text-white shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </form>
    </ModalBase>
  );
}
