/** Espelho do ProductListItemDto do backend: é o que GET /products devolve. */
export type ProdutoApi = {
  id: number;
  storeId: number;
  categoryId: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Espelho do ProductDetailResponseDto, devolvido por GET /products/:id.
 * Loja, categoria e imagens só existem aqui; a listagem não as envia.
 */
export type ProdutoDetalheApi = ProdutoApi & {
  store: { id: number; name: string };
  category: { id: number; name: string; slug: string };
  images: { id: number; imageUrl: string; sortOrder: number }[];
};
