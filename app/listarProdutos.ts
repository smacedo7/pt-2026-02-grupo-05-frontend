import axios from "axios";
import { api } from "@/lib/api";

//vai ser alterado para ficar identico ao DTO
export type Produto = {
  id: string;
  name: string;
  price: number;
  unit: string;
  available: boolean;
  imageUrl: string | null;
  companyLogo: string | null;
};

export type ResultadoProdutos =
  | { tipo: "ok"; produtos: Produto[] }
  | { tipo: "conexao" }
  | { tipo: "erro" };

export async function listarProdutos(
  categoria: string,
  limite = 5,
): Promise<ResultadoProdutos> {
  try {
    const { data } = await api.get<Produto[]>("/products", {
      params: { category: categoria, limit: limite },
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
    return { tipo: "erro" };
  }
}