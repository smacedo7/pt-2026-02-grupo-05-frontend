"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  BannerErroModal,
  BotaoDeletarConfirmacao,
  ModalBase,
} from "@/components/ui/ModalBase";
import type {
  AtualizarLojaPayload,
  CategoriaResumo,
  Loja,
} from "@/lib/lojas/tipos";
import { atualizarLoja, deletarLoja, listarCategorias } from "@/lib/lojas/lojasApi";

export type ModalEditarLojaProps = {
  loja: Loja;
  aberto: boolean;
  aoFechar: () => void;
  aoSalvar: (lojaAtualizada: Loja) => void;
  aoDeletar?: () => void;
};

const URL_REGEX = /^https?:\/\/.+/i;

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

function CampoMidiaLoja({
  id,
  titulo,
  placeholder,
  valor,
  erro,
  desabilitado,
  previewTipo,
  onChange,
}: CampoMidiaLojaProps) {
  const urlValida = Boolean(valor.trim() && URL_REGEX.test(valor.trim()));

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

export default function ModalEditarLoja(props: ModalEditarLojaProps) {
  if (!props.aberto) return null;
  return (
    <ModalEditarLojaDialog
      key={`${props.loja.id}-${props.loja.updatedAt}`}
      {...props}
    />
  );
}

function ModalEditarLojaDialog({
  loja,
  aoFechar,
  aoSalvar,
  aoDeletar,
}: ModalEditarLojaProps) {
  const [nome, setNome] = useState(loja.name);
  const [categoriaId, setCategoriaId] = useState<number>(loja.categoryId);
  const [descricao, setDescricao] = useState(loja.description ?? "");
  const [logoUrl, setLogoUrl] = useState(loja.logoUrl ?? "");
  const [bannerUrl, setBannerUrl] = useState(loja.bannerUrl ?? "");
  const [stickerUrl, setStickerUrl] = useState(loja.stickerUrl ?? "");

  const [categorias, setCategorias] = useState<CategoriaResumo[]>([]);
  const [carregandoCategorias, setCarregandoCategorias] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [deletando, setDeletando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const primeiroInputRef = useRef<HTMLInputElement>(null);
  const ocupado = salvando || deletando;

  useEffect(() => {
    primeiroInputRef.current?.focus();
    let ativo = true;
    async function carregar() {
      setCarregandoCategorias(true);
      try {
        const dados = await listarCategorias();
        if (ativo) setCategorias(dados);
      } finally {
        if (ativo) setCarregandoCategorias(false);
      }
    }
    carregar();
    return () => {
      ativo = false;
    };
  }, []);

  function validarCampos(): boolean {
    const novosErros: Record<string, string> = {};

    const nomeTrim = nome.trim();
    if (!nomeTrim) {
      novosErros.name = "O nome da loja é obrigatório.";
    } else if (nomeTrim.length > 255) {
      novosErros.name = "O nome não pode exceder 255 caracteres.";
    }

    if (!categoriaId || Number.isNaN(categoriaId)) {
      novosErros.categoryId = "Selecione uma categoria válida.";
    }

    if (descricao && descricao.length > 5000) {
      novosErros.description = "A descrição não pode ter mais de 5000 caracteres.";
    }

    const camposUrl: Array<{
      chave: "logoUrl" | "bannerUrl" | "stickerUrl";
      valor: string;
      rotulo: string;
    }> = [
      { chave: "logoUrl", valor: logoUrl, rotulo: "foto de perfil" },
      { chave: "stickerUrl", valor: stickerUrl, rotulo: "logo/selo" },
      { chave: "bannerUrl", valor: bannerUrl, rotulo: "banner" },
    ];

    for (const item of camposUrl) {
      const limpo = item.valor.trim();
      if (limpo && !URL_REGEX.test(limpo)) {
        novosErros[item.chave] =
          "Informe uma URL válida (http:// ou https://) ou deixe em branco.";
      } else if (limpo.length > 255) {
        novosErros[item.chave] =
          `A URL de ${item.rotulo} não pode ter mais de 255 caracteres.`;
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErroGeral(null);
    if (!validarCampos()) return;

    setSalvando(true);
    const payload: AtualizarLojaPayload = {
      name: nome.trim(),
      categoryId: Number(categoriaId),
      description: descricao.trim() ? descricao.trim() : null,
      logoUrl: logoUrl.trim() ? logoUrl.trim() : null,
      bannerUrl: bannerUrl.trim() ? bannerUrl.trim() : null,
      stickerUrl: stickerUrl.trim() ? stickerUrl.trim() : null,
    };

    const resultado = await atualizarLoja(loja.id, payload);
    setSalvando(false);

    if (resultado.tipo === "sucesso") {
      aoSalvar(resultado.loja);
      aoFechar();
      return;
    }

    if (resultado.tipo === "validacao") {
      setErroGeral(resultado.mensagem);
      if (resultado.campos) setErros((prev) => ({ ...prev, ...resultado.campos }));
    } else if (resultado.tipo === "proibido") {
      setErroGeral(resultado.mensagem);
    } else if (resultado.tipo === "nao-autorizado") {
      setErroGeral("Sessão expirada. Faça login novamente para editar esta loja.");
    } else if (resultado.tipo === "nao-encontrado") {
      setErroGeral("Esta loja não foi encontrada no servidor.");
    } else if (resultado.tipo === "conflito") {
      setErroGeral("A loja foi alterada simultaneamente. Tente novamente.");
    } else if (resultado.tipo === "conexao") {
      setErroGeral("Não foi possível conectar ao servidor. Verifique se o backend está em execução.");
    } else {
      setErroGeral(resultado.mensagem || "Ocorreu um erro ao salvar as alterações.");
    }
  }

  async function handleConfirmarExclusao() {
    setErroGeral(null);
    setDeletando(true);
    const resultado = await deletarLoja(loja.id);
    setDeletando(false);

    if (resultado.tipo === "sucesso") {
      aoFechar();
      aoDeletar?.();
      return;
    }

    setConfirmandoExclusao(false);
    if (resultado.tipo === "proibido") setErroGeral(resultado.mensagem);
    else if (resultado.tipo === "nao-autorizado")
      setErroGeral("Sessão expirada. Faça login novamente para deletar esta loja.");
    else if (resultado.tipo === "nao-encontrado")
      setErroGeral("Esta loja não foi encontrada ou já foi removida.");
    else if (resultado.tipo === "conflito")
      setErroGeral("Conflito ao tentar remover a loja. Tente novamente.");
    else if (resultado.tipo === "conexao")
      setErroGeral("Não foi possível conectar ao servidor.");
    else setErroGeral(resultado.mensagem || "Não foi possível deletar a loja.");
  }

  return (
    <ModalBase
      tituloId="titulo-modal-editar-loja"
      titulo="Editar loja"
      ocupado={ocupado}
      aoFechar={aoFechar}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <BannerErroModal mensagem={erroGeral} />

        <div className="flex flex-col gap-1">
          <label htmlFor="loja-nome" className="text-xs font-semibold text-black/70 px-3">
            Nome da Loja <span className="text-[#6A38F3]">*</span>
          </label>
          <input
            ref={primeiroInputRef}
            id="loja-nome"
            type="text"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              if (erros.name) setErros((prev) => ({ ...prev, name: "" }));
            }}
            disabled={ocupado}
            placeholder="Nome da loja"
            maxLength={255}
            className={`w-full rounded-full bg-white px-6 py-3 text-base font-light text-black shadow-xs outline-none border transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-[#6A38F3] ${
              erros.name ? "border-red-500 ring-2 ring-red-500/30" : "border-transparent"
            }`}
          />
          {erros.name && <p className="text-xs font-semibold text-red-600 px-4">{erros.name}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="loja-categoria" className="text-xs font-semibold text-black/70 px-3">
            Categoria <span className="text-[#6A38F3]">*</span>
          </label>
          <select
            id="loja-categoria"
            value={categoriaId}
            onChange={(e) => {
              setCategoriaId(Number(e.target.value));
              if (erros.categoryId) setErros((prev) => ({ ...prev, categoryId: "" }));
            }}
            disabled={ocupado || carregandoCategorias}
            className={`w-full rounded-full bg-white px-6 py-3 text-base font-light text-black shadow-xs outline-none border transition-all focus:ring-2 focus:ring-[#6A38F3] ${
              erros.categoryId ? "border-red-500 ring-2 ring-red-500/30" : "border-transparent"
            }`}
          >
            {carregandoCategorias ? (
              <option value="">Carregando categorias...</option>
            ) : (
              <>
                <option value="" disabled>
                  Selecione uma categoria
                </option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </>
            )}
          </select>
          {erros.categoryId && (
            <p className="text-xs font-semibold text-red-600 px-4">{erros.categoryId}</p>
          )}
        </div>

        <CampoMidiaLoja
          id="loja-logo-url"
          titulo="Anexe a URL da foto de perfil de sua loja"
          placeholder="https://exemplo.com/perfil.png"
          valor={logoUrl}
          erro={erros.logoUrl}
          desabilitado={ocupado}
          previewTipo="avatar"
          onChange={(val) => {
            setLogoUrl(val);
            if (erros.logoUrl) setErros((prev) => ({ ...prev, logoUrl: "" }));
          }}
        />

        <CampoMidiaLoja
          id="loja-sticker-url"
          titulo="Anexe a URL da logo / selo (SVG ou PNG) de sua loja"
          placeholder="https://exemplo.com/logo.svg"
          valor={stickerUrl}
          erro={erros.stickerUrl}
          desabilitado={ocupado}
          previewTipo="selo"
          onChange={(val) => {
            setStickerUrl(val);
            if (erros.stickerUrl) setErros((prev) => ({ ...prev, stickerUrl: "" }));
          }}
        />

        <CampoMidiaLoja
          id="loja-banner-url"
          titulo="Anexe a URL do banner de sua loja"
          placeholder="https://exemplo.com/banner.png"
          valor={bannerUrl}
          erro={erros.bannerUrl}
          desabilitado={ocupado}
          previewTipo="banner"
          onChange={(val) => {
            setBannerUrl(val);
            if (erros.bannerUrl) setErros((prev) => ({ ...prev, bannerUrl: "" }));
          }}
        />

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-3">
            <label htmlFor="loja-descricao" className="text-xs font-semibold text-black/70">
              Descrição da Loja <span className="font-normal text-black/50">(opcional)</span>
            </label>
            <span className="text-xs text-black/50">{descricao.length}/5000</span>
          </div>
          <textarea
            id="loja-descricao"
            rows={2}
            value={descricao}
            onChange={(e) => {
              setDescricao(e.target.value);
              if (erros.description) setErros((prev) => ({ ...prev, description: "" }));
            }}
            disabled={ocupado}
            placeholder="Descreva o que sua loja oferece..."
            maxLength={5000}
            className={`w-full rounded-2xl bg-white px-5 py-3 text-sm font-light text-black shadow-xs outline-none border transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-[#6A38F3] ${
              erros.description ? "border-red-500 ring-2 ring-red-500/30" : "border-transparent"
            }`}
          />
          {erros.description && (
            <p className="text-xs font-semibold text-red-600 px-4">{erros.description}</p>
          )}
        </div>

        <div className="pt-2 space-y-3">
          <BotaoDeletarConfirmacao
            idDialogo="titulo-confirmar-exclusao-loja"
            textoConfirmacao="Tem certeza? Todos os produtos e avaliações desta loja serão excluídos permanentemente."
            confirmando={confirmandoExclusao}
            ocupado={ocupado}
            deletando={deletando}
            textoDeletando="Deletando loja..."
            aoIniciarConfirmacao={() => setConfirmandoExclusao(true)}
            aoCancelar={() => setConfirmandoExclusao(false)}
            aoConfirmar={handleConfirmarExclusao}
          />

          <div className="flex justify-center pt-1">
            <button
              type="submit"
              disabled={ocupado}
              className="w-full sm:w-[373px] rounded-full bg-[#6A38F3] hover:bg-[#5c2de0] py-3 text-lg font-normal text-white shadow-md transition-colors focus-visible:outline-2 focus-visible:outline-[#6A38F3] disabled:opacity-50 cursor-pointer"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </form>
    </ModalBase>
  );
}
