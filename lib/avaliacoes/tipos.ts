export type AutorAvaliacao = {
  id: number;
  name: string;
  username?: string;
  profilePictureUrl?: string | null;
};

export type AvaliacaoLoja = {
  id: number;
  userId: number;
  storeId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: AutorAvaliacao;
};

export type AvaliacaoProduto = {
  id: number;
  productId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: number; name: string };
};

export type ListaAvaliacoesLoja = {
  averageRating: number | null;
  totalCount: number;
  ratings: AvaliacaoLoja[];
};

export type ComentarioAvaliacao = {
  id: number;
  productRatingId: number | null;
  storeRatingId: number | null;
  parentId: number | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: AutorAvaliacao;
  replies?: ComentarioAvaliacao[];
};

export type CriarAvaliacaoPayload = {
  rating: number;
  comment?: string | null;
};

export type AtualizarAvaliacaoPayload = {
  rating?: number;
  comment?: string | null;
};

export type ResultadoAvaliacao<T> =
  | { tipo: "sucesso"; avaliacao: T }
  | { tipo: "validacao"; mensagem: string }
  | { tipo: "nao-autorizado" }
  | { tipo: "proibido"; mensagem: string }
  | { tipo: "nao-encontrado" }
  | { tipo: "conflito"; mensagem?: string }
  | { tipo: "conexao" }
  | { tipo: "erro"; mensagem: string };

export type ResultadoAtualizarAvaliacao = ResultadoAvaliacao<AvaliacaoLoja>;

export type ResultadoDeletarAvaliacao =
  | { tipo: "sucesso" }
  | { tipo: "nao-autorizado" }
  | { tipo: "proibido"; mensagem: string }
  | { tipo: "nao-encontrado" }
  | { tipo: "conflito" }
  | { tipo: "conexao" }
  | { tipo: "erro"; mensagem: string };

export type ResultadoComentario =
  | { tipo: "sucesso"; comentario: ComentarioAvaliacao }
  | { tipo: "validacao"; mensagem: string }
  | { tipo: "nao-autorizado" }
  | { tipo: "proibido"; mensagem: string }
  | { tipo: "nao-encontrado" }
  | { tipo: "conflito" }
  | { tipo: "conexao" }
  | { tipo: "erro"; mensagem: string };
