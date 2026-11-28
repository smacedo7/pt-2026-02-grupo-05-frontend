import { api } from "@/lib/api";
import {
  cabecalhoAuth,
  classificarErroAxios,
  extrairErrosCampos,
  obterTokenAutenticado,
} from "@/lib/apiCliente";
import type {
  AtualizarAvaliacaoPayload,
  AvaliacaoLoja,
  AvaliacaoProduto,
  ComentarioAvaliacao,
  CriarAvaliacaoPayload,
  ListaAvaliacoesLoja,
  ResultadoAvaliacao,
  ResultadoComentario,
  ResultadoDeletarAvaliacao,
} from "./tipos";

function tratarErroAvaliacao<T>(
  erro: unknown,
  opcoes: { proibidoPadrao: string; erroPadrao: string; mensagemValidacao: string }
): ResultadoAvaliacao<T> {
  const c = classificarErroAxios(erro, opcoes);
  if (c.tipo === "validacao") {
    const { mensagemGeral } = extrairErrosCampos(c.data, [], opcoes.mensagemValidacao);
    return { tipo: "validacao", mensagem: mensagemGeral };
  }
  if (c.tipo === "conflito") {
    const msg = typeof c.data?.message === "string" ? c.data.message : undefined;
    return { tipo: "conflito", mensagem: msg };
  }
  return c;
}

export async function listarAvaliacoesLoja(
  storeId: number
): Promise<ListaAvaliacoesLoja> {
  try {
    const { data } = await api.get<ListaAvaliacoesLoja>(`/stores/${storeId}/ratings`);
    if (!data || !Array.isArray(data.ratings)) {
      return { averageRating: null, totalCount: 0, ratings: [] };
    }
    return data;
  } catch {
    return { averageRating: null, totalCount: 0, ratings: [] };
  }
}

export async function criarAvaliacaoLoja(
  storeId: number,
  payload: CriarAvaliacaoPayload
): Promise<ResultadoAvaliacao<AvaliacaoLoja>> {
  const token = obterTokenAutenticado();
  if (!token) return { tipo: "nao-autorizado" };

  try {
    const { data } = await api.post<AvaliacaoLoja>(
      `/stores/${storeId}/ratings`,
      payload,
      cabecalhoAuth(token)
    );
    if (!data || typeof data.id !== "number") {
      return { tipo: "erro", mensagem: "Resposta inválida do servidor." };
    }
    return { tipo: "sucesso", avaliacao: data };
  } catch (erro) {
    return tratarErroAvaliacao<AvaliacaoLoja>(erro, {
      proibidoPadrao: "Você não tem permissão para avaliar esta loja.",
      erroPadrao: "Não foi possível publicar a avaliação.",
      mensagemValidacao: "Verifique os dados da avaliação.",
    });
  }
}

export async function atualizarAvaliacaoLoja(
  id: number,
  payload: AtualizarAvaliacaoPayload
): Promise<ResultadoAvaliacao<AvaliacaoLoja>> {
  const token = obterTokenAutenticado();
  if (!token) return { tipo: "nao-autorizado" };

  try {
    const { data } = await api.patch<AvaliacaoLoja>(
      `/store-ratings/${id}`,
      payload,
      cabecalhoAuth(token)
    );
    if (!data || typeof data.id !== "number") {
      return { tipo: "erro", mensagem: "Resposta inválida do servidor." };
    }
    return { tipo: "sucesso", avaliacao: data };
  } catch (erro) {
    return tratarErroAvaliacao<AvaliacaoLoja>(erro, {
      proibidoPadrao: "Apenas o autor pode editar esta avaliação.",
      erroPadrao: "Não foi possível salvar a avaliação.",
      mensagemValidacao: "Verifique os dados da avaliação.",
    });
  }
}

export async function deletarAvaliacaoLoja(
  id: number
): Promise<ResultadoDeletarAvaliacao> {
  const token = obterTokenAutenticado();
  if (!token) return { tipo: "nao-autorizado" };

  try {
    await api.delete(`/store-ratings/${id}`, cabecalhoAuth(token));
    return { tipo: "sucesso" };
  } catch (erro) {
    const c = classificarErroAxios(erro, {
      proibidoPadrao: "Apenas o autor pode excluir esta avaliação.",
      erroPadrao: "Não foi possível deletar a avaliação.",
    });
    if (c.tipo === "validacao") {
      return { tipo: "erro", mensagem: "Requisição inválida ao deletar avaliação." };
    }
    if (c.tipo === "conflito") return { tipo: "conflito" };
    return c;
  }
}

export async function criarAvaliacaoProduto(
  productId: number,
  payload: CriarAvaliacaoPayload
): Promise<ResultadoAvaliacao<AvaliacaoProduto>> {
  const token = obterTokenAutenticado();
  if (!token) return { tipo: "nao-autorizado" };

  try {
    const { data } = await api.post<AvaliacaoProduto>(
      "/ratings",
      { productId, ...payload },
      cabecalhoAuth(token)
    );
    if (!data || typeof data.id !== "number") {
      return { tipo: "erro", mensagem: "Resposta inválida do servidor." };
    }
    return { tipo: "sucesso", avaliacao: data };
  } catch (erro) {
    return tratarErroAvaliacao<AvaliacaoProduto>(erro, {
      proibidoPadrao: "Você não tem permissão para avaliar este produto.",
      erroPadrao: "Não foi possível publicar a avaliação do produto.",
      mensagemValidacao: "Verifique os dados da avaliação.",
    });
  }
}

export async function atualizarAvaliacaoProduto(
  id: number,
  payload: AtualizarAvaliacaoPayload
): Promise<ResultadoAvaliacao<AvaliacaoProduto>> {
  const token = obterTokenAutenticado();
  if (!token) return { tipo: "nao-autorizado" };

  try {
    const { data } = await api.patch<AvaliacaoProduto>(
      `/ratings/${id}`,
      payload,
      cabecalhoAuth(token)
    );
    if (!data || typeof data.id !== "number") {
      return { tipo: "erro", mensagem: "Resposta inválida do servidor." };
    }
    return { tipo: "sucesso", avaliacao: data };
  } catch (erro) {
    return tratarErroAvaliacao<AvaliacaoProduto>(erro, {
      proibidoPadrao: "Apenas o autor pode editar esta avaliação.",
      erroPadrao: "Não foi possível salvar a avaliação.",
      mensagemValidacao: "Verifique os dados da avaliação.",
    });
  }
}

export async function deletarAvaliacaoProduto(
  id: number
): Promise<ResultadoDeletarAvaliacao> {
  const token = obterTokenAutenticado();
  if (!token) return { tipo: "nao-autorizado" };

  try {
    await api.delete(`/ratings/${id}`, cabecalhoAuth(token));
    return { tipo: "sucesso" };
  } catch (erro) {
    const c = classificarErroAxios(erro, {
      proibidoPadrao: "Apenas o autor pode excluir esta avaliação.",
      erroPadrao: "Não foi possível deletar a avaliação.",
    });
    if (c.tipo === "validacao") {
      return { tipo: "erro", mensagem: "Requisição inválida ao deletar avaliação." };
    }
    if (c.tipo === "conflito") return { tipo: "conflito" };
    return c;
  }
}

export async function listarComentariosAvaliacaoLoja(
  storeRatingId: number
): Promise<ComentarioAvaliacao[]> {
  try {
    const { data } = await api.get<ComentarioAvaliacao[]>(
      `/comments/store-rating/${storeRatingId}`
    );
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function listarComentariosAvaliacaoProduto(
  productRatingId: number
): Promise<ComentarioAvaliacao[]> {
  try {
    const { data } = await api.get<ComentarioAvaliacao[]>(
      `/comments/rating/${productRatingId}`
    );
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function criarComentario(payload: {
  storeRatingId?: number;
  productRatingId?: number;
  content: string;
  parentId?: number;
}): Promise<ResultadoComentario> {
  const token = obterTokenAutenticado();
  if (!token) return { tipo: "nao-autorizado" };

  try {
    const { data } = await api.post<ComentarioAvaliacao>(
      "/comments",
      payload,
      cabecalhoAuth(token)
    );
    if (!data || typeof data.id !== "number") {
      return { tipo: "erro", mensagem: "Resposta inválida do servidor." };
    }
    return { tipo: "sucesso", comentario: data };
  } catch (erro) {
    const c = classificarErroAxios(erro, {
      proibidoPadrao: "Você não tem permissão para comentar nesta avaliação.",
      erroPadrao: "Não foi possível publicar o comentário.",
    });
    if (c.tipo === "validacao") {
      const { mensagemGeral } = extrairErrosCampos(c.data, [], "Verifique o comentário informado.");
      return { tipo: "validacao", mensagem: mensagemGeral };
    }
    if (c.tipo === "conflito") return { tipo: "conflito" };
    return c;
  }
}

export async function atualizarComentario(
  id: number,
  content: string
): Promise<ResultadoComentario> {
  const token = obterTokenAutenticado();
  if (!token) return { tipo: "nao-autorizado" };

  try {
    const { data } = await api.patch<ComentarioAvaliacao>(
      `/comments/${id}`,
      { content },
      cabecalhoAuth(token)
    );
    if (!data || typeof data.id !== "number") {
      return { tipo: "erro", mensagem: "Resposta inválida do servidor." };
    }
    return { tipo: "sucesso", comentario: data };
  } catch (erro) {
    const c = classificarErroAxios(erro, {
      proibidoPadrao: "Apenas o autor pode editar este comentário.",
      erroPadrao: "Não foi possível atualizar o comentário.",
    });
    if (c.tipo === "validacao") {
      const { mensagemGeral } = extrairErrosCampos(c.data, [], "Verifique o texto do comentário.");
      return { tipo: "validacao", mensagem: mensagemGeral };
    }
    if (c.tipo === "conflito") return { tipo: "conflito" };
    return c;
  }
}

export async function deletarComentario(
  id: number
): Promise<ResultadoDeletarAvaliacao> {
  const token = obterTokenAutenticado();
  if (!token) return { tipo: "nao-autorizado" };

  try {
    await api.delete(`/comments/${id}`, cabecalhoAuth(token));
    return { tipo: "sucesso" };
  } catch (erro) {
    const c = classificarErroAxios(erro, {
      proibidoPadrao: "Apenas o autor pode excluir este comentário.",
      erroPadrao: "Não foi possível deletar o comentário.",
    });
    if (c.tipo === "validacao") {
      return { tipo: "erro", mensagem: "Requisição inválida ao deletar comentário." };
    }
    if (c.tipo === "conflito") return { tipo: "conflito" };
    return c;
  }
}
