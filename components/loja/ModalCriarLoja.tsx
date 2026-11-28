"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ModalBase } from "@/components/ui/ModalBase";
import { CampoMidiaLoja, validarCamposLoja } from "@/components/loja/CampoMidiaLoja";
import { mensagemErroResultado } from "@/lib/apiCliente";
import type { CategoriaResumo, CriarLojaPayload, Loja } from "@/lib/lojas/tipos";
import { criarLoja, listarCategorias } from "@/lib/lojas/lojasApi";

export type ModalCriarLojaProps = {
  aberto: boolean;
  aoFechar: () => void;
  aoCriar: (lojaCriada: Loja) => void;
};

export default function ModalCriarLoja(props: ModalCriarLojaProps) {
  if (!props.aberto) return null;
  return <ModalCriarLojaDialog {...props} />;
}

function ModalCriarLojaDialog({ aoFechar, aoCriar }: ModalCriarLojaProps) {
  const [nome, setNome] = useState("");
  const [categoriaId, setCategoriaId] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState("");
  const [stickerUrl, setStickerUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  const [categorias, setCategorias] = useState<CategoriaResumo[]>([]);
  const [carregandoCategorias, setCarregandoCategorias] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  const primeiroInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    primeiroInputRef.current?.focus();
    let ativo = true;
    async function carregar() {
      setCarregandoCategorias(true);
      try {
        const raizes = await listarCategorias({ root: true });
        const lista = raizes.length > 0 ? raizes : await listarCategorias();
        if (ativo) setCategorias(lista);
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
      categoriaId: Number(categoriaId),
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
    const payload: CriarLojaPayload = {
      name: nome.trim(),
      categoryId: Number(categoriaId),
      ...(logoUrl.trim() ? { logoUrl: logoUrl.trim() } : {}),
      ...(stickerUrl.trim() ? { stickerUrl: stickerUrl.trim() } : {}),
      ...(bannerUrl.trim() ? { bannerUrl: bannerUrl.trim() } : {}),
    };

    const resultado = await criarLoja(payload);
    setSalvando(false);

    if (resultado.tipo === "sucesso") {
      aoCriar(resultado.loja);
      aoFechar();
      return;
    }

    if (resultado.tipo === "validacao" && resultado.campos) {
      setErros((prev) => ({ ...prev, ...resultado.campos }));
    }
    toast.error(
      mensagemErroResultado(resultado, {
        naoAutorizado: "Sessão expirada. Faça login novamente para criar uma loja.",
        conflito: "Conflito ao criar a loja. Tente novamente.",
        padrao: "Ocorreu um erro ao criar a loja.",
      })
    );
  }

  return (
    <ModalBase
      tituloId="titulo-modal-criar-loja"
      titulo="Adicionar loja"
      ocupado={salvando}
      aoFechar={aoFechar}
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label htmlFor="criar-loja-nome" className="sr-only">
            Nome da loja
          </label>
          <input
            ref={primeiroInputRef}
            id="criar-loja-nome"
            type="text"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              if (erros.name) setErros((prev) => ({ ...prev, name: "" }));
            }}
            disabled={salvando}
            placeholder="Nome da loja"
            maxLength={255}
            className={`w-full rounded-full bg-white px-6 py-3 text-base font-light text-black shadow-xs outline-none border transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-[#6A38F3] ${
              erros.name ? "border-red-500 ring-2 ring-red-500/30" : "border-transparent"
            }`}
          />
          {erros.name && (
            <p className="text-xs font-semibold text-red-600 px-4 mt-1">{erros.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="criar-loja-categoria" className="sr-only">
            Categoria
          </label>
          <select
            id="criar-loja-categoria"
            value={categoriaId}
            onChange={(e) => {
              setCategoriaId(e.target.value);
              if (erros.categoryId) setErros((prev) => ({ ...prev, categoryId: "" }));
            }}
            disabled={salvando || carregandoCategorias}
            className={`w-full rounded-full bg-white px-6 py-3 text-base font-light shadow-xs outline-none border transition-all focus:ring-2 focus:ring-[#6A38F3] ${
              categoriaId ? "text-black" : "text-gray-400"
            } ${
              erros.categoryId
                ? "border-red-500 ring-2 ring-red-500/30"
                : "border-transparent"
            }`}
          >
            {carregandoCategorias ? (
              <option value="">Carregando categorias...</option>
            ) : (
              <>
                <option value="" disabled>
                  Categoria
                </option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id} className="text-black">
                    {cat.name}
                  </option>
                ))}
              </>
            )}
          </select>
          {erros.categoryId && (
            <p className="text-xs font-semibold text-red-600 px-4 mt-1">
              {erros.categoryId}
            </p>
          )}
        </div>

        <CampoMidiaLoja
          id="criar-loja-logo-url"
          titulo="Anexe a foto de perfil de sua loja"
          placeholder="https://exemplo.com/perfil.png"
          valor={logoUrl}
          erro={erros.logoUrl}
          desabilitado={salvando}
          previewTipo="avatar"
          onChange={(val) => {
            setLogoUrl(val);
            if (erros.logoUrl) setErros((prev) => ({ ...prev, logoUrl: "" }));
          }}
        />

        <CampoMidiaLoja
          id="criar-loja-sticker-url"
          titulo="Anexe a logo em SVG de sua loja"
          placeholder="https://exemplo.com/logo.svg"
          valor={stickerUrl}
          erro={erros.stickerUrl}
          desabilitado={salvando}
          previewTipo="selo"
          onChange={(val) => {
            setStickerUrl(val);
            if (erros.stickerUrl) setErros((prev) => ({ ...prev, stickerUrl: "" }));
          }}
        />

        <CampoMidiaLoja
          id="criar-loja-banner-url"
          titulo="Anexe o banner de sua loja"
          placeholder="https://exemplo.com/banner.png"
          valor={bannerUrl}
          erro={erros.bannerUrl}
          desabilitado={salvando}
          previewTipo="banner"
          onChange={(val) => {
            setBannerUrl(val);
            if (erros.bannerUrl) setErros((prev) => ({ ...prev, bannerUrl: "" }));
          }}
        />

        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={salvando}
            className="w-full sm:w-[373px] rounded-full bg-[#6A38F3] hover:bg-[#5c2de0] py-3 text-lg font-normal text-white shadow-md transition-colors focus-visible:outline-2 focus-visible:outline-[#6A38F3] disabled:opacity-50 cursor-pointer"
          >
            {salvando ? "Adicionando..." : "Adicionar"}
          </button>
        </div>
      </form>
    </ModalBase>
  );
}
