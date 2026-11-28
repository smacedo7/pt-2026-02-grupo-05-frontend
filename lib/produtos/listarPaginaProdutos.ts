import axios from "axios";
import type { FalhaProdutos } from "@/app/listarProdutos";
import { api } from "@/lib/api";
import type { ProdutoApi } from "./tipos";

export const PRODUTOS_POR_PAGINA = 20;

export type ResultadoPaginaProdutos =
  | { tipo: "ok"; produtos: ProdutoApi[]; temProxima: boolean }
  | { tipo: Exclude<FalhaProdutos, "nao-encontrada"> };

/**
 * Uma página de GET /products. A API não informa o total, então a consulta pede
 * um item a mais para saber se existe próxima página.
 */
export async function listarPaginaProdutos(pagina: number): Promise<ResultadoPaginaProdutos> {
  try {
    const { data } = await api.get<ProdutoApi[]>("/products", {
      params: {
        limit: PRODUTOS_POR_PAGINA + 1,
        offset: (pagina - 1) * PRODUTOS_POR_PAGINA,
      },
      timeout: 10000,
    });
    if (!Array.isArray(data)) return { tipo: "erro" };
    return {
      tipo: "ok",
      produtos: data.slice(0, PRODUTOS_POR_PAGINA),
      temProxima: data.length > PRODUTOS_POR_PAGINA,
    };
  } catch (erro) {
    if (!axios.isAxiosError(erro)) return { tipo: "erro" };
    // Sem resposta do servidor: backend parado, rede caiu ou CORS bloqueou.
    if (!erro.response) return { tipo: "conexao" };
    if (erro.response.status === 400) return { tipo: "invalida" };
    return { tipo: "erro" };
  }
}
