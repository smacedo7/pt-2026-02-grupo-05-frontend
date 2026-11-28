"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  BannerErroModal,
  BotaoDeletarConfirmacao,
  ModalBase,
} from "@/components/ui/ModalBase";
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

type ImagemRascunho = {
  id?: number;
  imageUrl: string;
};

const MAX_FOTOS = 3;
const URL_REGEX = /^https?:\/\/.+/i;

function formatarPrecoInput(valor: number): string {
  return Number.isFinite(valor) ? valor.toFixed(2).replace(".", ",") : "0,00";
}

function parsearPreco(texto: string): number {
  const limpo = texto.replace(/[^\d.,]/g, "").replace(",", ".");
  const parsed = Number(limpo);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : Number.NaN;
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
  const [erroGeral, setErroGeral] = useState<string | null>(null);

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
    const limpa = novaUrlImagem.trim();
    if (!limpa) return;

    if (imagens.length >= MAX_FOTOS) {
      setErros((prev) => ({
        ...prev,
        images: `Você pode anexar no máximo ${MAX_FOTOS} fotos por produto.`,
      }));
      return;
    }

    if (!URL_REGEX.test(limpa) || limpa.length > 255) {
      setErros((prev) => ({
        ...prev,
        images: "Informe uma URL válida (http:// ou https://) com até 255 caracteres.",
      }));
      return;
    }

    setImagens((prev) => [...prev, { imageUrl: limpa }]);
    setNovaUrlImagem("");
    if (erros.images) setErros((prev) => ({ ...prev, images: "" }));
  }

  function removerImagem(indice: number) {
    setImagens((prev) => prev.filter((_, i) => i !== indice));
    if (erros.images) setErros((prev) => ({ ...prev, images: "" }));
  }

  function validarCampos(): { valido: boolean; precoNumero: number } {
    const novosErros: Record<string, string> = {};

    const nomeTrim = nome.trim();
    if (!nomeTrim) novosErros.name = "O nome do produto é obrigatório.";
    else if (nomeTrim.length > 255)
      novosErros.name = "O nome não pode exceder 255 caracteres.";

    if (!categoriaId || Number.isNaN(categoriaId)) {
      novosErros.categoryId = "Selecione uma categoria válida.";
    }

    if (descricao && descricao.length > 5000) {
      novosErros.description = "A descrição não pode ter mais de 5000 caracteres.";
    }

    const precoNumero = parsearPreco(precoTexto);
    if (Number.isNaN(precoNumero) || precoNumero < 0 || precoNumero > 999999.99) {
      novosErros.price = "Informe um preço válido entre R$ 0,00 e R$ 999.999,99.";
    }

    if (!Number.isInteger(estoque) || estoque < 0 || estoque > 2147483647) {
      novosErros.stock = "Informe uma quantidade de estoque válida (0 ou maior).";
    }

    if (novaUrlImagem.trim()) {
      novosErros.images =
        'Clique em "Adicionar" para incluir a URL digitada ou limpe o campo.';
    }

    setErros(novosErros);
    return { valido: Object.keys(novosErros).length === 0, precoNumero };
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
    setErroGeral(null);

    const { valido, precoNumero } = validarCampos();
    if (!valido) return;

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
      if (resultado.tipo === "validacao") {
        setErroGeral(resultado.mensagem);
        if (resultado.campos) setErros((prev) => ({ ...prev, ...resultado.campos }));
      } else if (resultado.tipo === "proibido") {
        setErroGeral(resultado.mensagem);
      } else if (resultado.tipo === "nao-autorizado") {
        setErroGeral("Sessão expirada. Faça login novamente para editar este produto.");
      } else if (resultado.tipo === "nao-encontrado") {
        setErroGeral("Este produto não foi encontrado no servidor.");
      } else if (resultado.tipo === "conflito") {
        setErroGeral("O produto foi alterado simultaneamente. Tente novamente.");
      } else if (resultado.tipo === "conexao") {
        setErroGeral("Não foi possível conectar ao servidor.");
      } else {
        setErroGeral(resultado.mensagem || "Ocorreu um erro ao salvar o produto.");
      }
      return;
    }

    try {
      await sincronizarImagensProduto();
    } catch {
      setSalvando(false);
      setErroGeral(
        "Os dados do produto foram salvos, mas houve erro ao atualizar as imagens. Verifique as URLs e tente novamente."
      );
      return;
    }

    const detalhe = await buscarDetalheProduto(produto.id);
    setSalvando(false);
    aoSalvar(detalhe ?? resultado.produto);
    aoFechar();
  }

  async function handleConfirmarExclusao() {
    setErroGeral(null);
    setDeletando(true);
    const resultado = await deletarProduto(produto.id);
    setDeletando(false);

    if (resultado.tipo === "sucesso") {
      aoFechar();
      aoDeletar(produto.id);
      return;
    }

    setConfirmandoExclusao(false);
    if (resultado.tipo === "proibido") setErroGeral(resultado.mensagem);
    else if (resultado.tipo === "nao-autorizado")
      setErroGeral("Sessão expirada. Faça login novamente para deletar este produto.");
    else if (resultado.tipo === "nao-encontrado")
      setErroGeral("Este produto não foi encontrado ou já foi removido.");
    else if (resultado.tipo === "conflito")
      setErroGeral("Conflito ao tentar remover o produto. Tente novamente.");
    else if (resultado.tipo === "conexao")
      setErroGeral("Não foi possível conectar ao servidor.");
    else setErroGeral(resultado.mensagem || "Não foi possível deletar o produto.");
  }

  return (
    <ModalBase
      tituloId="titulo-modal-editar-produto"
      titulo="Editar Produto"
      ocupado={ocupado}
      aoFechar={aoFechar}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <BannerErroModal mensagem={erroGeral} />

        {/* Bloco de Fotos do Produto (até 3 URLs via /products/:productId/images) */}
        <div className="space-y-3">
          <div
            className={`rounded-[10px] border-2 border-dashed bg-white/80 p-4 transition-colors ${
              erros.images ? "border-red-500 bg-red-50/40" : "border-[#6A38F3]"
            }`}
          >
            <div className="flex flex-col items-center text-center gap-1.5 mb-3">
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
              <label htmlFor="produto-nova-imagem" className="text-sm font-medium text-black">
                Anexe as fotos do seu produto ({imagens.length}/{MAX_FOTOS})
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="produto-nova-imagem"
                type="url"
                value={novaUrlImagem}
                onChange={(e) => {
                  setNovaUrlImagem(e.target.value);
                  if (erros.images) setErros((prev) => ({ ...prev, images: "" }));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    adicionarImagem();
                  }
                }}
                disabled={ocupado || imagens.length >= MAX_FOTOS}
                placeholder={
                  imagens.length >= MAX_FOTOS
                    ? "Limite de 3 fotos atingido"
                    : "https://exemplo.com/foto-produto.png"
                }
                className="flex-1 rounded-full bg-white px-4 py-2 text-xs text-[#171a17] shadow-xs outline-none border border-black/15 transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-[#6A38F3] disabled:opacity-60"
              />
              <button
                type="button"
                onClick={adicionarImagem}
                disabled={ocupado || imagens.length >= MAX_FOTOS || !novaUrlImagem.trim()}
                className="shrink-0 rounded-full bg-[#6A38F3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#5c2de0] transition-colors cursor-pointer disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
            {erros.images && (
              <p className="text-xs font-semibold text-red-600 px-2 mt-1.5">{erros.images}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: MAX_FOTOS }).map((_, indice) => {
              const item = imagens[indice];
              return (
                <div
                  key={indice}
                  className="relative aspect-square rounded-2xl border border-black/10 bg-white overflow-hidden flex items-center justify-center shadow-xs"
                >
                  {item ? (
                    <>
                      <Image
                        src={item.imageUrl}
                        alt={`Foto ${indice + 1} do produto`}
                        fill
                        unoptimized
                        className="object-contain p-1.5"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removerImagem(indice)}
                        disabled={ocupado}
                        aria-label={`Remover foto ${indice + 1}`}
                        title="Remover foto"
                        className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/70 text-white text-xs font-bold flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-medium text-black/35">Foto {indice + 1}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

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

        {/* Stepper de Estoque (- [quantidade] +) conforme Figma */}
        <div className="flex flex-col items-center gap-1 pt-2">
          <span className="text-xs font-semibold text-black/70">Quantidade em estoque</span>
          <div className="flex items-center justify-center gap-8 py-2">
            <button
              type="button"
              onClick={() => {
                setEstoque((prev) => Math.max(0, prev - 1));
                if (erros.stock) setErros((prev) => ({ ...prev, stock: "" }));
              }}
              disabled={ocupado || estoque <= 0}
              aria-label="Diminuir estoque"
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#6A38F3] text-2xl font-bold text-[#6A38F3] hover:bg-[#6A38F3] hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
            >
              −
            </button>

            <input
              aria-label="Quantidade em estoque"
              type="number"
              min={0}
              max={2147483647}
              value={estoque}
              onChange={(e) => {
                const val = Number.parseInt(e.target.value, 10);
                setEstoque(Number.isNaN(val) ? 0 : Math.max(0, val));
                if (erros.stock) setErros((prev) => ({ ...prev, stock: "" }));
              }}
              disabled={ocupado}
              className="w-24 text-center text-4xl font-normal text-[#6A38F3] bg-transparent outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />

            <button
              type="button"
              onClick={() => {
                setEstoque((prev) => prev + 1);
                if (erros.stock) setErros((prev) => ({ ...prev, stock: "" }));
              }}
              disabled={ocupado}
              aria-label="Aumentar estoque"
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#6A38F3] text-2xl font-bold text-[#6A38F3] hover:bg-[#6A38F3] hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
            >
              +
            </button>
          </div>
          {erros.stock && <p className="text-xs font-semibold text-red-600">{erros.stock}</p>}
        </div>

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
