"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { BotaoDeletarConfirmacao, ModalBase } from "@/components/ui/ModalBase";
import { mensagemErroResultado } from "@/lib/apiCliente";
import type { ComentarioAvaliacao } from "@/lib/avaliacoes/tipos";
import {
  atualizarComentario,
  deletarComentario,
} from "@/lib/avaliacoes/avaliacoesApi";

export type ModalEditarComentarioProps = {
  comentario: ComentarioAvaliacao | null;
  aberto: boolean;
  aoFechar: () => void;
  aoSalvar: (comentarioAtualizado: ComentarioAvaliacao) => void;
  aoDeletar: (comentarioId: number) => void;
};

const MAX_COMENTARIO = 2000;

export default function ModalEditarComentario(props: ModalEditarComentarioProps) {
  if (!props.aberto || !props.comentario) return null;
  return (
    <ModalEditarComentarioDialog
      key={`${props.comentario.id}-${props.comentario.updatedAt}`}
      {...props}
      comentario={props.comentario}
    />
  );
}

function ModalEditarComentarioDialog({
  comentario,
  aoFechar,
  aoSalvar,
  aoDeletar,
}: Omit<ModalEditarComentarioProps, "comentario"> & {
  comentario: ComentarioAvaliacao;
}) {
  const [conteudo, setConteudo] = useState(comentario.content);
  const [salvando, setSalvando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [deletando, setDeletando] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const ocupado = salvando || deletando;

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const limpo = conteudo.trim();
    if (!limpo) {
      toast.error("O comentário não pode ficar em branco.");
      return;
    }

    if (limpo.length > MAX_COMENTARIO) {
      toast.error(`O comentário não pode exceder ${MAX_COMENTARIO} caracteres.`);
      return;
    }

    setSalvando(true);
    const resultado = await atualizarComentario(comentario.id, limpo);
    setSalvando(false);

    if (resultado.tipo === "sucesso") {
      aoSalvar(resultado.comentario);
      aoFechar();
      return;
    }

    toast.error(
      mensagemErroResultado(resultado, {
        naoEncontrado: "Este comentário não foi encontrado no servidor.",
        conflito: "Conflito ao salvar o comentário. Tente novamente.",
        padrao: "Erro ao atualizar comentário.",
      })
    );
  }

  async function handleConfirmarExclusao() {
    setDeletando(true);
    const resultado = await deletarComentario(comentario.id);
    setDeletando(false);

    if (resultado.tipo === "sucesso") {
      aoFechar();
      aoDeletar(comentario.id);
      return;
    }

    setConfirmandoExclusao(false);
    toast.error(
      mensagemErroResultado(resultado, {
        naoEncontrado: "Comentário já removido.",
        conflito: "Conflito ao deletar comentário. Tente novamente.",
        padrao: "Erro ao deletar comentário.",
      })
    );
  }

  return (
    <ModalBase
      tituloId="titulo-modal-editar-comentario"
      titulo="Editar comentário"
      tituloApenasLeitor
      ocupado={ocupado}
      aoFechar={aoFechar}
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-3">
            <label htmlFor="editar-comentario-conteudo" className="sr-only">
              Comentário
            </label>
            <span className="ml-auto text-xs text-black/50">
              {conteudo.length}/{MAX_COMENTARIO}
            </span>
          </div>
          <textarea
            ref={textareaRef}
            id="editar-comentario-conteudo"
            rows={6}
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            disabled={ocupado}
            placeholder="Comentário"
            maxLength={MAX_COMENTARIO}
            className="w-full rounded-[27px] bg-white px-6 py-4 text-sm sm:text-base font-light text-black shadow-xs outline-none border border-transparent placeholder:text-gray-400 focus:ring-2 focus:ring-[#6A38F3]"
          />
        </div>

        <div className="pt-2 space-y-3">
          <BotaoDeletarConfirmacao
            idDialogo="titulo-confirmar-exclusao-comentario"
            textoConfirmacao="Deseja remover permanentemente este comentário?"
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
              className="w-full sm:w-[420px] rounded-full bg-[#6A38F3] hover:bg-[#5c2de0] py-3 text-lg font-normal text-white shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </form>
    </ModalBase>
  );
}
