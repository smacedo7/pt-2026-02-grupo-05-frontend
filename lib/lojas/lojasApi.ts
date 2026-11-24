import axios from "axios";
import { api } from "@/lib/api";
import {
  cabecalhoAuth,
  classificarErroAxios,
  extrairErrosCampos,
  obterTokenAutenticado,
} from "@/lib/apiCliente";
import type {
  AtualizarLojaPayload,
  CategoriaResumo,
  Loja,
  ResultadoAtualizarLoja,
  ResultadoBuscarLoja,
  ResultadoDeletarLoja,
} from "./tipos";

export { obterTokenAutenticado };

export async function buscarLoja(id: number): Promise<ResultadoBuscarLoja> {
  try {
    const { data } = await api.get<Loja>(`/stores/${id}`);
    if (!data || typeof data.id !== "number") {
      return { tipo: "erro", mensagem: "Dados da loja inválidos." };
    }
    return { tipo: "sucesso", loja: data };
  } catch (erro) {
    if (!axios.isAxiosError(erro)) {
      return { tipo: "erro", mensagem: "Erro inesperado ao buscar loja." };
    }
    if (!erro.response) return { tipo: "conexao" };
    if (erro.response.status === 404) return { tipo: "nao-encontrado" };
    return {
      tipo: "erro",
      mensagem: erro.response.data?.message || "Não foi possível carregar a loja.",
    };
  }
}

export async function listarCategorias(): Promise<CategoriaResumo[]> {
  try {
    const { data } = await api.get<CategoriaResumo[]>("/categories");
    return Array.isArray(data) ? data : [];
  } catch {
    return [
      { id: 1, name: "Mercado", slug: "mercado" },
      { id: 2, name: "Farmácia", slug: "farmacia" },
      { id: 3, name: "Beleza", slug: "beleza" },
      { id: 4, name: "Moda", slug: "moda" },
      { id: 5, name: "Eletrônicos", slug: "eletronicos" },
      { id: 6, name: "Jogos", slug: "jogos" },
      { id: 7, name: "Brinquedos", slug: "brinquedos" },
      { id: 8, name: "Casa", slug: "casa" },
    ];
  }
}

export async function atualizarLoja(
  id: number,
  payload: AtualizarLojaPayload
): Promise<ResultadoAtualizarLoja> {
  const token = obterTokenAutenticado();
  if (!token) return { tipo: "nao-autorizado" };

  try {
    const { data } = await api.patch<Loja>(`/stores/${id}`, payload, cabecalhoAuth(token));
    if (!data || typeof data.id !== "number") {
      return { tipo: "erro", mensagem: "Resposta do servidor inválida." };
    }
    return { tipo: "sucesso", loja: data };
  } catch (erro) {
    const c = classificarErroAxios(erro, {
      proibidoPadrao:
        "Você não tem permissão para editar esta loja (apenas o proprietário pode alterá-la).",
      erroPadrao: "Erro desconhecido ao atualizar a loja.",
    });

    if (c.tipo === "validacao") {
      const { mensagemGeral, campos } = extrairErrosCampos<keyof AtualizarLojaPayload>(
        c.data,
        [
          [["name", "nome"], "name"],
          [["category"], "categoryId"],
          [["description"], "description"],
          [["logo"], "logoUrl"],
          [["banner"], "bannerUrl"],
          [["sticker"], "stickerUrl"],
        ]
      );
      if (c.data?.code === "CATEGORY_NOT_FOUND") {
        campos.categoryId = "A categoria selecionada não existe.";
      }
      return { tipo: "validacao", mensagem: mensagemGeral, campos };
    }

    if (c.tipo === "conflito") return { tipo: "conflito" };
    return c;
  }
}

export async function deletarLoja(id: number): Promise<ResultadoDeletarLoja> {
  const token = obterTokenAutenticado();
  if (!token) return { tipo: "nao-autorizado" };

  try {
    await api.delete(`/stores/${id}`, cabecalhoAuth(token));
    return { tipo: "sucesso" };
  } catch (erro) {
    const c = classificarErroAxios(erro, {
      proibidoPadrao:
        "Você não tem permissão para deletar esta loja (apenas o proprietário pode removê-la).",
      erroPadrao: "Erro desconhecido ao deletar a loja.",
    });
    if (c.tipo === "validacao") {
      return { tipo: "erro", mensagem: "Requisição inválida ao deletar a loja." };
    }
    if (c.tipo === "conflito") return { tipo: "conflito" };
    return c;
  }
}
