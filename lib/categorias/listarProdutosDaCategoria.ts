import { listarProdutos, type FalhaProdutos } from "@/app/listarProdutos";
import { listarLojasPorId } from "@/lib/lojas/listarLojasPorId";
import type { CategoriaDetalheApi, Produto } from "./tipos";

/** Máximo exibido na página de categoria; é também o maior `limit` aceito pela API. */
export const LIMITE_PRODUTOS_CATEGORIA = 100;

export type ResultadoProdutosDaCategoria =
  | { tipo: "ok"; produtos: Produto[]; limiteAtingido: boolean }
  | { tipo: FalhaProdutos };

/**
 * A API filtra pela categoria exata, então consulta a categoria e cada
 * subcategoria direta e junta os resultados. Se uma consulta falhar, a página
 * mostra o erro em vez de uma lista incompleta.
 */
export async function listarProdutosDaCategoria(
  categoria: CategoriaDetalheApi,
): Promise<ResultadoProdutosDaCategoria> {
  const consultadas = [
    { id: categoria.id, nome: categoria.name, subcategoriaSlug: "" },
    ...categoria.subcategories.map((sub) => ({
      id: sub.id,
      nome: sub.name,
      subcategoriaSlug: sub.slug,
    })),
  ];

  const [respostas, lojas] = await Promise.all([
    Promise.all(
      consultadas.map(async (consultada) => ({
        consultada,
        resposta: await listarProdutos(consultada.id, LIMITE_PRODUTOS_CATEGORIA),
      })),
    ),
    listarLojasPorId(),
  ]);

  const produtos: Produto[] = [];
  for (const { consultada, resposta } of respostas) {
    if (resposta.tipo !== "ok") return { tipo: resposta.tipo };

    produtos.push(
      ...resposta.produtos.map((produto) => ({
        id: String(produto.id),
        nome: produto.name,
        preco: produto.price,
        estoque: produto.stock,
        disponivel: produto.stock > 0,
        imagemUrl: produto.imageUrl ?? null,
        lojaNome: lojas.get(produto.storeId)?.name,
        categoriaNome: consultada.nome,
        categoriaSlug: categoria.slug,
        subcategoriaSlug: consultada.subcategoriaSlug,
        criadoEm: produto.createdAt,
      })),
    );
  }

  // Mesma ordem padrão da API (nome e depois id), refeita após juntar as listas.
  produtos.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR") || Number(a.id) - Number(b.id));

  return {
    tipo: "ok",
    produtos: produtos.slice(0, LIMITE_PRODUTOS_CATEGORIA),
    limiteAtingido: produtos.length >= LIMITE_PRODUTOS_CATEGORIA,
  };
}
