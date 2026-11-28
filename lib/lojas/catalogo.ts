import {
  prepararCategoriasVitrine,
  type CategoriaVitrine,
} from "@/components/vitrine/categorias";
import {
  correspondeBuscaPorNome,
  normalizarTextoBusca,
} from "@/lib/categorias/catalogo";
import type { CategoriaApi } from "@/lib/categorias/tipos";
import type { CategoriaResumo, Loja } from "./tipos";

export type OrdenacaoLojas = "nome-asc" | "nome-desc" | "recentes";

export type CriteriosFiltroLojas = {
  busca: string;
  categoriaId: number | null;
  ordenacao: OrdenacaoLojas;
};

export type OpcaoCategoriaFiltro = {
  id: number;
  rotulo: string;
  ehSubcategoria: boolean;
};

export const OPCOES_ORDENACAO_LOJAS: {
  valor: OrdenacaoLojas;
  rotulo: string;
}[] = [
  { valor: "nome-asc", rotulo: "Nome (A–Z)" },
  { valor: "nome-desc", rotulo: "Nome (Z–A)" },
  { valor: "recentes", rotulo: "Mais recentes" },
];

const COMPARADORES: Record<OrdenacaoLojas, (a: Loja, b: Loja) => number> = {
  "nome-asc": (a, b) =>
    a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }) ||
    a.id - b.id,
  "nome-desc": (a, b) =>
    b.name.localeCompare(a.name, "pt-BR", { sensitivity: "base" }) ||
    a.id - b.id,
  recentes: (a, b) =>
    Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id - a.id,
};

/** Converte categorias da API para o formato da faixa de categorias do cabeçalho. */
export function prepararCategoriasRaizLojas(
  categorias: CategoriaResumo[],
): CategoriaVitrine[] {
  const raizes: CategoriaApi[] = categorias
    .filter((cat) => (cat.parentCategoryId ?? null) === null)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parentCategoryId: cat.parentCategoryId ?? null,
    }));

  return prepararCategoriasVitrine(raizes);
}

/** Coleta o ID da categoria selecionada e os IDs de todas as suas subcategorias. */
export function coletarIdsCategoriaComDescendentes(
  categoriaId: number,
  categorias: CategoriaResumo[],
): Set<number> {
  const filhosPorPai = new Map<number, number[]>();
  for (const cat of categorias) {
    const pai = cat.parentCategoryId ?? null;
    if (pai === null) continue;
    const lista = filhosPorPai.get(pai) ?? [];
    lista.push(cat.id);
    filhosPorPai.set(pai, lista);
  }

  const ids = new Set<number>([categoriaId]);
  const fila = [categoriaId];
  while (fila.length > 0) {
    const atual = fila.shift()!;
    for (const filhoId of filhosPorPai.get(atual) ?? []) {
      if (!ids.has(filhoId)) {
        ids.add(filhoId);
        fila.push(filhoId);
      }
    }
  }
  return ids;
}

/** Organiza categorias raiz e subcategorias para o seletor de filtros. */
export function montarOpcoesCategoriasFiltro(
  categorias: CategoriaResumo[],
): OpcaoCategoriaFiltro[] {
  const raizesOrdenadas = prepararCategoriasRaizLojas(categorias);
  const porPai = new Map<number, CategoriaResumo[]>();

  for (const cat of categorias) {
    const pai = cat.parentCategoryId ?? null;
    if (pai === null) continue;
    const lista = porPai.get(pai) ?? [];
    lista.push(cat);
    porPai.set(pai, lista);
  }

  for (const lista of porPai.values()) {
    lista.sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }),
    );
  }

  const opcoes: OpcaoCategoriaFiltro[] = [];
  const visitados = new Set<number>();

  const adicionarArvore = (id: number, rotulo: string, nivel: number) => {
    if (visitados.has(id)) return;
    visitados.add(id);
    opcoes.push({
      id,
      rotulo: nivel > 0 ? `${"— ".repeat(nivel)}${rotulo}` : rotulo,
      ehSubcategoria: nivel > 0,
    });
    for (const filha of porPai.get(id) ?? []) {
      adicionarArvore(filha.id, filha.name, nivel + 1);
    }
  };

  for (const raiz of raizesOrdenadas) {
    adicionarArvore(raiz.id, raiz.nome, 0);
  }

  for (const cat of categorias) {
    if (!visitados.has(cat.id)) {
      adicionarArvore(cat.id, cat.name, 0);
    }
  }

  return opcoes;
}

/** Filtra lojas por nome e categoria (incluindo subcategorias) e aplica ordenação. */
export function filtrarEOrdenarLojas(
  lojas: Loja[],
  categorias: CategoriaResumo[],
  criterios: CriteriosFiltroLojas,
): Loja[] {
  const termo = normalizarTextoBusca(criterios.busca);
  const idsPermitidos =
    criterios.categoriaId !== null
      ? coletarIdsCategoriaComDescendentes(criterios.categoriaId, categorias)
      : null;

  return lojas
    .filter(
      (loja) =>
        correspondeBuscaPorNome(loja.name, termo) &&
        (idsPermitidos === null || idsPermitidos.has(loja.categoryId)),
    )
    .sort(COMPARADORES[criterios.ordenacao]);
}
