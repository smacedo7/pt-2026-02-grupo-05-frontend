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
  ListaAvaliacoesLoja,
  ResultadoAtualizarAvaliacao,
  ResultadoDeletarAvaliacao,
} from "./tipos";

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

export async function atualizarAvaliacaoLoja(
  id: number,
  payload: AtualizarAvaliacaoPayload
): Promise<ResultadoAtualizarAvaliacao> {
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
    const c = classificarErroAxios(erro, {
      proibidoPadrao: "Apenas o autor pode editar esta avaliação.",
      erroPadrao: "Não foi possível salvar a avaliação.",
    });
    if (c.tipo === "validacao") {
      const { mensagemGeral } = extrairErrosCampos(c.data, [], "Verifique os dados da avaliação.");
      return { tipo: "validacao", mensagem: mensagemGeral };
    }
    if (c.tipo === "conflito") return { tipo: "conflito" };
    return c;
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
