import axios from "axios";
import { api } from "@/lib/api";
import type { ProdutoDetalheApi } from "./tipos";

// Mesma regra do backend: o id é um inteiro positivo de 32 bits.
const ID_VALIDO = /^[1-9]\d*$/;
const ID_MAXIMO = 2147483647;

export type ResultadoProduto =
  | { tipo: "ok"; produto: ProdutoDetalheApi }
  | { tipo: "nao-encontrado" }
  | { tipo: "conexao" }
  | { tipo: "erro" };

/** GET /products/:id. Recebe o trecho da URL, ainda sem validação. */
export async function buscarProdutoPorId(id: string): Promise<ResultadoProduto> {
  // Um id fora do formato não existe; assim ele nem chega a montar a rota chamada.
  if (!ID_VALIDO.test(id) || Number(id) > ID_MAXIMO) {
    return { tipo: "nao-encontrado" };
  }

  try {
    const { data } = await api.get<ProdutoDetalheApi>(`/products/${id}`, { timeout: 10000 });
    if (typeof data?.name !== "string" || !data.store || !data.category || !Array.isArray(data.images)) {
      return { tipo: "erro" };
    }
    return { tipo: "ok", produto: data };
  } catch (erro) {
    if (!axios.isAxiosError(erro)) return { tipo: "erro" };
    // Sem resposta do servidor: backend parado ou rede caiu.
    if (!erro.response) return { tipo: "conexao" };
    if (erro.response.status === 404) return { tipo: "nao-encontrado" };
    return { tipo: "erro" };
  }
}
