import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import {
  buscarCategoria,
  listarProdutosDaCategoria,
  listarSlugsDeCategorias,
} from "@/lib/categorias/dados-demonstrativos";
import CatalogoCategoria from "./CatalogoCategoria";

type Parametros = { params: Promise<{ slug: string }> };

// Rota bloqueante: a página só responde depois de resolver params e a categoria.
// Assim notFound() vira HTTP 404 em vez de um shell 200 transmitido antes da busca.
// As slugs conhecidas são pré-renderizadas no build. Slugs desconhecidas são
// barradas antes da renderização pelo proxy.ts, que responde 404.
export function generateStaticParams() {
  return listarSlugsDeCategorias().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { slug } = await params;
  const categoria = await buscarCategoria(slug);

  return {
    title: categoria ? `${categoria.nome} | Stock.io` : "Categoria não encontrada | Stock.io",
  };
}

export default async function PaginaCategoria({ params }: Parametros) {
  const { slug } = await params;
  const categoria = await buscarCategoria(slug);

  if (!categoria) {
    notFound();
  }

  const produtos = await listarProdutosDaCategoria(categoria.slug);

  return (
    <div className="flex min-h-screen flex-col bg-creme font-sans text-preto">
      <Navbar />

      <header className="overflow-hidden bg-preto text-creme">
        <div className="mx-auto flex w-full max-w-6xl items-end justify-between gap-4 px-4 pt-12 md:px-10 md:pt-20">
          <div className="min-w-0 flex-1 pb-12 md:pb-20">
            <p className="text-sm font-semibold uppercase tracking-widest text-creme/70">Categoria</p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-6xl">{categoria.nome}</h1>
            <p className="mt-4 max-w-xl text-xl leading-snug md:text-3xl">{categoria.chamada}</p>
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
    </div>
  );
}
