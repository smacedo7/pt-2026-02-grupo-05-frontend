import axios from "axios";
import { api } from "@/lib/api";
import type { CategoriaApi, CategoriaDetalheApi } from "@/lib/categorias/tipos";
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

/**
 * Reúne os produtos cadastrados na categoria raiz e em suas subcategorias.
 * A API filtra somente pelo `categoryId` exato; sem essa junção, a home
 * deixaria de mostrar, por exemplo, eletrônicos cadastrados em "Celulares".
 */
export async function listarProdutosDaCategoriaHome(
  categoria: Pick<CategoriaApi, "id" | "slug">,
): Promise<ResultadoProdutos> {
  try {
    const { data: detalhe } = await api.get<CategoriaDetalheApi>(
      `/categories/by-slug/${categoria.slug}`,
      { timeout: 10000 },
    );

    const respostas = await Promise.all(
      [categoria.id, ...detalhe.subcategories.map((subcategoria) => subcategoria.id)].map((categoryId) =>
        listarProdutos(categoryId, 100),
      ),
    );
    const falha = respostas.find((resposta) => resposta.tipo !== "ok");
    if (falha) return { tipo: falha.tipo };

    const produtos = respostas.flatMap((resposta) =>
      resposta.tipo === "ok" ? resposta.produtos : [],
    );
    produtos.sort((a, b) => a.name.localeCompare(b.name, "pt-BR") || a.id - b.id);

    return { tipo: "ok", produtos };
  } catch (erro) {
    if (!axios.isAxiosError(erro)) return { tipo: "erro" };
    if (!erro.response) return { tipo: "conexao" };
    if (erro.response.status === 400) return { tipo: "invalida" };
    if (erro.response.status === 404) return { tipo: "nao-encontrada" };
    return { tipo: "erro" };
  }
}
