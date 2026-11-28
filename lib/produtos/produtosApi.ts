import { api } from "@/lib/api";
import {
  cabecalhoAuth,
  classificarErroAxios,
  extrairErrosCampos,
  obterTokenAutenticado,
} from "@/lib/apiCliente";
import type {
  AtualizarProdutoPayload,
  CriarProdutoPayload,
  ProdutoImagem,
  ProdutoLoja,
  ResultadoAtualizarProduto,
  ResultadoCriarProduto,
  ResultadoDeletarProduto,
} from "./tipos";

export async function listarImagensProduto(
  productId: number
): Promise<ProdutoImagem[]> {
  try {
    const { data } = await api.get<ProdutoImagem[]>(
      `/products/${productId}/images`
    );
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function buscarDetalheProduto(
  id: number
): Promise<ProdutoLoja | null> {
  try {
    const { data } = await api.get<ProdutoLoja>(`/products/${id}`);
    return data && typeof data.id === "number" ? data : null;
  } catch {
    return null;
  }
}

export async function adicionarImagemProduto(
  productId: number,
  imageUrl: string
): Promise<ProdutoImagem> {
  const token = obterTokenAutenticado();
  if (!token) throw new Error("NAO_AUTORIZADO");
  const { data } = await api.post<ProdutoImagem>(
    `/products/${productId}/images`,
    { imageUrl },
    cabecalhoAuth(token)
  );
  return data;
}

export async function removerImagemProduto(
  productId: number,
  imageId: number
): Promise<void> {
  const token = obterTokenAutenticado();
  if (!token) throw new Error("NAO_AUTORIZADO");
  await api.delete(
    `/products/${productId}/images/${imageId}`,
    cabecalhoAuth(token)
  );
}

export async function criarProduto(
  payload: CriarProdutoPayload
): Promise<ResultadoCriarProduto> {
  const token = obterTokenAutenticado();
  if (!token) return { tipo: "nao-autorizado" };

  try {
    const { data } = await api.post<ProdutoLoja>(
      "/products",
      payload,
      cabecalhoAuth(token)
    );
    if (!data || typeof data.id !== "number") {
      return { tipo: "erro", mensagem: "Resposta do servidor inválida." };
    }
    return { tipo: "sucesso", produto: data };
  } catch (erro) {
    const c = classificarErroAxios(erro, {
      proibidoPadrao:
        "Você não tem permissão para adicionar produtos nesta loja (apenas o dono pode adicioná-los).",
      erroPadrao: "Erro desconhecido ao criar o produto.",
    });

    if (c.tipo === "validacao") {
      const { mensagemGeral, campos } = extrairErrosCampos<keyof CriarProdutoPayload>(
        c.data,
        [
          [["name"], "name"],
          [["category"], "categoryId"],
          [["description"], "description"],
          [["price"], "price"],
          [["stock"], "stock"],
          [["store"], "storeId"],
        ]
      );
      if (c.data?.code === "CATEGORY_NOT_FOUND") {
        campos.categoryId = "A subcategoria selecionada não existe.";
      }
      if (c.data?.code === "STORE_NOT_FOUND") {
        campos.storeId = "A loja selecionada não existe.";
      }
      return { tipo: "validacao", mensagem: mensagemGeral, campos };
    }

    if (c.tipo === "conflito") return { tipo: "conflito" };
    return c;
  }
}

export async function atualizarProduto(
  id: number,
  payload: AtualizarProdutoPayload
): Promise<ResultadoAtualizarProduto> {
  const token = obterTokenAutenticado();
  if (!token) return { tipo: "nao-autorizado" };

  try {
    const { data } = await api.patch<ProdutoLoja>(
      `/products/${id}`,
      payload,
      cabecalhoAuth(token)
    );

    if (!data || typeof data.id !== "number") {
      return { tipo: "erro", mensagem: "Resposta do servidor inválida." };
    }

    return { tipo: "sucesso", produto: data };
  } catch (erro) {
    const c = classificarErroAxios(erro, {
      proibidoPadrao:
        "Você não tem permissão para editar este produto (apenas o dono da loja pode alterá-lo).",
      erroPadrao: "Erro desconhecido ao atualizar o produto.",
    });

    if (c.tipo === "validacao") {
      const { mensagemGeral, campos } = extrairErrosCampos<keyof AtualizarProdutoPayload>(
        c.data,
        [
          [["name"], "name"],
          [["category"], "categoryId"],
          [["description"], "description"],
          [["price"], "price"],
          [["stock"], "stock"],
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

export async function deletarProduto(
  id: number
): Promise<ResultadoDeletarProduto> {
  const token = obterTokenAutenticado();
  if (!token) return { tipo: "nao-autorizado" };

  try {
    await api.delete(`/products/${id}`, cabecalhoAuth(token));
    return { tipo: "sucesso" };
  } catch (erro) {
    const c = classificarErroAxios(erro, {
      proibidoPadrao:
        "Você não tem permissão para deletar este produto (apenas o dono da loja pode removê-lo).",
      erroPadrao: "Erro desconhecido ao deletar o produto.",
    });
    if (c.tipo === "validacao") {
      return { tipo: "erro", mensagem: "Requisição inválida ao deletar produto." };
    }
    if (c.tipo === "conflito") return { tipo: "conflito" };
    return c;
  }
}
