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

/**
 * Produtos das lojas do usuário. GET /products filtra por uma loja de cada vez,
 * então consulta cada loja e junta o resultado, em ordem de nome.
 */
export async function buscarProdutos(
  usuarioId: number,
  limite = 10,
): Promise<ResultadoProdutos> {
  try {
    const { data: lojas } = await api.get<{ id: number }[]>("/stores", {
      params: { userId: usuarioId, limit: 100 },
    });
    if (!Array.isArray(lojas)) {
      return { tipo: "erro" };
    }

    const listas = await Promise.all(
      lojas.map((loja) =>
        api.get<ProdutoBackend[]>("/products", {
          params: { storeId: loja.id, limit: limite },
        }),
      ),
    );
    if (listas.some((resposta) => !Array.isArray(resposta.data))) {
      return { tipo: "erro" };
    }
    const data = listas
      .flatMap((resposta) => resposta.data)
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR") || a.id - b.id)
      .slice(0, limite);

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