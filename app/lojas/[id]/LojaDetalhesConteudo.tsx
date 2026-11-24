"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import CardProdutoLoja from "@/components/loja/CardProdutoLoja";
import ModalEditarLoja from "@/components/loja/ModalEditarLoja";
import ModalEditarProduto from "@/components/loja/ModalEditarProduto";
import { buscarLoja, obterTokenAutenticado } from "@/lib/lojas/lojasApi";
import type { Loja } from "@/lib/lojas/tipos";
import { listarImagensProduto } from "@/lib/produtos/produtosApi";
import type { ProdutoLoja } from "@/lib/produtos/tipos";
import { api } from "@/lib/api";

type Props = {
  lojaId: number;
};

const ITENS_POR_PAGINA = 10;

function EstrelasDecorativas() {
  return (
    <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="h-6 w-6 text-[#C6E700]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function LojaDetalhesConteudo({ lojaId }: Props) {
  const router = useRouter();

  const [loja, setLoja] = useState<Loja | null>(null);
  const [produtos, setProdutos] = useState<ProdutoLoja[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [usuarioLogado, setUsuarioLogado] = useState<{
    id: number;
    name?: string;
  } | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<ProdutoLoja | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);

  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let cancelado = false;

    async function carregarDados() {
      setCarregando(true);
      setErro(null);

      if (Number.isNaN(lojaId)) {
        setErro("Identificador de loja inválido.");
        setCarregando(false);
        return;
      }

      const token = obterTokenAutenticado();
      const [usuarioRes, resLoja, produtosRes] = await Promise.all([
        token
          ? api
              .get<{ id: number; name?: string }>("/users/me", {
                headers: { Authorization: `Bearer ${token}` },
              })
              .then((r) => r.data)
              .catch(() => null)
          : Promise.resolve(null),
        buscarLoja(lojaId),
        api
          .get<ProdutoLoja[]>("/products", { params: { storeId: lojaId } })
          .then((r) => (Array.isArray(r.data) ? r.data : []))
          .catch(() => [] as ProdutoLoja[]),
      ]);

      if (cancelado) return;

      if (usuarioRes && typeof usuarioRes.id === "number") {
        setUsuarioLogado(usuarioRes);
      }

      if (resLoja.tipo === "sucesso") {
        setLoja(resLoja.loja);

        const imagensResultados = await Promise.allSettled(
          produtosRes.map((p) => listarImagensProduto(p.id))
        );
        if (cancelado) return;

        setProdutos(
          produtosRes.map((p, idx) => {
            const resImg = imagensResultados[idx];
            return {
              ...p,
              images: resImg.status === "fulfilled" ? resImg.value : [],
            };
          })
        );
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
  const produtosDestaque = useMemo(() => produtos.slice(0, 5), [produtos]);
  const totalPaginas = Math.max(1, Math.ceil(produtos.length / ITENS_POR_PAGINA));
  const produtosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return produtos.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [produtos, paginaAtual]);

  function mostrarFeedback(mensagem: string) {
    setMensagemSucesso(mensagem);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      setMensagemSucesso(null);
    }, 5000);
  }

  function aoSalvarLoja(lojaAtualizada: Loja) {
    setLoja(lojaAtualizada);
    mostrarFeedback("Informações da loja atualizadas com sucesso!");
  }

  function aoDeletarLoja() {
    router.push("/");
  }

  function aoSalvarProduto(produtoAtualizado: ProdutoLoja) {
    setProdutos((prev) =>
      prev.map((item) => (item.id === produtoAtualizado.id ? produtoAtualizado : item))
    );
    mostrarFeedback("Produto atualizado com sucesso!");
  }

  function aoDeletarProduto(produtoId: number) {
    setProdutos((prev) => {
      const filtrados = prev.filter((item) => item.id !== produtoId);
      const novoTotalPaginas = Math.max(1, Math.ceil(filtrados.length / ITENS_POR_PAGINA));
      setPaginaAtual((atual) => Math.min(atual, novoTotalPaginas));
      return filtrados;
    });
    mostrarFeedback("Produto excluído com sucesso!");
  }

  return (
    <div className="min-h-screen bg-[#F6F3E4] text-[#000000] flex flex-col">
      <Navbar />

      {mensagemSucesso && (
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 pt-4">
          <div
            role="status"
            className="rounded-2xl border border-green-300 bg-green-100 p-4 text-sm font-medium text-green-900 shadow-sm flex items-center justify-between"
          >
            <span>{mensagemSucesso}</span>
            <button
              type="button"
              onClick={() => setMensagemSucesso(null)}
              className="text-green-700 hover:text-green-900 font-bold text-sm px-2 cursor-pointer"
              aria-label="Fechar aviso"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {carregando && (
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center px-4">
          <p className="text-base font-medium text-black/70">Carregando loja...</p>
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
          <section className="relative w-full h-[360px] sm:h-[440px] md:h-[500px] bg-[#171a17] overflow-hidden">
            {loja.bannerUrl ? (
              <Image
                src={loja.bannerUrl}
                alt={`Banner de capa da loja ${loja.name}`}
                fill
                unoptimized
                priority
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-radial from-[#2a1a4a] to-[#0d0d0d]" />
            )}

            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.49) 58%, rgba(0, 0, 0, 0.9) 100%)",
              }}
            />

            <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between px-4 sm:px-8 py-6">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full bg-black/40 px-4 py-1.5 text-xs sm:text-sm font-medium text-[#F6F3E4] backdrop-blur-xs hover:bg-black/60 transition-colors"
                >
                  Voltar
                </Link>

                {ehDono && (
                  <button
                    type="button"
                    onClick={() => setModalEditarAberto(true)}
                    aria-label="Editar informações da loja"
                    className="inline-flex items-center gap-2 rounded-full bg-[#6A38F3] px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg hover:bg-[#5c2de0] transition-colors cursor-pointer"
                  >
                    <span>Editar Loja</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col items-center text-center my-auto px-4">
                {(loja.logoUrl || loja.stickerUrl) && (
                  <div className="relative mb-4 flex items-center justify-center">
                    {loja.logoUrl && (
                      <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden border-2 border-[#F6F3E4]/80 shadow-xl bg-white/10">
                        <Image
                          src={loja.logoUrl}
                          alt={`Logo da loja ${loja.name}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    )}
                    {loja.stickerUrl && (
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
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                )}

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F6F3E4] drop-shadow-md">
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

          <section className="w-full bg-[#000000] text-white py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-8 flex flex-col items-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-center tracking-tight">
                Reviews e Comentários
              </h2>

              <div className="mt-6 flex flex-col items-center gap-2">
                <span className="text-5xl sm:text-6xl font-normal text-white tabular-nums">--</span>
                <EstrelasDecorativas />
              </div>

              <div className="mt-10 w-full rounded-[28px] bg-[#F6F3E4] px-6 py-10 text-center text-black shadow-md">
                <p className="text-base sm:text-lg font-medium text-black/80">
                  Nenhuma avaliação publicada para {loja.name} ainda.
                </p>
              </div>
            </div>
          </section>

          <section className="w-full bg-[#F6F3E4] py-12 sm:py-16 flex-1">
            <div className="mx-auto max-w-7xl px-4 sm:px-8 space-y-14">
              <div>
                <div className="flex items-baseline justify-between mb-6">
                  <h2 className="text-2xl sm:text-3xl font-medium text-black">
                    Produtos{" "}
                    <span className="text-sm sm:text-base font-normal text-black/80 lowercase">
                      melhor avaliados
                    </span>
                  </h2>
                </div>

                {produtosDestaque.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-black/20 bg-white/60 p-8 text-center">
                    <p className="text-sm font-medium text-black/70">
                      Nenhum produto cadastrado para esta loja até o momento.
                    </p>
                  </div>
                ) : (
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
                )}
              </div>

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
                        {Array.from({ length: totalPaginas }).map((_, idx) => {
                          const num = idx + 1;
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setPaginaAtual(num)}
                              className={`text-2xl sm:text-3xl font-medium cursor-pointer ${
                                num === paginaAtual
                                  ? "text-[#6A38F3] underline underline-offset-4"
                                  : "text-black/70"
                              }`}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </nav>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>

          <ModalEditarLoja
            loja={loja}
            aberto={modalEditarAberto}
            aoFechar={() => setModalEditarAberto(false)}
            aoSalvar={aoSalvarLoja}
            aoDeletar={aoDeletarLoja}
          />
          <ModalEditarProduto
            produto={produtoEditando}
            aberto={Boolean(produtoEditando)}
            aoFechar={() => setProdutoEditando(null)}
            aoSalvar={aoSalvarProduto}
            aoDeletar={aoDeletarProduto}
          />
        </main>
      )}
    </div>
  );
}
