export type ProdutoImagem = {
  id: number;
  imageUrl: string;
  sortOrder: number;
};

/** Espelho do ProductResponseDto do backend: é o que GET /products devolve. */
export type ProdutoApi = {
  id: number;
  storeId: number;
  categoryId: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
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

export type ProdutoLoja = ProdutoApi & {
  images?: ProdutoImagem[];
};

export type CriarProdutoPayload = {
  storeId: number;
  categoryId: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
};

export type ResultadoCriarProduto =
  | { tipo: "sucesso"; produto: ProdutoLoja }
  | {
      tipo: "validacao";
      mensagem: string;
      campos?: Partial<Record<keyof CriarProdutoPayload, string>>;
    }
  | { tipo: "nao-autorizado" }
  | { tipo: "proibido"; mensagem: string }
  | { tipo: "nao-encontrado" }
  | { tipo: "conflito" }
  | { tipo: "conexao" }
  | { tipo: "erro"; mensagem: string };

export type AtualizarProdutoPayload = {
  name?: string;
  categoryId?: number;
  description?: string | null;
  price?: number;
  stock?: number;
};

export type ResultadoAtualizarProduto =
  | { tipo: "sucesso"; produto: ProdutoLoja }
  | {
      tipo: "validacao";
      mensagem: string;
      campos?: Partial<Record<keyof AtualizarProdutoPayload, string>>;
    }
  | { tipo: "nao-autorizado" }
  | { tipo: "proibido"; mensagem: string }
  | { tipo: "nao-encontrado" }
  | { tipo: "conflito" }
  | { tipo: "conexao" }
  | { tipo: "erro"; mensagem: string };

export type ResultadoDeletarProduto =
  | { tipo: "sucesso" }
  | { tipo: "nao-autorizado" }
  | { tipo: "proibido"; mensagem: string }
  | { tipo: "nao-encontrado" }
  | { tipo: "conflito" }
  | { tipo: "conexao" }
  | { tipo: "erro"; mensagem: string };
