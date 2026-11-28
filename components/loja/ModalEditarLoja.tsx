"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { BotaoDeletarConfirmacao, ModalBase } from "@/components/ui/ModalBase";
import { CampoMidiaLoja, validarCamposLoja } from "@/components/loja/CampoMidiaLoja";
import { mensagemErroResultado } from "@/lib/apiCliente";
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
    const novosErros = validarCamposLoja({
      nome,
      categoriaId,
      descricao,
      logoUrl,
      stickerUrl,
      bannerUrl,
    });
    setErros(novosErros);
    const primeiroErro = Object.values(novosErros)[0];
    if (primeiroErro) toast.error(primeiroErro);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

    if (resultado.tipo === "validacao" && resultado.campos) {
      setErros((prev) => ({ ...prev, ...resultado.campos }));
    }
    toast.error(
      mensagemErroResultado(resultado, {
        naoAutorizado: "Sessão expirada. Faça login novamente para editar esta loja.",
        naoEncontrado: "Esta loja não foi encontrada no servidor.",
        conflito: "A loja foi alterada simultaneamente. Tente novamente.",
        padrao: "Ocorreu um erro ao salvar as alterações.",
      })
    );
  }

  async function handleConfirmarExclusao() {
    setDeletando(true);
    const resultado = await deletarLoja(loja.id);
    setDeletando(false);

    if (resultado.tipo === "sucesso") {
      aoFechar();
      aoDeletar?.();
      return;
    }

    setConfirmandoExclusao(false);
    toast.error(
      mensagemErroResultado(resultado, {
        naoAutorizado: "Sessão expirada. Faça login novamente para deletar esta loja.",
        naoEncontrado: "Esta loja não foi encontrada ou já foi removida.",
        conflito: "Conflito ao tentar remover a loja. Tente novamente.",
        padrao: "Não foi possível deletar a loja.",
      })
    );
  }

  return (
    <ModalBase
      tituloId="titulo-modal-editar-loja"
      titulo="Editar loja"
      ocupado={ocupado}
      aoFechar={aoFechar}
    >
      <form onSubmit={handleSubmit} className="space-y-4">

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
