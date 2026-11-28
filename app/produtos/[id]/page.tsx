import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import Navbar from "@/components/navbar/Navbar";
import { buscarProdutoPorId } from "@/lib/produtos/buscarProdutoPorId";
import GaleriaProduto from "./GaleriaProduto";
import OutrosDaLoja from "./OutrosDaLoja";

type Parametros = { params: Promise<{ id: string }> };

// Uma consulta por renderização, compartilhada entre o título e a página.
const buscarProduto = cache(buscarProdutoPorId);

const formatadorPreco = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const LINK =
  "rounded font-semibold text-roxo underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roxo";

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { id } = await params;
  const resultado = await buscarProduto(id);

  if (resultado.tipo === "ok") {
    return { title: `${resultado.produto.name} | Stock.io` };
  }
  return {
    title: resultado.tipo === "nao-encontrado" ? "Produto não encontrado | Stock.io" : "Produto | Stock.io",
  };
}

export default function PaginaProduto({ params }: Parametros) {
  return (
    <div className="flex min-h-screen flex-col bg-creme font-sans text-preto">
      <Navbar />
      <Suspense
        fallback={
          <p role="status" className="flex-1 px-4 py-16 text-center text-lg">
            Carregando produto...
          </p>
        }
      >
        <ConteudoProduto params={params} />
      </Suspense>
    </div>
  );
}

async function ConteudoProduto({ params }: Parametros) {
  const { id } = await params;
  const resultado = await buscarProduto(id);

  if (resultado.tipo === "nao-encontrado") {
    notFound();
  }

  if (resultado.tipo !== "ok") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p role="alert" className="text-lg font-semibold">
          {resultado.tipo === "conexao"
            ? "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."
            : "Não foi possível carregar o produto."}
        </p>
        {/* Link comum: recarrega a página e consulta a API de novo. */}
        <a
          href={`/produtos/${id}`}
          className="rounded-full bg-roxo px-5 py-2.5 text-sm font-bold text-white hover:bg-[#5c2de0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roxo"
        >
          Tentar novamente
        </a>
      </main>
    );
  }

  const { produto } = resultado;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-8 md:px-10 md:py-12">
      <div className="flex flex-col gap-6">
        <Link href="/produtos" className={`w-fit text-sm ${LINK}`}>
          Voltar para produtos
        </Link>

        <article className="grid gap-8 md:grid-cols-2">
          <GaleriaProduto nome={produto.name} imagens={produto.images} />

          <div className="flex min-w-0 flex-col items-start gap-4">
            <Link href={`/categorias/${produto.category.slug}`} className={`text-sm ${LINK}`}>
              {produto.category.name}
            </Link>
            <h1 className="break-words text-3xl font-extrabold tracking-tight md:text-5xl">{produto.name}</h1>
            <p className="text-2xl font-bold md:text-3xl">{formatadorPreco.format(produto.price)}</p>

            {produto.stock > 0 ? (
              <div className="flex flex-wrap items-center gap-3">
                <p className="rounded-full bg-limao px-3 py-1 text-xs font-bold uppercase">Disponível</p>
                <p className="text-sm">{produto.stock} em estoque</p>
              </div>
            ) : (
              <p className="rounded-full bg-red-700 px-3 py-1 text-xs font-bold uppercase text-white">
                Indisponível
              </p>
            )}

            <p className="text-sm">
              Vendido por{" "}
              <Link href={`/lojas/${produto.store.id}`} className={LINK}>
                {produto.store.name}
              </Link>
            </p>

            {produto.description && (
              <section aria-labelledby="titulo-descricao" className="mt-2 flex flex-col gap-2">
                <h2 id="titulo-descricao" className="text-xl font-bold">
                  Descrição
                </h2>
                <p className="whitespace-pre-line break-words text-base">{produto.description}</p>
              </section>
            )}
          </div>
        </article>
      </div>

      <Suspense fallback={<p role="status">Carregando outros produtos da loja...</p>}>
        <OutrosDaLoja produto={produto} />
      </Suspense>
    </main>
  );
}
