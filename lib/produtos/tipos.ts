export type ProdutoImagem = {
  id: number;
  imageUrl: string;
  sortOrder: number;
};

export type ProdutoLoja = {
  id: number;
  storeId: number;
  categoryId: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  images?: ProdutoImagem[];
  createdAt: string;
  updatedAt: string;
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
