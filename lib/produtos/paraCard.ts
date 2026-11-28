import type { Produto } from "@/lib/categorias/tipos";
import type { ProdutoApi } from "./tipos";

/** Converte um item de GET /products para o formato do card. */
export function produtoParaCard(produto: ProdutoApi): Produto {
  return {
    id: String(produto.id),
    nome: produto.name,
    preco: produto.price,
    estoque: produto.stock,
    disponivel: produto.stock > 0,
    // A API envia imageUrl com a imagem principal do produto (ou null).
    imagemUrl: produto.imageUrl ?? null,
    categoriaSlug: "",
    subcategoriaSlug: "",
    criadoEm: produto.createdAt,
  };
}
