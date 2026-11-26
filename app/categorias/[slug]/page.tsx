import type { Metadata } from "next";
import { cache, Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import { buscarCategoriaPorSlug } from "@/lib/categorias/buscarCategoriaPorSlug";
import { listarProdutosDaCategoria } from "@/lib/categorias/dados-demonstrativos";
import type { Categoria } from "@/lib/categorias/tipos";
import CatalogoCategoria from "./CatalogoCategoria";

type Parametros = { params: Promise<{ slug: string }> };

// Uma consulta por renderização, compartilhada entre o título e a página.
const buscarCategoria = cache(buscarCategoriaPorSlug);

// A API não tem campo para a frase do banner. Ficam aqui as frases que já existiam.
const CHAMADAS = new Map([["tecnologia", "O universo da tecnologia em um só lugar"]]);

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { slug } = await params;
  const resultado = await buscarCategoria(slug);

  if (resultado.tipo === "ok") {
    return { title: `${resultado.categoria.name} | Stock.io` };
  }
  return {
    title:
      resultado.tipo === "nao-encontrada"
        ? "Categoria não encontrada | Stock.io"
        : "Categoria | Stock.io",
  };
}

export default function PaginaCategoria({ params }: Parametros) {
  return (
    <div className="flex min-h-screen flex-col bg-creme font-sans text-preto">
      <Navbar />
      <Suspense
        fallback={
          <p role="status" className="flex-1 px-4 py-16 text-center text-lg">
            Carregando categoria...
          </p>
        }
      >
        <ConteudoCategoria params={params} />
      </Suspense>
    </div>
  );
}

async function ConteudoCategoria({ params }: Parametros) {
  const { slug } = await params;
  const resultado = await buscarCategoria(slug);

  if (resultado.tipo === "nao-encontrada") {
    notFound();
  }

  if (resultado.tipo === "erro") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p role="alert" className="text-lg font-semibold">
          Não foi possível carregar a categoria.
        </p>
        {/* Link comum: recarrega a página e consulta a API de novo. */}
        <a
          href={`/categorias/${slug}`}
          className="rounded-full bg-roxo px-5 py-2.5 text-sm font-bold text-white hover:bg-[#5c2de0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roxo"
        >
          Tentar novamente
        </a>
      </main>
    );
  }

  const categoria: Categoria = {
    slug: resultado.categoria.slug,
    nome: resultado.categoria.name,
    chamada: CHAMADAS.get(resultado.categoria.slug),
    subcategorias: resultado.categoria.subcategories.map((item) => ({
      slug: item.slug,
      nome: item.name,
    })),
  };
  const produtos = await listarProdutosDaCategoria(categoria.slug);

  return (
    <>
      <header className="overflow-hidden bg-preto text-creme">
        <div className="mx-auto flex w-full max-w-6xl items-end justify-between gap-4 px-4 pt-12 md:px-10 md:pt-20">
          <div className="min-w-0 flex-1 pb-12 md:pb-20">
            <p className="text-sm font-semibold uppercase tracking-widest text-creme/70">Categoria</p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-6xl">{categoria.nome}</h1>
            {categoria.chamada && (
              <p className="mt-4 max-w-xl text-xl leading-snug md:text-3xl">{categoria.chamada}</p>
            )}
          </div>

          <Image
            src="/mascote-categoria.png"
            alt="Stockles, mascote da Stock.io, segurando um celular"
            width={425}
            height={1097}
            priority
            sizes="(min-width: 768px) 112px, 68px"
            className="h-44 w-auto shrink-0 md:h-72"
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-10 md:py-12">
        <CatalogoCategoria categoria={categoria} produtos={produtos} />
      </main>
    </>
  );
}
