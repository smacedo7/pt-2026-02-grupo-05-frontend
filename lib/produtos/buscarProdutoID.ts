import axios from "axios";
import { api } from "@/lib/api";
import type { ProdutoDetalhe } from "./tipos";

export type ResultadoProduto =
  | { tipo: "ok"; produto: ProdutoDetalhe }
  | { tipo: "naoEncontrado" }
  | { tipo: "conexao" }
  | { tipo: "erro" };

type ProdutoDetalheBackend = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  store: { id: number; name: string; logoUrl?: string | null };
  category: { id: number; name: string; slug: string };
  images?: { id: number; imageUrl: string; sortOrder: number }[];
  ratingAverage?: number | null;
  ratingCount?: number;
};

export async function buscarProdutoPorId(id: number): Promise<ResultadoProduto> {
  try {
    const { data } = await api.get<ProdutoDetalheBackend>(`/products/${id}`);

    const produto: ProdutoDetalhe = {
      id: String(data.id),
      nome: data.name,
      descricao: data.description,
      preco: data.price,
      estoque: data.stock,
      categoriaNome: data.category.name,
      lojaId: String(data.store.id),
      lojaNome: data.store.name,
      lojaLogoUrl: data.store.logoUrl ?? null,
      imagens: (data.images ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((imagem) => imagem.imageUrl),
      notaMedia: data.ratingAverage ?? null,
      totalAvaliacoes: data.ratingCount ?? 0,
    };

    return { tipo: "ok", produto };
  } catch (erro) {
    if (!axios.isAxiosError(erro)) {
      return { tipo: "erro" };
    }
    if (!erro.response) {
      return { tipo: "conexao" };
    }
    if (erro.response.status === 404) {
      return { tipo: "naoEncontrado" };
    }
    return { tipo: "erro" };
  }
}