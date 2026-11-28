import CardProduto from "@/app/categorias/[slug]/CardProduto";
import { listarProdutosDaLoja } from "@/lib/produtos/listarProdutosDaLoja";
import { produtoParaCard } from "@/lib/produtos/paraCard";
import type { ProdutoDetalheApi } from "@/lib/produtos/tipos";

const MAXIMO = 5;

/** Até cinco outros produtos da mesma loja. Sem outros, a seção não aparece. */
export default async function OutrosDaLoja({ produto }: { produto: ProdutoDetalheApi }) {
  // Pede um a mais porque o produto aberto pode vir na lista.
  const consulta = await listarProdutosDaLoja(produto.store.id, MAXIMO + 1);

  if (consulta.tipo !== "ok") {
    return <p className="text-sm text-preto/80">Não foi possível carregar os outros produtos desta loja.</p>;
  }

  const outros = consulta.produtos.filter((item) => item.id !== produto.id).slice(0, MAXIMO);
  if (outros.length === 0) return null;

  return (
    <section aria-labelledby="titulo-outros" className="flex flex-col gap-6">
      <h2 id="titulo-outros" className="text-2xl font-bold">
        Mais produtos de {produto.store.name}
      </h2>
      <ul className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {outros.map((item) => (
          <li key={item.id}>
            <CardProduto produto={produtoParaCard(item)} />
          </li>
        ))}
      </ul>
    </section>
  );
}
