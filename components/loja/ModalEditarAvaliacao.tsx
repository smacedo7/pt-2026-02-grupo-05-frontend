"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { BotaoDeletarConfirmacao, ModalBase } from "@/components/ui/ModalBase";
import SeletorEstrelasAvaliacao from "@/components/loja/SeletorEstrelasAvaliacao";
import { mensagemErroResultado } from "@/lib/apiCliente";
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
  const [comentario, setComentario] = useState(avaliacao.comment ?? "");

  const [salvando, setSalvando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [deletando, setDeletando] = useState(false);

  const ocupado = salvando || deletando;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (nota < 0 || nota > 5) {
      toast.error("Selecione uma nota entre 0 e 5 estrelas.");
      return;
    }

    if (comentario.length > 5000) {
      toast.error("O comentário não pode exceder 5000 caracteres.");
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

    toast.error(
      mensagemErroResultado(resultado, {
        naoEncontrado: "Esta avaliação não foi encontrada no servidor.",
        conflito: "Conflito ao salvar a avaliação. Tente novamente.",
        padrao: "Erro ao atualizar avaliação.",
      })
    );
  }

  async function handleConfirmarExclusao() {
    setDeletando(true);
    const resultado = await deletarAvaliacaoLoja(avaliacao.id);
    setDeletando(false);

    if (resultado.tipo === "sucesso") {
      aoFechar();
      aoDeletar(avaliacao.id);
      return;
    }

    setConfirmandoExclusao(false);
    toast.error(
      mensagemErroResultado(resultado, {
        naoEncontrado: "Avaliação já removida.",
        conflito: "Conflito ao deletar avaliação. Tente novamente.",
        padrao: "Erro ao deletar avaliação.",
      })
    );
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
        <SeletorEstrelasAvaliacao
          nota={nota}
          ocupado={ocupado}
          tamanho="md"
          aoSelecionar={setNota}
        />

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
