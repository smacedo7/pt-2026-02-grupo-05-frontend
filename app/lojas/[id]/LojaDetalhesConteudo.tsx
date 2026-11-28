"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Navbar from "@/components/navbar/Navbar";
import CardProdutoLoja from "@/components/loja/CardProdutoLoja";
import ModalCriarAvaliacao from "@/components/loja/ModalCriarAvaliacao";
import ModalCriarProduto from "@/components/loja/ModalCriarProduto";
import ModalEditarAvaliacao from "@/components/loja/ModalEditarAvaliacao";
import ModalEditarComentario from "@/components/loja/ModalEditarComentario";
import ModalEditarLoja from "@/components/loja/ModalEditarLoja";
import ModalEditarProduto from "@/components/loja/ModalEditarProduto";
import SecaoAvaliacoesLoja from "@/components/loja/SecaoAvaliacoesLoja";
import {
  criarComentario,
  listarAvaliacoesLoja,
  listarComentariosAvaliacaoLoja,
} from "@/lib/avaliacoes/avaliacoesApi";
import type {
  AvaliacaoLoja,
  ComentarioAvaliacao,
} from "@/lib/avaliacoes/tipos";
import { buscarLoja, obterTokenAutenticado } from "@/lib/lojas/lojasApi";
import type { Loja } from "@/lib/lojas/tipos";
import { listarProdutosDaLoja } from "@/lib/produtos/listarProdutosDaLoja";
import type { ProdutoLoja } from "@/lib/produtos/tipos";
import { api } from "@/lib/api";

type Props = {
  lojaId: number;
};

const ITENS_POR_PAGINA = 10;
const LIMITE_PRODUTOS = 50; // o padrão de GET /products
const CLASSE_BOTAO_DONO =
  "inline-flex items-center gap-2 rounded-full bg-[#6A38F3] px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg hover:bg-[#5c2de0] transition-colors focus-visible:outline-2 focus-visible:outline-[#C6E700] cursor-pointer";

function BotaoAdicionarProduto({ aoClicar }: { aoClicar: () => void }) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      aria-label="Adicionar produto"
      title="Adicionar produto"
      className={CLASSE_BOTAO_DONO}
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        aria-hidden="true"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      <span>Adicionar Produto</span>
    </button>
  );
}

function AcoesDonoLoja({
  aoEditarLoja,
  aoAdicionarProduto,
}: {
  aoEditarLoja: () => void;
  aoAdicionarProduto: () => void;
}) {
  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={aoEditarLoja}
        aria-label="Editar informações da loja"
        title="Editar informações da loja"
        className={CLASSE_BOTAO_DONO}
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        <span>Editar Loja</span>
      </button>

      <BotaoAdicionarProduto aoClicar={aoAdicionarProduto} />
    </div>
  );
}

export default function LojaDetalhesConteudo({ lojaId }: Props) {
  const router = useRouter();

  const [loja, setLoja] = useState<Loja | null>(null);
  const [produtos, setProdutos] = useState<ProdutoLoja[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoLoja[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [usuarioLogado, setUsuarioLogado] = useState<{
    id: number;
    name?: string;
  } | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalCriarProdutoAberto, setModalCriarProdutoAberto] = useState(false);
  const [modalCriarAvaliacaoAberto, setModalCriarAvaliacaoAberto] =
    useState(false);
  const [produtoEditando, setProdutoEditando] = useState<ProdutoLoja | null>(null);
  const [avaliacaoEditando, setAvaliacaoEditando] =
    useState<AvaliacaoLoja | null>(null);
  const [comentarioEditando, setComentarioEditando] =
    useState<ComentarioAvaliacao | null>(null);
  const [comentariosPorAvaliacao, setComentariosPorAvaliacao] = useState<
    Record<number, ComentarioAvaliacao[]>
  >({});
  const [paginaAtual, setPaginaAtual] = useState(1);
  // Falha na consulta não é loja sem produtos: a vitrine mostra o erro.
  const [erroProdutos, setErroProdutos] = useState(false);
  const [recarregandoProdutos, setRecarregandoProdutos] = useState(false);
  const [bannerComErro, setBannerComErro] = useState<string | null>(null);
  const [logoComErro, setLogoComErro] = useState<string | null>(null);
  const [stickerComErro, setStickerComErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function carregarDados() {
      setCarregando(true);
      setErro(null);
      setErroProdutos(false);

      if (Number.isNaN(lojaId)) {
        setErro("Identificador de loja inválido.");
        setCarregando(false);
        return;
      }

      const token = obterTokenAutenticado();
      const [usuarioRes, resLoja, avaliacoesRes, resProdutos] =
        await Promise.all([
          token
            ? api
                .get<{ id: number; name?: string }>("/users/me", {
                  headers: { Authorization: `Bearer ${token}` },
                })
                .then((r) => r.data)
                .catch(() => null)
            : Promise.resolve(null),
          buscarLoja(lojaId),
          listarAvaliacoesLoja(lojaId),
          listarProdutosDaLoja(lojaId, LIMITE_PRODUTOS),
        ]);

      if (cancelado) return;

      if (usuarioRes && typeof usuarioRes.id === "number") {
        setUsuarioLogado(usuarioRes);
      }

      if (resLoja.tipo === "sucesso") {
        setLoja(resLoja.loja);
        setAvaliacoes(avaliacoesRes.ratings);

        // Os produtos já trazem a imagem principal (imageUrl) na listagem.
        const comentariosResultados = await Promise.allSettled(
          avaliacoesRes.ratings.map((r) => listarComentariosAvaliacaoLoja(r.id))
        );
        if (cancelado) return;

        setProdutos(resProdutos.tipo === "ok" ? resProdutos.produtos : []);
        setErroProdutos(resProdutos.tipo === "erro");

        const mapaComentarios: Record<number, ComentarioAvaliacao[]> = {};
        avaliacoesRes.ratings.forEach((r, idx) => {
          const resCom = comentariosResultados[idx];
          mapaComentarios[r.id] =
            resCom.status === "fulfilled" ? resCom.value : [];
        });
        setComentariosPorAvaliacao(mapaComentarios);
      } else if (resLoja.tipo === "nao-encontrado") {
        setErro("Loja não encontrada.");
      } else if (resLoja.tipo === "conexao") {
        setErro(
          "Não foi possível conectar ao servidor. Verifique sua conexão ou inicie o backend."
        );
      } else {
        setErro(resLoja.mensagem || "Não foi possível carregar os dados da loja.");
      }

      setCarregando(false);
    }

    carregarDados();
    return () => {
      cancelado = true;
    };
  }, [lojaId]);

  const ehDono = Boolean(usuarioLogado && loja && usuarioLogado.id === loja.userId);
  const bannerValido = Boolean(loja?.bannerUrl && bannerComErro !== loja.bannerUrl);
  const logoValida = Boolean(loja?.logoUrl && logoComErro !== loja.logoUrl);
  const stickerValido = Boolean(loja?.stickerUrl && stickerComErro !== loja.stickerUrl);

  const mediaAvaliacoes = useMemo(() => {
    if (avaliacoes.length === 0) return null;
    const soma = avaliacoes.reduce((acc, item) => acc + item.rating, 0);
    return Math.round((soma / avaliacoes.length) * 100) / 100;
  }, [avaliacoes]);

  const produtosDestaque = useMemo(() => produtos.slice(0, 5), [produtos]);
  const totalPaginas = Math.max(1, Math.ceil(produtos.length / ITENS_POR_PAGINA));
  const produtosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return produtos.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [produtos, paginaAtual]);

  async function recarregarProdutos() {
    setRecarregandoProdutos(true);
    const resultado = await listarProdutosDaLoja(lojaId, LIMITE_PRODUTOS);
    if (resultado.tipo === "ok") {
      setProdutos(resultado.produtos);
      setPaginaAtual(1);
    }
    setErroProdutos(resultado.tipo === "erro");
    setRecarregandoProdutos(false);
  }

  function aoSalvarLoja(lojaAtualizada: Loja) {
    setLoja(lojaAtualizada);
    toast.success("Informações da loja atualizadas com sucesso!");
  }

  function aoDeletarLoja() {
    toast.success("Loja excluída com sucesso!");
    router.push("/");
  }

  function aoCriarProduto(produtoCriado: ProdutoLoja) {
    setProdutos((prev) => [produtoCriado, ...prev]);
    setPaginaAtual(1);
    toast.success(`Produto "${produtoCriado.name}" adicionado com sucesso!`);
    // Sem a lista completa, só o produto novo daria uma vitrine incompleta.
    if (erroProdutos) recarregarProdutos();
  }

  function aoSalvarProduto(produtoAtualizado: ProdutoLoja) {
    setProdutos((prev) =>
      prev.map((item) => (item.id === produtoAtualizado.id ? produtoAtualizado : item))
    );
    toast.success("Produto atualizado com sucesso!");
  }

  function aoDeletarProduto(produtoId: number) {
    setProdutos((prev) => {
      const filtrados = prev.filter((item) => item.id !== produtoId);
      const novoTotalPaginas = Math.max(1, Math.ceil(filtrados.length / ITENS_POR_PAGINA));
      setPaginaAtual((atual) => Math.min(atual, novoTotalPaginas));
      return filtrados;
    });
    toast.success("Produto excluído com sucesso!");
  }

  function aoCriarAvaliacao(novaAvaliacao: AvaliacaoLoja) {
    setAvaliacoes((prev) => [novaAvaliacao, ...prev]);
    setComentariosPorAvaliacao((prev) => ({ ...prev, [novaAvaliacao.id]: [] }));
    toast.success("Avaliação publicada com sucesso!");
  }

  function aoSalvarAvaliacao(avaliacaoAtualizada: AvaliacaoLoja) {
    setAvaliacoes((prev) =>
      prev.map((item) =>
        item.id === avaliacaoAtualizada.id ? avaliacaoAtualizada : item
      )
    );
    toast.success("Avaliação atualizada com sucesso!");
  }

  function aoDeletarAvaliacao(avaliacaoId: number) {
    setAvaliacoes((prev) => prev.filter((item) => item.id !== avaliacaoId));
    setComentariosPorAvaliacao((prev) => {
      const proximo = { ...prev };
      delete proximo[avaliacaoId];
      return proximo;
    });
    toast.success("Avaliação excluída com sucesso!");
  }

  async function aoEnviarComentario(
    storeRatingId: number,
    conteudo: string
  ): Promise<string | null> {
    const res = await criarComentario({ storeRatingId, content: conteudo });
    if (res.tipo === "sucesso") {
      setComentariosPorAvaliacao((prev) => ({
        ...prev,
        [storeRatingId]: [...(prev[storeRatingId] ?? []), res.comentario],
      }));
      toast.success("Comentário publicado!");
      return null;
    }
    if (res.tipo === "nao-autorizado") {
      return "Sessão expirada. Faça login novamente para comentar.";
    }
    if (res.tipo === "conexao") {
      return "Não foi possível conectar ao servidor.";
    }
    return "mensagem" in res && res.mensagem
      ? res.mensagem
      : "Não foi possível enviar o comentário.";
  }

  function atualizarComentarioNaLista(
    lista: ComentarioAvaliacao[],
    atualizado: ComentarioAvaliacao
  ): ComentarioAvaliacao[] {
    return lista.map((item) =>
      item.id === atualizado.id
        ? { ...atualizado, replies: item.replies ?? atualizado.replies }
        : {
            ...item,
            replies: item.replies
              ? atualizarComentarioNaLista(item.replies, atualizado)
              : undefined,
          }
    );
  }

  function removerComentarioDaLista(
    lista: ComentarioAvaliacao[],
    comentarioId: number
  ): ComentarioAvaliacao[] {
    return lista
      .filter((item) => item.id !== comentarioId)
      .map((item) => ({
        ...item,
        replies: item.replies
          ? removerComentarioDaLista(item.replies, comentarioId)
          : undefined,
      }));
  }

  function aoSalvarComentario(comentarioAtualizado: ComentarioAvaliacao) {
    setComentariosPorAvaliacao((prev) => {
      const proximo: Record<number, ComentarioAvaliacao[]> = {};
      for (const [k, lista] of Object.entries(prev)) {
        proximo[Number(k)] = atualizarComentarioNaLista(lista, comentarioAtualizado);
      }
      return proximo;
    });
    toast.success("Comentário atualizado com sucesso!");
  }

  function aoDeletarComentario(comentarioId: number) {
    setComentariosPorAvaliacao((prev) => {
      const proximo: Record<number, ComentarioAvaliacao[]> = {};
      for (const [k, lista] of Object.entries(prev)) {
        proximo[Number(k)] = removerComentarioDaLista(lista, comentarioId);
      }
      return proximo;
    });
    toast.success("Comentário excluído com sucesso!");
  }

  return (
    <div className="min-h-screen bg-[#F6F3E4] text-[#000000] flex flex-col">
      <Navbar />

      {carregando && (
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center px-4">
          <svg
            className="h-10 w-10 animate-spin text-[#6A38F3]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="mt-4 text-base font-medium text-black/70">Carregando loja...</p>
        </div>
      )}

      {erro && !carregando && (
        <div className="mx-auto max-w-2xl px-4 py-16 w-full">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <h2 className="text-xl font-bold text-red-900">Ops! Algo deu errado</h2>
            <p className="mt-2 text-sm text-red-700">{erro}</p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-full bg-[#171a17] px-6 py-2.5 text-sm font-bold text-white hover:bg-black transition-colors"
            >
              Ir para a Página Inicial
            </Link>
          </div>
        </div>
      )}

      {loja && !carregando && (
        <main className="flex-1 flex flex-col">
          {/* 1. Hero Banner da Loja conforme Figma Loja (Logado) */}
          <section className="relative flex w-full min-h-[360px] flex-col sm:min-h-[440px] md:min-h-[500px] bg-[#171a17] overflow-hidden">
            {bannerValido && loja.bannerUrl ? (
              <Image
                src={loja.bannerUrl}
                alt={`Banner de capa da loja ${loja.name}`}
                fill
                unoptimized
                priority
                onError={() => setBannerComErro(loja.bannerUrl)}
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-radial from-[#2a1a4a] to-[#0d0d0d]" />
            )}

            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.49) 58%, rgba(0, 0, 0, 0.9) 100%)",
              }}
            />

            {/* Altura mínima: nome e descrição longos aumentam o banner em vez de serem cortados. */}
            <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between gap-4 px-4 sm:px-8 py-6">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full bg-black/40 px-4 py-1.5 text-xs sm:text-sm font-medium text-[#F6F3E4] backdrop-blur-xs hover:bg-black/60 transition-colors"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Voltar
                </Link>

                {ehDono && (
                  <AcoesDonoLoja
                    aoEditarLoja={() => setModalEditarAberto(true)}
                    aoAdicionarProduto={() => setModalCriarProdutoAberto(true)}
                  />
                )}
              </div>

              <div className="flex flex-col items-center text-center my-auto px-4">
                {(loja.logoUrl || stickerValido) && (
                  <div className="relative mb-4 flex items-center justify-center">
                    {loja.logoUrl && (
                      <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden border-2 border-[#F6F3E4]/80 shadow-xl bg-white/10 flex items-center justify-center">
                        {logoValida ? (
                          <Image
                            src={loja.logoUrl}
                            alt={`Logo da loja ${loja.name}`}
                            fill
                            unoptimized
                            onError={() => setLogoComErro(loja.logoUrl)}
                            className="object-cover"
                          />
                        ) : (
                          <span aria-hidden="true" className="text-2xl font-bold text-[#F6F3E4]">
                            {loja.name.trim().charAt(0).toUpperCase() || "L"}
                          </span>
                        )}
                      </div>
                    )}
                    {stickerValido && loja.stickerUrl && (
                      <div
                        className={`relative h-10 w-10 rounded-full bg-white p-1 shadow-md overflow-hidden ${
                          loja.logoUrl ? "-ml-4 mt-12" : ""
                        }`}
                      >
                        <Image
                          src={loja.stickerUrl}
                          alt="Selo da loja"
                          fill
                          unoptimized
                          onError={() => setStickerComErro(loja.stickerUrl)}
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                )}

                <h1 className="w-full break-words text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F6F3E4] drop-shadow-md">
                  {loja.name}
                </h1>

                {loja.category?.name && (
                  <p className="mt-2 text-lg sm:text-2xl font-light lowercase tracking-wide text-[#F6F3E4]/90">
                    {loja.category.name}
                  </p>
                )}

                {loja.description && (
                  <p className="mt-3 max-w-2xl text-xs sm:text-sm font-light text-[#F6F3E4]/80 line-clamp-2">
                    {loja.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end">
                <span className="text-xs sm:text-sm font-light text-white/90">
                  {ehDono && usuarioLogado?.name ? (
                    <>
                      by <span className="underline">{usuarioLogado.name}</span>
                    </>
                  ) : (
                    <>Cadastrada em {new Date(loja.createdAt).toLocaleDateString("pt-BR")}</>
                  )}
                </span>
              </div>
            </div>
          </section>

          {/* 2. Seção Preta "Reviews e Comentários" */}
          <SecaoAvaliacoesLoja
            nomeLoja={loja.name}
            donoLojaId={loja.userId}
            avaliacoes={avaliacoes}
            comentariosPorAvaliacao={comentariosPorAvaliacao}
            mediaAvaliacoes={mediaAvaliacoes}
            usuarioLogadoId={usuarioLogado?.id ?? null}
            aoAdicionarAvaliacao={() => setModalCriarAvaliacaoAberto(true)}
            aoEditarAvaliacao={setAvaliacaoEditando}
            aoEnviarComentario={aoEnviarComentario}
            aoEditarComentario={setComentarioEditando}
          />

          {/* 3. Vitrine de Produtos */}
          <section className="w-full bg-[#F6F3E4] py-12 sm:py-16 flex-1">
            <div className="mx-auto max-w-7xl px-4 sm:px-8 space-y-14">
              {erroProdutos ? (
                <div
                  role="alert"
                  className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center"
                >
                  <p className="text-sm font-medium text-red-800">
                    Não foi possível carregar os produtos desta loja.
                  </p>
                  <button
                    type="button"
                    onClick={recarregarProdutos}
                    disabled={recarregandoProdutos}
                    className={`mt-4 ${CLASSE_BOTAO_DONO} disabled:cursor-default disabled:opacity-60`}
                  >
                    {recarregandoProdutos ? "Carregando..." : "Tentar novamente"}
                  </button>
                </div>
              ) : (
                <>
                  {produtos.length > 0 && (
                    <div>
                      <div className="flex items-baseline justify-between mb-6">
                        <h2 className="text-2xl sm:text-3xl font-medium text-black">
                          Produtos{" "}
                          <span className="text-sm sm:text-base font-normal text-black/80 lowercase">
                            melhor avaliados
                          </span>
                        </h2>
                        {produtos.length > 5 && (
                          <a
                            href="#todos-produtos-loja"
                            className="text-sm font-medium text-[#6A38F3] hover:underline"
                          >
                            ver mais
                          </a>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {produtosDestaque.map((produto) => (
                          <CardProdutoLoja
                            key={`destaque-${produto.id}`}
                            produto={produto}
                            ehDono={ehDono}
                            aoEditar={setProdutoEditando}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div id="todos-produtos-loja">
                    <div className="flex items-baseline justify-between mb-6">
                      <h2 className="text-2xl sm:text-3xl font-medium text-black">
                        Produtos{" "}
                        <span className="text-sm sm:text-base font-normal text-black/80 lowercase">
                          de {loja.name}
                        </span>
                      </h2>
                      <span className="text-xs font-semibold text-black/60">
                        {produtos.length} {produtos.length === 1 ? "item" : "itens"}
                      </span>
                    </div>

                    {produtos.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-black/20 bg-white/60 p-8 text-center">
                        <p className="text-sm font-medium text-black/70">
                          Vitrine vazia. Novos produtos adicionados à loja aparecerão aqui.
                        </p>
                        {ehDono && (
                          <div className="mt-4 flex justify-center">
                            <BotaoAdicionarProduto aoClicar={() => setModalCriarProdutoAberto(true)} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                          {produtosPaginados.map((produto) => (
                            <CardProdutoLoja
                              key={`grade-${produto.id}`}
                              produto={produto}
                              ehDono={ehDono}
                              aoEditar={setProdutoEditando}
                            />
                          ))}
                        </div>

                        {totalPaginas > 1 && (
                          <nav
                            aria-label="Paginação de produtos da loja"
                            className="mt-10 flex items-center justify-center gap-6"
                          >
                            <button
                              type="button"
                              onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                              disabled={paginaAtual === 1}
                              aria-label="Página anterior"
                              className="p-2 text-black disabled:opacity-30 hover:text-[#6A38F3] transition-colors cursor-pointer disabled:cursor-default"
                            >
                              <svg
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2.5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="15 18 9 12 15 6" />
                              </svg>
                            </button>

                            <div className="flex items-center gap-5">
                              {Array.from({ length: totalPaginas }).map((_, idx) => {
                                const num = idx + 1;
                                const ativa = num === paginaAtual;
                                return (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => setPaginaAtual(num)}
                                    aria-current={ativa ? "page" : undefined}
                                    className={`text-2xl sm:text-3xl font-medium transition-colors cursor-pointer ${
                                      ativa
                                        ? "text-[#6A38F3] underline underline-offset-4"
                                        : "text-black/70 hover:text-black"
                                    }`}
                                  >
                                    {num}
                                  </button>
                                );
                              })}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setPaginaAtual((p) => Math.min(totalPaginas, p + 1))
                              }
                              disabled={paginaAtual === totalPaginas}
                              aria-label="Próxima página"
                              className="p-2 text-black disabled:opacity-30 hover:text-[#6A38F3] transition-colors cursor-pointer disabled:cursor-default"
                            >
                              <svg
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2.5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </button>
                          </nav>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>

          <ModalEditarLoja
            loja={loja}
            aberto={modalEditarAberto}
            aoFechar={() => setModalEditarAberto(false)}
            aoSalvar={aoSalvarLoja}
            aoDeletar={aoDeletarLoja}
          />
          <ModalCriarProduto
            storeId={loja.id}
            storeCategoryId={loja.categoryId}
            aberto={modalCriarProdutoAberto}
            aoFechar={() => setModalCriarProdutoAberto(false)}
            aoCriar={aoCriarProduto}
          />
          <ModalEditarProduto
            produto={produtoEditando}
            aberto={Boolean(produtoEditando)}
            aoFechar={() => setProdutoEditando(null)}
            aoSalvar={aoSalvarProduto}
            aoDeletar={aoDeletarProduto}
          />
          <ModalCriarAvaliacao
            tipo="loja"
            alvoId={loja.id}
            nomeAlvo={loja.name}
            aberto={modalCriarAvaliacaoAberto}
            aoFechar={() => setModalCriarAvaliacaoAberto(false)}
            aoCriar={aoCriarAvaliacao}
          />
          <ModalEditarAvaliacao
            avaliacao={avaliacaoEditando}
            nomeLoja={loja.name}
            aberto={Boolean(avaliacaoEditando)}
            aoFechar={() => setAvaliacaoEditando(null)}
            aoSalvar={aoSalvarAvaliacao}
            aoDeletar={aoDeletarAvaliacao}
          />
          <ModalEditarComentario
            comentario={comentarioEditando}
            aberto={Boolean(comentarioEditando)}
            aoFechar={() => setComentarioEditando(null)}
            aoSalvar={aoSalvarComentario}
            aoDeletar={aoDeletarComentario}
          />
        </main>
      )}
    </div>
  );
}
