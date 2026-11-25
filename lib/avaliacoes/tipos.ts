export type AutorAvaliacao = {
  id: number;
  name: string;
  username: string;
  profilePictureUrl: string | null;
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

export type ListaAvaliacoesLoja = {
  averageRating: number | null;
  totalCount: number;
  ratings: AvaliacaoLoja[];
};

export type AtualizarAvaliacaoPayload = {
  rating?: number;
  comment?: string | null;
};

export type ResultadoAtualizarAvaliacao =
  | { tipo: "sucesso"; avaliacao: AvaliacaoLoja }
  | { tipo: "validacao"; mensagem: string }
  | { tipo: "nao-autorizado" }
  | { tipo: "proibido"; mensagem: string }
  | { tipo: "nao-encontrado" }
  | { tipo: "conflito" }
  | { tipo: "conexao" }
  | { tipo: "erro"; mensagem: string };

export type ResultadoDeletarAvaliacao =
  | { tipo: "sucesso" }
  | { tipo: "nao-autorizado" }
  | { tipo: "proibido"; mensagem: string }
  | { tipo: "nao-encontrado" }
  | { tipo: "conflito" }
  | { tipo: "conexao" }
  | { tipo: "erro"; mensagem: string };
