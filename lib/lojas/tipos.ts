export type CategoriaResumo = {
  id: number;
  name: string;
  slug: string;
  parentCategoryId?: number | null;
};

export type Loja = {
  id: number;
  userId: number;
  categoryId: number;
  name: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  stickerUrl: string | null;
  createdAt: string;
  updatedAt: string;
  category?: CategoriaResumo;
};

export type CriarLojaPayload = {
  name: string;
  categoryId: number;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  stickerUrl?: string | null;
};

export type ResultadoCriarLoja =
  | { tipo: "sucesso"; loja: Loja }
  | { tipo: "validacao"; mensagem: string; campos?: Partial<Record<keyof CriarLojaPayload, string>> }
  | { tipo: "nao-autorizado" }
  | { tipo: "conflito" }
  | { tipo: "conexao" }
  | { tipo: "erro"; mensagem: string };

export type AtualizarLojaPayload = {
  name?: string;
  categoryId?: number;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  stickerUrl?: string | null;
};

export type ResultadoAtualizarLoja =
  | { tipo: "sucesso"; loja: Loja }
  | { tipo: "validacao"; mensagem: string; campos?: Partial<Record<keyof AtualizarLojaPayload, string>> }
  | { tipo: "nao-autorizado" }
  | { tipo: "proibido"; mensagem: string }
  | { tipo: "nao-encontrado" }
  | { tipo: "conflito" }
  | { tipo: "conexao" }
  | { tipo: "erro"; mensagem: string };

export type ResultadoBuscarLoja =
  | { tipo: "sucesso"; loja: Loja }
  | { tipo: "nao-encontrado" }
  | { tipo: "conexao" }
  | { tipo: "erro"; mensagem: string };

export type ResultadoDeletarLoja =
  | { tipo: "sucesso" }
  | { tipo: "nao-autorizado" }
  | { tipo: "proibido"; mensagem: string }
  | { tipo: "nao-encontrado" }
  | { tipo: "conflito" }
  | { tipo: "conexao" }
  | { tipo: "erro"; mensagem: string };
