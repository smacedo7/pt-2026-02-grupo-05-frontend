import type { Produto } from "./tipos";

export type Ordenacao = "padrao" | "menor-preco" | "maior-preco" | "recentes" | "melhor-avaliados";

export type Criterios = {
  busca: string;
  subcategoriaSlug: string | null;
  ordenacao: Ordenacao;
};

export const OPCOES_ORDENACAO: { valor: Ordenacao; rotulo: string }[] = [
  { valor: "padrao", rotulo: "Ordem padrão" },
  { valor: "menor-preco", rotulo: "Menor preço" },
  { valor: "maior-preco", rotulo: "Maior preço" },
  { valor: "recentes", rotulo: "Recém-adicionados" },
  { valor: "melhor-avaliados", rotulo: "Melhor avaliados" },
];

const COMPARADORES: Record<Ordenacao, (a: Produto, b: Produto) => number> = {
  padrao: () => 0,
  "menor-preco": (a, b) => a.preco - b.preco,
  "maior-preco": (a, b) => b.preco - a.preco,
  recentes: (a, b) => Date.parse(b.criadoEm) - Date.parse(a.criadoEm),
  "melhor-avaliados": (a, b) => b.avaliacao - a.avaliacao,
};

// Filtra por subcategoria e por nome (sem diferenciar maiúsculas/minúsculas) e
// ordena. Os critérios combinam. Empates mantêm a ordem padrão, pois a ordenação
// do JavaScript é estável.
export function filtrarEOrdenar(produtos: Produto[], criterios: Criterios): Produto[] {
  const termo = criterios.busca.trim().toLocaleLowerCase("pt-BR");

  return produtos
    .filter(
      (produto) =>
        (criterios.subcategoriaSlug === null ||
          produto.subcategoriaSlug === criterios.subcategoriaSlug) &&
        produto.nome.toLocaleLowerCase("pt-BR").includes(termo),
    )
    .sort(COMPARADORES[criterios.ordenacao]);
}
