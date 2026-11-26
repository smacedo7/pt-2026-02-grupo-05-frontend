import axios from "axios";
import { api } from "@/lib/api";
import type { ProdutoApi } from "@/lib/produtos/tipos";

export type FalhaProdutos = "conexao" | "invalida" | "nao-encontrada" | "erro";

export type ResultadoProdutos =
  | { tipo: "ok"; produtos: ProdutoApi[] }
  | { tipo: FalhaProdutos };

const MENSAGENS: Record<FalhaProdutos, string> = {
  conexao: "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
  invalida: "Não foi possível consultar os produtos: o servidor recusou a requisição.",
  "nao-encontrada": "Os produtos desta categoria não foram encontrados.",
  erro: "Não foi possível carregar os produtos.",
};

export function mensagemFalhaProdutos(falha: FalhaProdutos): string {
  return MENSAGENS[falha];
}

/** GET /products filtrado por categoria (somente os produtos cadastrados diretamente nela). */
export async function listarProdutos(
  categoryId: number,
  limite = 5,
): Promise<ResultadoProdutos> {
  try {
    const { data } = await api.get<ProdutoApi[]>("/products", {
      params: { categoryId, limit: limite },
      timeout: 10000,
    });
    if (!Array.isArray(data)) {
      return { tipo: "erro" };
    }
    return { tipo: "ok", produtos: data };
  } catch (erro) {
    if (!axios.isAxiosError(erro)) {
      return { tipo: "erro" };
    }
    // Sem resposta do servidor: backend parado, rede caiu ou CORS bloqueou.
    if (!erro.response) {
      return { tipo: "conexao" };
    }
    if (erro.response.status === 400) return { tipo: "invalida" };
    if (erro.response.status === 404) return { tipo: "nao-encontrada" };
    return { tipo: "erro" };
  }
}
