import type { CategoriaDetalheApi } from "./tipos";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
// Mesma regra do backend (src/categories/slug.ts).
const SLUG_VALIDO = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TAMANHO_MAXIMO = 120;

export type ResultadoCategoria =
  | { tipo: "ok"; categoria: CategoriaDetalheApi }
  | { tipo: "nao-encontrada" }
  | { tipo: "erro" };

export async function buscarCategoriaPorSlug(slug: string): Promise<ResultadoCategoria> {
  // Um slug fora do formato não existe; assim "." e ".." também não mudam a rota chamada.
  if (slug.length > TAMANHO_MAXIMO || !SLUG_VALIDO.test(slug)) {
    return { tipo: "nao-encontrada" };
  }
  try {
    const resposta = await fetch(`${API_URL}/categories/by-slug/${slug}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (resposta.status === 404) return { tipo: "nao-encontrada" };
    if (!resposta.ok) return { tipo: "erro" };
    const categoria = (await resposta.json()) as CategoriaDetalheApi;
    if (typeof categoria?.name !== "string" || !Array.isArray(categoria.subcategories)) {
      return { tipo: "erro" };
    }
    return { tipo: "ok", categoria };
  } catch {
    return { tipo: "erro" };
  }
}
