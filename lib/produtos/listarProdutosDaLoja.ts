import { api } from "@/lib/api";
import type { ProdutoApi } from "./tipos";

export type ResultadoProdutosDaLoja = { tipo: "ok"; produtos: ProdutoApi[] } | { tipo: "erro" };

/** GET /products filtrado pela loja. */
export async function listarProdutosDaLoja(
  storeId: number,
  limite: number,
): Promise<ResultadoProdutosDaLoja> {
  try {
    const { data } = await api.get<ProdutoApi[]>("/products", {
      params: { storeId, limit: limite },
      timeout: 10000,
    });
    return Array.isArray(data) ? { tipo: "ok", produtos: data } : { tipo: "erro" };
  } catch {
    return { tipo: "erro" };
  }
}
