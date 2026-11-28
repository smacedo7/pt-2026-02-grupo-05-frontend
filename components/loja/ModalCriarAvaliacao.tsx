"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { ModalBase } from "@/components/ui/ModalBase";
import SeletorEstrelasAvaliacao from "@/components/loja/SeletorEstrelasAvaliacao";
import { mensagemErroResultado, type ResultadoApiErro } from "@/lib/apiCliente";
import type { AvaliacaoLoja, AvaliacaoProduto } from "@/lib/avaliacoes/tipos";
import {
  criarAvaliacaoLoja,
  criarAvaliacaoProduto,
} from "@/lib/avaliacoes/avaliacoesApi";

export type ModalCriarAvaliacaoProps =
  | {
      tipo?: "loja";
      alvoId: number;
      nomeAlvo: string;
      aberto: boolean;
      aoFechar: () => void;
      aoCriar: (avaliacao: AvaliacaoLoja) => void;
    }
  | {
      tipo: "produto";
      alvoId: number;
      nomeAlvo: string;
      aberto: boolean;
      aoFechar: () => void;
      aoCriar: (avaliacao: AvaliacaoProduto) => void;
    };

export default function ModalCriarAvaliacao(props: ModalCriarAvaliacaoProps) {
  if (!props.aberto) return null;
  return <ModalCriarAvaliacaoDialog key={`${props.tipo ?? "loja"}-${props.alvoId}`} {...props} />;
}

function ModalCriarAvaliacaoDialog(props: ModalCriarAvaliacaoProps) {
  const tipo = props.tipo ?? "loja";
  const maxCaracteres = tipo === "produto" ? 2000 : 5000;

  const [nota, setNota] = useState<number | null>(null);
  const [comentario, setComentario] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (nota === null || nota < 0 || nota > 5) {
      toast.error("Selecione uma nota clicando nas estrelas antes de avaliar.");
      return;
    }

    if (comentario.length > maxCaracteres) {
      toast.error(`A avaliação não pode exceder ${maxCaracteres} caracteres.`);
      return;
    }

    const textoLimpo = comentario.trim();
    const payload = {
      rating: nota,
      comment: textoLimpo ? textoLimpo : null,
    };

    setSalvando(true);
    if (props.tipo === "produto") {
      const resultado = await criarAvaliacaoProduto(props.alvoId, payload);
      setSalvando(false);
      if (resultado.tipo === "sucesso") {
        props.aoCriar(resultado.avaliacao);
        props.aoFechar();
        return;
      }
      notificarFalha(resultado);
      return;
    }

    const resultado = await criarAvaliacaoLoja(props.alvoId, payload);
    setSalvando(false);
    if (resultado.tipo === "sucesso") {
      props.aoCriar(resultado.avaliacao);
      props.aoFechar();
      return;
    }
    notificarFalha(resultado);
  }

  function notificarFalha(resultado: ResultadoApiErro) {
    toast.error(
      mensagemErroResultado(resultado, {
        naoAutorizado: "Sessão expirada. Faça login novamente para avaliar.",
        naoEncontrado:
          tipo === "produto" ? "Produto não encontrado." : "Loja não encontrada.",
        conflito:
          tipo === "produto"
            ? "Você já avaliou este produto. Edite sua avaliação existente."
            : "Você já avaliou esta loja. Edite sua avaliação existente.",
        padrao: "Erro ao publicar avaliação.",
      })
    );
  }

  return (
    <ModalBase
      tituloId="titulo-modal-criar-avaliacao"
      titulo={`Você está avaliando ${props.nomeAlvo}`}
      tituloApenasLeitor
      ocupado={salvando}
      aoFechar={props.aoFechar}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-xl sm:text-2xl font-normal text-black">
          Você está avaliando{" "}
          <span className="font-semibold">{props.nomeAlvo}</span>
        </p>

        <SeletorEstrelasAvaliacao
          nota={nota}
          ocupado={salvando}
          aoSelecionar={setNota}
        />

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-3">
            <label htmlFor="criar-avaliacao-texto" className="sr-only">
              {tipo === "produto" ? "Avaliação do produto" : "Avaliação da loja"}
            </label>
            <span className="ml-auto text-xs text-black/50">
              {comentario.length}/{maxCaracteres}
            </span>
          </div>
          <textarea
            id="criar-avaliacao-texto"
            rows={6}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            disabled={salvando}
            placeholder={
              tipo === "produto" ? "Avaliação do produto" : "Avaliação da loja"
            }
            maxLength={maxCaracteres}
            className="w-full rounded-[27px] bg-white px-6 py-4 text-sm sm:text-base font-light text-black shadow-xs outline-none border border-transparent placeholder:text-gray-400 focus:ring-2 focus:ring-[#6A38F3]"
          />
        </div>

        <div className="flex justify-center pt-1">
          <button
            type="submit"
            disabled={salvando}
            className="w-full sm:w-[420px] rounded-full bg-[#6A38F3] hover:bg-[#5c2de0] py-3 text-lg font-normal text-white shadow-md transition-colors cursor-pointer disabled:opacity-50"
          >
            {salvando ? "Enviando..." : "Avaliar"}
          </button>
        </div>
      </form>
    </ModalBase>
  );
}
