"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/navbar/Navbar';
import BarraBusca from '@/components/home/BarraBusca';
import CarrosselCategorias from '@/components/home/CarrosselCategorias';
import { ProductCard, ProductSkeleton } from '@/components/home/CardProdutoHome';
import {
  prepararCategoriasHome,
  type CategoriaHome,
  type EstadoListaCategorias,
} from '@/components/home/categorias';
import { correspondeBuscaPorNome, normalizarTextoBusca } from '@/lib/categorias/catalogo';
import { listarCategoriasRaiz } from '@/lib/categorias/listarCategoriasRaiz';
import type { ProdutoApi } from '@/lib/produtos/tipos';
import { listarProdutos, mensagemFalhaProdutos } from './listarProdutos';

type EstadoCategoria =
  | { status: 'carregando' }
  | { status: 'ok'; produtos: ProdutoApi[] }
  | { status: 'erro'; mensagem: string };

type SecaoCategoria = {
  categoria: CategoriaHome;
  estado: EstadoCategoria;
  produtosVisiveis: ProdutoApi[];
};

const MENSAGEM_CONEXAO =
  'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
const MENSAGEM_ERRO_CATEGORIAS = 'Não foi possível carregar as categorias.';

function BotaoTentarNovamente({ aoClicar }: { aoClicar: () => void }) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      className="cursor-pointer rounded-full bg-roxo px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#5c2de0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff] focus-visible:ring-offset-2"
    >
      Tentar novamente
    </button>
  );
}

export default function Home() {
  const buscaRef = useRef<HTMLInputElement>(null);
  const produtosRef = useRef<HTMLElement>(null);
  const [textoBusca, setTextoBusca] = useState('');
  const [lista, setLista] = useState<EstadoListaCategorias>({ status: 'carregando' });
  const [tentativa, setTentativa] = useState(0);
  const [estados, setEstados] = useState<Record<string, EstadoCategoria>>({});

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      const resposta = await listarCategoriasRaiz();
      if (cancelado) return;

      if (resposta.tipo !== 'ok') {
        setLista({
          status: 'erro',
          mensagem: resposta.tipo === 'conexao' ? MENSAGEM_CONEXAO : MENSAGEM_ERRO_CATEGORIAS,
        });
        return;
      }

      const categorias = prepararCategoriasHome(resposta.categorias);
      setLista({ status: 'ok', categorias });

      categorias.forEach(async (cat) => {
        const resultado = await listarProdutos(cat.id);
        if (cancelado) return;
        setEstados((prev) => ({
          ...prev,
          [cat.slug]:
            resultado.tipo === 'ok'
              ? { status: 'ok', produtos: resultado.produtos }
              : { status: 'erro', mensagem: mensagemFalhaProdutos(resultado.tipo) },
        }));
      });
    }

    carregar();

    return () => {
      cancelado = true;
    };
  }, [tentativa]);

  const tentarNovamente = () => {
    setLista({ status: 'carregando' });
    setEstados({});
    setTentativa((anterior) => anterior + 1);
  };

  const termoNormalizado = normalizarTextoBusca(textoBusca);
  const buscando = termoNormalizado !== '';

  const { secoesVisiveis, semResultados, erroNaBusca } = useMemo(() => {
    let carregando = false;
    let totalOk = 0;
    let totalErros = 0;
    let totalEncontrados = 0;
    let mensagemErroGeral = mensagemFalhaProdutos('erro');
    const visiveis: SecaoCategoria[] = [];
    const categorias = lista.status === 'ok' ? lista.categorias : [];

    for (const categoria of categorias) {
      const estado = estados[categoria.slug] ?? { status: 'carregando' };

      if (estado.status === 'carregando') {
        carregando = true;
        visiveis.push({ categoria, estado, produtosVisiveis: [] });
        continue;
      }

      if (estado.status === 'erro') {
        totalErros += 1;
        mensagemErroGeral = estado.mensagem;
        // Durante a busca, ocultamos erros individuais para não poluir os resultados.
        if (!buscando) {
          visiveis.push({ categoria, estado, produtosVisiveis: [] });
        }
        continue;
      }

      totalOk += 1;
      const produtosFiltrados = buscando
        ? estado.produtos.filter((p) => correspondeBuscaPorNome(p.name, termoNormalizado))
        : estado.produtos;

      totalEncontrados += produtosFiltrados.length;

      if (!buscando || produtosFiltrados.length > 0) {
        visiveis.push({
          categoria,
          estado,
          produtosVisiveis: produtosFiltrados.slice(0, 5),
        });
      }
    }

    const todasComErro = !carregando && totalOk === 0 && totalErros > 0;
    return {
      secoesVisiveis: visiveis,
      // Sem categorias carregadas não há o que buscar nem como afirmar que não há resultado.
      semResultados:
        buscando && categorias.length > 0 && !carregando && !todasComErro && totalEncontrados === 0,
      erroNaBusca: buscando && todasComErro ? mensagemErroGeral : null,
    };
  }, [lista, estados, buscando, termoNormalizado]);

  const rolarParaResultados = () => {
    if (buscando) {
      produtosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const limparBusca = () => {
    setTextoBusca('');
    buscaRef.current?.focus();
  };

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[#fcf9f2] font-sans">
      <Navbar />

      <section aria-label="Apresentação" className="relative w-full overflow-hidden bg-[#0b0b0b] pt-12">
        <div className="relative mx-auto h-[320px] max-w-7xl px-6 md:h-[370px]">
          <div className="absolute left-6 top-[37%] z-20 -translate-y-1/2 md:left-22">
            <h1 className="flex flex-col font-sans text-3xl font-bold leading-[1] tracking-normal text-white md:text-[55px]">
              <span className="md:whitespace-nowrap">Do CAOS à organização,</span>
              <span className="md:ml-20 md:whitespace-nowrap lg:ml-[148px]">em alguns cliques</span>
            </h1>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-11 right-5 z-0 hidden h-[750px] w-[500px] md:block md:h-[800px] md:w-[600px]"
          >
            <Image
              src="/mascote-home.png"
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              className="object-contain object-top"
              priority
            />
          </div>
        </div>
      </section>

      <section aria-label="Conteúdo principal" className="relative z-20 flex-1 bg-[#fcf9f2] pb-20 pt-8">
        <div className="mx-auto max-w-7xl px-6">
          <BarraBusca
            valor={textoBusca}
            aoMudar={setTextoBusca}
            aoEnviar={rolarParaResultados}
            aoLimpar={limparBusca}
            inputRef={buscaRef}
          />

          <CarrosselCategorias lista={lista} aoTentarNovamente={tentarNovamente} />

          <section
            ref={produtosRef}
            aria-label="Produtos por categoria"
            className="mt-10 flex scroll-mt-24 flex-col gap-16"
          >
            <div role="status" aria-live="polite">
              {semResultados && (
                <div className="flex flex-col items-center gap-3 text-center">
                  <p className="text-base text-gray-600">
                    Nenhum produto encontrado para &ldquo;{textoBusca.trim()}&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={limparBusca}
                    className="cursor-pointer rounded-full bg-roxo px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#5c2de0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff] focus-visible:ring-offset-2"
                  >
                    Limpar busca
                  </button>
                </div>
              )}
            </div>

            {erroNaBusca && (
              <div className="flex flex-col items-center gap-3 text-center">
                <p role="alert" className="text-sm text-red-500">
                  {erroNaBusca}
                </p>
                <BotaoTentarNovamente aoClicar={tentarNovamente} />
              </div>
            )}

            {secoesVisiveis.map(({ categoria, estado, produtosVisiveis }) => (
              <div key={categoria.slug}>
                <div className="mb-6 flex items-end justify-between">
                  <h2 className="text-2xl font-bold text-black">
                    Produtos <span className="text-sm font-normal lowercase text-black">em</span>{' '}
                    <span className="text-sm font-normal text-[#6a38ff]">{categoria.nome}</span>
                  </h2>
                  <Link
                    href={`/categorias/${categoria.slug}`}
                    aria-label={`Ver mais produtos em ${categoria.nome}`}
                    className="rounded text-sm font-semibold text-[#6a38ff] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff]"
                  >
                    ver mais
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
                  {estado.status === 'carregando' &&
                    Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={`skeleton-${categoria.slug}-${index}`}
                        className={index >= 4 ? 'hidden md:block' : ''}
                      >
                        <ProductSkeleton />
                      </div>
                    ))}

                  {estado.status === 'erro' && (
                    <div className="col-span-full flex flex-col items-center gap-3 text-center">
                      <p role="alert" className="text-sm text-red-500">
                        {estado.mensagem}
                      </p>
                      <BotaoTentarNovamente aoClicar={tentarNovamente} />
                    </div>
                  )}

                  {estado.status === 'ok' && estado.produtos.length === 0 && (
                    <p className="col-span-full text-center text-sm text-gray-500">
                      Nenhum produto disponível.
                    </p>
                  )}

                  {estado.status === 'ok' &&
                    produtosVisiveis.map((prod, index) => (
                      <div key={prod.id} className={index >= 4 ? 'hidden md:block' : ''}>
                        <ProductCard produto={prod} categoriaNome={categoria.nome} />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}
