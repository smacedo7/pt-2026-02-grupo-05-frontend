import type { CategoriaApi } from '@/lib/categorias/tipos';

export type CategoriaHome = {
  nome: string;
  slug: string;
  imagem: string | null;
};

export type EstadoListaCategorias =
  | { status: 'carregando' }
  | { status: 'ok'; categorias: CategoriaHome[] }
  | { status: 'erro'; mensagem: string };

// A API não guarda imagem de categoria: a home escolhe pelo slug.
// A ordem desta lista é a ordem de exibição.
const IMAGENS_POR_SLUG = new Map(
  ['mercado', 'farmacia', 'beleza', 'moda', 'eletronicos', 'jogos', 'brinquedos', 'casa'].map(
    (slug) => [slug, `/imagens/categorias/${slug}.png`],
  ),
);
const ORDEM = [...IMAGENS_POR_SLUG.keys()];

/** Ordena as categorias da API; as sem posição definida ficam no fim, na ordem recebida. */
export function prepararCategoriasHome(categorias: CategoriaApi[]): CategoriaHome[] {
  const posicao = (slug: string) => {
    const indice = ORDEM.indexOf(slug);
    return indice === -1 ? ORDEM.length : indice;
  };
  return categorias
    .map(({ name, slug }) => ({ nome: name, slug, imagem: IMAGENS_POR_SLUG.get(slug) ?? null }))
    .sort((a, b) => posicao(a.slug) - posicao(b.slug));
}
