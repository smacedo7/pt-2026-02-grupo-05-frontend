"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ModalBase } from "@/components/ui/ModalBase";
import {
  BlocoFotosProduto,
  StepperEstoqueProduto,
  validarCamposProduto,
  validarNovaImagemProduto,
  type ImagemProdutoRascunho,
} from "@/components/loja/BlocoFotosProduto";
import { mensagemErroResultado } from "@/lib/apiCliente";
import type { CategoriaResumo } from "@/lib/lojas/tipos";
import { listarCategorias } from "@/lib/lojas/lojasApi";
import type { ProdutoLoja } from "@/lib/produtos/tipos";
import {
  adicionarImagemProduto,
  buscarDetalheProduto,
  criarProduto,
} from "@/lib/produtos/produtosApi";

export type ModalCriarProdutoProps = {
  storeId: number;
  storeCategoryId: number;
  aberto: boolean;
  aoFechar: () => void;
  aoCriar: (produtoCriado: ProdutoLoja) => void;
};

export default function ModalCriarProduto(props: ModalCriarProdutoProps) {
  if (!props.aberto) return null;
  return <ModalCriarProdutoDialog {...props} />;
}

function ModalCriarProdutoDialog({
  storeId,
  storeCategoryId,
  aoFechar,
  aoCriar,
}: ModalCriarProdutoProps) {
  const [nome, setNome] = useState("");
  const [categoriaId, setCategoriaId] = useState<string>("");
  const [descricao, setDescricao] = useState("");
  const [precoTexto, setPrecoTexto] = useState("");
  const [estoque, setEstoque] = useState<number>(1);
  const [imagens, setImagens] = useState<ImagemProdutoRascunho[]>([]);
  const [novaUrlImagem, setNovaUrlImagem] = useState("");

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
        const subcategorias = await listarCategorias({
          parentCategoryId: storeCategoryId,
        });
        const lista =
          subcategorias.length > 0 ? subcategorias : await listarCategorias();
        if (ativo) setCategorias(lista);
      } finally {
        if (ativo) setCarregandoCategorias(false);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [storeCategoryId]);

  function adicionarImagem() {
    const { erro, urlLimpa } = validarNovaImagemProduto(
      novaUrlImagem,
      imagens.length
    );
    if (erro) {
      setErros((prev) => ({ ...prev, images: erro }));
      toast.error(erro);
      return;
    }
    if (!urlLimpa) return;

    setImagens((prev) => [...prev, { imageUrl: urlLimpa }]);
    setNovaUrlImagem("");
    if (erros.images) setErros((prev) => ({ ...prev, images: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { erros: novosErros, precoNumero } = validarCamposProduto({
      nome,
      categoriaId: Number(categoriaId),
      descricao,
      precoTexto,
      estoque,
      novaUrlImagem,
      mensagemCategoria: "Selecione uma subcategoria válida.",
    });
    setErros(novosErros);
    const primeiroErro = Object.values(novosErros)[0];
    if (primeiroErro) {
      toast.error(primeiroErro);
      return;
    }

    setSalvando(true);
    const resultado = await criarProduto({
      storeId,
      categoryId: Number(categoriaId),
      name: nome.trim(),
      description: descricao.trim() ? descricao.trim() : null,
      price: precoNumero,
      stock: estoque,
    });

    if (resultado.tipo !== "sucesso") {
      setSalvando(false);
      if (resultado.tipo === "validacao" && resultado.campos) {
        setErros((prev) => ({ ...prev, ...resultado.campos }));
      }
      toast.error(
        mensagemErroResultado(resultado, {
          naoAutorizado:
            "Sessão expirada. Faça login novamente para adicionar produtos.",
          naoEncontrado: "Loja ou subcategoria não encontrada.",
          conflito: "Conflito ao criar o produto. Tente novamente.",
          padrao: "Ocorreu um erro ao criar o produto.",
        })
      );
      return;
    }

    let erroImagens = false;
    for (const img of imagens) {
      try {
        await adicionarImagemProduto(resultado.produto.id, img.imageUrl);
      } catch {
        erroImagens = true;
      }
    }

    const detalhe = await buscarDetalheProduto(resultado.produto.id);
    setSalvando(false);
    aoCriar(detalhe ?? resultado.produto);
    aoFechar();

    if (erroImagens) {
      toast.warning(
        "Produto criado, mas uma ou mais imagens falharam ao enviar."
      );
    }
  }

  return (
    <ModalBase
      tituloId="titulo-modal-criar-produto"
      titulo="Adicionar Produto"
      ocupado={salvando}
      aoFechar={aoFechar}
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        <BlocoFotosProduto
          inputId="criar-produto-nova-imagem"
          imagens={imagens}
          novaUrlImagem={novaUrlImagem}
          erro={erros.images}
          ocupado={salvando}
          onChangeNovaUrl={(val) => {
            setNovaUrlImagem(val);
            if (erros.images) setErros((prev) => ({ ...prev, images: "" }));
          }}
          onAdicionarImagem={adicionarImagem}
          onRemoverImagem={(indice) => {
            setImagens((prev) => prev.filter((_, i) => i !== indice));
            if (erros.images) setErros((prev) => ({ ...prev, images: "" }));
          }}
        />

        <div>
          <label htmlFor="criar-produto-nome" className="sr-only">
            Nome do produto
          </label>
          <input
            ref={primeiroInputRef}
            id="criar-produto-nome"
            type="text"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              if (erros.name) setErros((prev) => ({ ...prev, name: "" }));
            }}
            disabled={salvando}
            placeholder="Nome do produto"
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
          <label htmlFor="criar-produto-categoria" className="sr-only">
            Subcategoria
          </label>
          <select
            id="criar-produto-categoria"
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
              <option value="">Carregando subcategorias...</option>
            ) : (
              <>
                <option value="" disabled>
                  Subcategoria
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

        <div>
          <label htmlFor="criar-produto-descricao" className="sr-only">
            Descrição do produto
          </label>
          <textarea
            id="criar-produto-descricao"
            rows={3}
            value={descricao}
            onChange={(e) => {
              setDescricao(e.target.value);
              if (erros.description) setErros((prev) => ({ ...prev, description: "" }));
            }}
            disabled={salvando}
            placeholder="Descrição do produto"
            maxLength={5000}
            className={`w-full rounded-[27px] bg-white px-6 py-3.5 text-sm font-light text-black shadow-xs outline-none border transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-[#6A38F3] ${
              erros.description
                ? "border-red-500 ring-2 ring-red-500/30"
                : "border-transparent"
            }`}
          />
          {erros.description && (
            <p className="text-xs font-semibold text-red-600 px-4 mt-1">
              {erros.description}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="criar-produto-preco" className="sr-only">
            Preço do produto
          </label>
          <input
            id="criar-produto-preco"
            type="text"
            inputMode="decimal"
            value={precoTexto}
            onChange={(e) => {
              setPrecoTexto(e.target.value);
              if (erros.price) setErros((prev) => ({ ...prev, price: "" }));
            }}
            disabled={salvando}
            placeholder="Preço do produto"
            className={`w-full rounded-full bg-white px-6 py-3 text-base font-light text-black shadow-xs outline-none border transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-[#6A38F3] ${
              erros.price ? "border-red-500 ring-2 ring-red-500/30" : "border-transparent"
            }`}
          />
          {erros.price && (
            <p className="text-xs font-semibold text-red-600 px-4 mt-1">{erros.price}</p>
          )}
        </div>

        <StepperEstoqueProduto
          estoque={estoque}
          erro={erros.stock}
          ocupado={salvando}
          onChange={(val) => {
            setEstoque(val);
            if (erros.stock) setErros((prev) => ({ ...prev, stock: "" }));
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
