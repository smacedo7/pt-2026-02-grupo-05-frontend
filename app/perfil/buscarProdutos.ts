import axios from "axios";
import { api } from "@/lib/api";
import type { Produto } from "@/lib/categorias/tipos";

export type ResultadoProdutos =
  | { tipo: "ok"; produtos: Produto[] }
  | { tipo: "conexao" }
  | { tipo: "erro" };

// Espelho do ProductResponseDto do backend
type ProdutoBackend = {
  id: number;
  name: string;
  price: number;
  stock: number;
  createdAt: string;
};

export async function buscarProdutos(limite = 10): Promise<ResultadoProdutos> {
  try {
    const { data } = await api.get<ProdutoBackend[]>("/products", {
      params: { limit: limite },
    });

    if (!Array.isArray(data)) {
      return { tipo: "erro" };
    }

    // Mapeia o DTO do backend para o tipo Produto do CardProduto
    const produtosMapeados: Produto[] = data.map((item) => ({
      id: String(item.id),
      nome: item.name,
      preco: item.price,
      disponivel: item.stock > 0,
      imagemUrl: null, // Backend ainda não manda imagem na listagem
      categoriaSlug: "",
      subcategoriaSlug: "",
      criadoEm: item.createdAt,
      avaliacao: 0,
    }));

    return { tipo: "ok", produtos: produtosMapeados };
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