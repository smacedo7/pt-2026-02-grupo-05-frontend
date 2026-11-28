import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import CardProduto from "@/app/categorias/[slug]/CardProduto";
import { mensagemFalhaProdutos } from "@/app/listarProdutos";
import Navbar from "@/components/navbar/Navbar";
import { listarPaginaProdutos } from "@/lib/produtos/listarPaginaProdutos";
import { produtoParaCard } from "@/lib/produtos/paraCard";

export const metadata: Metadata = { title: "Produtos | Stock.io" };

type Parametros = { searchParams: Promise<{ pagina?: string | string[] }> };

const BOTAO =
  "rounded-full bg-roxo px-5 py-2.5 text-sm font-bold text-white hover:bg-[#5c2de0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roxo";

export default function PaginaProdutos({ searchParams }: Parametros) {
  return (
    <div className="flex min-h-screen flex-col bg-creme font-sans text-preto">
      <Navbar />
      <header className="bg-preto text-creme">
        <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-8 md:px-10 md:pb-16 md:pt-12">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">Produtos</h1>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-10 md:py-12">
        <Suspense
          fallback={
            <p role="status" className="py-8 text-center text-lg">
              Carregando produtos...
            </p>
          }
        >
          <ListaProdutos searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

/** Número da página pedido na URL; valores inválidos voltam para a primeira. */
function lerPagina(valor: string | string[] | undefined): number {
  return typeof valor === "string" && /^[1-9]\d{0,5}$/.test(valor) ? Number(valor) : 1;
}

function enderecoDaPagina(pagina: number): string {
  return pagina === 1 ? "/produtos" : `/produtos?pagina=${pagina}`;
}

async function ListaProdutos({ searchParams }: Parametros) {
  const pagina = lerPagina((await searchParams).pagina);
  const consulta = await listarPaginaProdutos(pagina);

  if (consulta.tipo !== "ok") {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p role="alert" className="text-lg font-semibold">
          {mensagemFalhaProdutos(consulta.tipo)}
        </p>
        {/* Link comum: recarrega a página e consulta a API de novo. */}
        <a href={enderecoDaPagina(pagina)} className={BOTAO}>
          Tentar novamente
        </a>
      </div>
    );
  }

  if (consulta.produtos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-6 py-12 text-center">
        <p className="text-lg font-semibold">
          {pagina === 1 ? "Ainda não há produtos cadastrados." : "Esta página não tem produtos."}
        </p>
        {pagina > 1 && (
          <Link href="/produtos" className={BOTAO}>
            Ir para a primeira página
          </Link>
        )}
      </div>
    );
  }

  return (
    <section aria-labelledby="titulo-lista" className="flex flex-col gap-8">
      <h2 id="titulo-lista" className="sr-only">
        Lista de produtos, página {pagina}
      </h2>
      <ul className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {consulta.produtos.map((produto) => (
          <li key={produto.id}>
            <CardProduto produto={produtoParaCard(produto)} />
          </li>
        ))}
      </ul>

      {(pagina > 1 || consulta.temProxima) && (
        <nav aria-label="Paginação" className="flex flex-wrap items-center justify-center gap-4">
          {pagina > 1 && (
            <Link href={enderecoDaPagina(pagina - 1)} className={BOTAO}>
              Anterior
            </Link>
          )}
          <p className="text-sm font-semibold">Página {pagina}</p>
          {consulta.temProxima && (
            <Link href={enderecoDaPagina(pagina + 1)} className={BOTAO}>
              Próxima
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
