import axios from "axios";
import { api } from "@/lib/api";
import type { Produto } from "@/lib/categorias/tipos";
import { listarImagensProduto } from "@/lib/produtos/produtosApi";

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

    const imagensResultados = await Promise.allSettled(
      data.map((item) => listarImagensProduto(item.id))
    );

    // Mapeia o DTO do backend para o tipo Produto do CardProduto
    const produtosMapeados: Produto[] = data.map((item, idx) => {
      const resImg = imagensResultados[idx];
      const primeiraImagem =
        resImg?.status === "fulfilled" ? (resImg.value[0]?.imageUrl ?? null) : null;

      return {
        id: String(item.id),
        nome: item.name,
        preco: item.price,
        disponivel: item.stock > 0,
        imagemUrl: primeiraImagem,
        categoriaSlug: "",
        subcategoriaSlug: "",
        criadoEm: item.createdAt,
      };
    });

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