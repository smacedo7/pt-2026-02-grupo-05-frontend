"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { BotaoDeletarConfirmacao, ModalBase } from "@/components/ui/ModalBase";
import {
  BlocoFotosProduto,
  MAX_FOTOS_PRODUTO,
  StepperEstoqueProduto,
  validarCamposProduto,
  validarNovaImagemProduto,
  type ImagemProdutoRascunho,
} from "@/components/loja/BlocoFotosProduto";
import { mensagemErroResultado } from "@/lib/apiCliente";
import type { CategoriaResumo } from "@/lib/lojas/tipos";
import { listarCategorias } from "@/lib/lojas/lojasApi";
import type { ProdutoImagem, ProdutoLoja } from "@/lib/produtos/tipos";
import {
  adicionarImagemProduto,
  atualizarProduto,
  buscarDetalheProduto,
  deletarProduto,
  listarImagensProduto,
  removerImagemProduto,
} from "@/lib/produtos/produtosApi";

export type ModalEditarProdutoProps = {
  produto: ProdutoLoja | null;
  aberto: boolean;
  aoFechar: () => void;
  aoSalvar: (produtoAtualizado: ProdutoLoja) => void;
  aoDeletar: (produtoId: number) => void;
};

type ImagemRascunho = ImagemProdutoRascunho;

const MAX_FOTOS = MAX_FOTOS_PRODUTO;

function formatarPrecoInput(valor: number): string {
  return Number.isFinite(valor) ? valor.toFixed(2).replace(".", ",") : "0,00";
}

export default function ModalEditarProduto(props: ModalEditarProdutoProps) {
  if (!props.aberto || !props.produto) return null;
  return (
    <ModalEditarProdutoDialog
      key={`${props.produto.id}-${props.produto.updatedAt}`}
      {...props}
      produto={props.produto}
    />
  );
}

function ModalEditarProdutoDialog({
  produto,
  aoFechar,
  aoSalvar,
  aoDeletar,
}: Omit<ModalEditarProdutoProps, "produto"> & { produto: ProdutoLoja }) {
  const [nome, setNome] = useState(produto.name);
  const [categoriaId, setCategoriaId] = useState<number>(produto.categoryId);
  const [descricao, setDescricao] = useState(produto.description ?? "");
  const [precoTexto, setPrecoTexto] = useState(formatarPrecoInput(produto.price));
  const [estoque, setEstoque] = useState<number>(produto.stock);

  const [imagensIniciais, setImagensIniciais] = useState<ProdutoImagem[]>(
    produto.images ?? []
  );
  const [imagens, setImagens] = useState<ImagemRascunho[]>(
    (produto.images ?? []).slice(0, MAX_FOTOS)
  );
  const [novaUrlImagem, setNovaUrlImagem] = useState("");

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
        const [cats, imgs] = await Promise.all([
          listarCategorias(),
          produto.images === undefined
            ? listarImagensProduto(produto.id)
            : Promise.resolve(produto.images),
        ]);
        if (!ativo) return;
        setCategorias(cats);
        if (produto.images === undefined) {
          setImagensIniciais(imgs);
          setImagens(imgs.slice(0, MAX_FOTOS));
        }
      } finally {
        if (ativo) setCarregandoCategorias(false);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [produto.id, produto.images]);

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

  function removerImagem(indice: number) {
    setImagens((prev) => prev.filter((_, i) => i !== indice));
    if (erros.images) setErros((prev) => ({ ...prev, images: "" }));
  }

  async function sincronizarImagensProduto() {
    const idsMantidos = new Set(
      imagens.map((img) => img.id).filter((id): id is number => typeof id === "number")
    );
    const removidas = imagensIniciais.filter((img) => !idsMantidos.has(img.id));
    const adicionadas = imagens.filter((img) => img.id === undefined);

    for (const img of removidas) {
      await removerImagemProduto(produto.id, img.id);
    }
    for (const img of adicionadas) {
      await adicionarImagemProduto(produto.id, img.imageUrl);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { erros: novosErros, precoNumero } = validarCamposProduto({
      nome,
      categoriaId,
      descricao,
      precoTexto,
      estoque,
      novaUrlImagem,
    });
    setErros(novosErros);
    const primeiroErro = Object.values(novosErros)[0];
    if (primeiroErro) {
      toast.error(primeiroErro);
      return;
    }

    setSalvando(true);
    const resultado = await atualizarProduto(produto.id, {
      name: nome.trim(),
      categoryId: Number(categoriaId),
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
            "Sessão expirada. Faça login novamente para editar este produto.",
          naoEncontrado: "Este produto não foi encontrado no servidor.",
          conflito: "O produto foi alterado simultaneamente. Tente novamente.",
          padrao: "Ocorreu um erro ao salvar o produto.",
        })
      );
      return;
    }

    try {
      await sincronizarImagensProduto();
    } catch {
      setSalvando(false);
      toast.error(
        "Os dados do produto foram salvos, mas houve erro ao atualizar as imagens."
      );
      return;
    }

    const detalhe = await buscarDetalheProduto(produto.id);
    setSalvando(false);
    aoSalvar(detalhe ?? resultado.produto);
    aoFechar();
  }

  async function handleConfirmarExclusao() {
    setDeletando(true);
    const resultado = await deletarProduto(produto.id);
    setDeletando(false);

    if (resultado.tipo === "sucesso") {
      aoFechar();
      aoDeletar(produto.id);
      return;
    }

    setConfirmandoExclusao(false);
    toast.error(
      mensagemErroResultado(resultado, {
        naoAutorizado:
          "Sessão expirada. Faça login novamente para deletar este produto.",
        naoEncontrado: "Este produto não foi encontrado ou já foi removido.",
        conflito: "Conflito ao tentar remover o produto. Tente novamente.",
        padrao: "Não foi possível deletar o produto.",
      })
    );
  }

  return (
    <ModalBase
      tituloId="titulo-modal-editar-produto"
      titulo="Editar Produto"
      ocupado={ocupado}
      aoFechar={aoFechar}
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        <BlocoFotosProduto
          inputId="produto-nova-imagem"
          imagens={imagens}
          novaUrlImagem={novaUrlImagem}
          erro={erros.images}
          ocupado={ocupado}
          onChangeNovaUrl={(val) => {
            setNovaUrlImagem(val);
            if (erros.images) setErros((prev) => ({ ...prev, images: "" }));
          }}
          onAdicionarImagem={adicionarImagem}
          onRemoverImagem={removerImagem}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="produto-nome" className="text-xs font-semibold text-black/70 px-3">
            Nome do produto <span className="text-[#6A38F3]">*</span>
          </label>
          <input
            ref={primeiroInputRef}
            id="produto-nome"
            type="text"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              if (erros.name) setErros((prev) => ({ ...prev, name: "" }));
            }}
            disabled={ocupado}
            placeholder="Ex: Batom Soft Pinch"
            maxLength={255}
            className={`w-full rounded-full bg-white px-6 py-3 text-base font-light text-black shadow-xs outline-none border transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-[#6A38F3] ${
              erros.name ? "border-red-500 ring-2 ring-red-500/30" : "border-transparent"
            }`}
          />
          {erros.name && <p className="text-xs font-semibold text-red-600 px-4">{erros.name}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="produto-categoria" className="text-xs font-semibold text-black/70 px-3">
            Categoria <span className="text-[#6A38F3]">*</span>
          </label>
          <select
            id="produto-categoria"
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

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-3">
            <label htmlFor="produto-descricao" className="text-xs font-semibold text-black/70">
              Descrição do produto <span className="font-normal text-black/50">(opcional)</span>
            </label>
            <span className="text-xs text-black/50">{descricao.length}/5000</span>
          </div>
          <textarea
            id="produto-descricao"
            rows={3}
            value={descricao}
            onChange={(e) => {
              setDescricao(e.target.value);
              if (erros.description) setErros((prev) => ({ ...prev, description: "" }));
            }}
            disabled={ocupado}
            placeholder="Descrição do produto..."
            maxLength={5000}
            className={`w-full rounded-[27px] bg-white px-6 py-3.5 text-sm font-light text-black shadow-xs outline-none border transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-[#6A38F3] ${
              erros.description ? "border-red-500 ring-2 ring-red-500/30" : "border-transparent"
            }`}
          />
          {erros.description && (
            <p className="text-xs font-semibold text-red-600 px-4">{erros.description}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="produto-preco" className="text-xs font-semibold text-black/70 px-3">
            Preço do produto (R$) <span className="text-[#6A38F3]">*</span>
          </label>
          <input
            id="produto-preco"
            type="text"
            inputMode="decimal"
            value={precoTexto}
            onChange={(e) => {
              setPrecoTexto(e.target.value);
              if (erros.price) setErros((prev) => ({ ...prev, price: "" }));
            }}
            disabled={ocupado}
            placeholder="Ex: 149,90"
            className={`w-full rounded-full bg-white px-6 py-3 text-base font-light text-black shadow-xs outline-none border transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-[#6A38F3] ${
              erros.price ? "border-red-500 ring-2 ring-red-500/30" : "border-transparent"
            }`}
          />
          {erros.price && <p className="text-xs font-semibold text-red-600 px-4">{erros.price}</p>}
        </div>

        <StepperEstoqueProduto
          estoque={estoque}
          erro={erros.stock}
          ocupado={ocupado}
          onChange={(val) => {
            setEstoque(val);
            if (erros.stock) setErros((prev) => ({ ...prev, stock: "" }));
          }}
        />

        <div className="pt-2 space-y-3">
          <BotaoDeletarConfirmacao
            idDialogo="titulo-confirmar-exclusao-produto"
            textoConfirmacao={`Tem certeza que deseja excluir "${produto.name}" permanentemente?`}
            confirmando={confirmandoExclusao}
            ocupado={ocupado}
            deletando={deletando}
            textoDeletando="Deletando produto..."
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
