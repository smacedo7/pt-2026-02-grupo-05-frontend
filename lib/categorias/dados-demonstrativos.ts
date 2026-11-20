import type { Categoria, Produto } from "./tipos";

// Dados demonstrativos. Ficam isolados aqui para serem trocados pela integração
// com a API sem mexer na apresentação. As funções são assíncronas para que o
// formato de uso já seja o mesmo de uma chamada HTTP.

const CATEGORIAS: Categoria[] = [
  {
    slug: "tecnologia",
    nome: "Tecnologia",
    chamada: "O universo da tecnologia em um só lugar",
    subcategorias: [
      { slug: "celulares", nome: "Celulares" },
      { slug: "notebooks", nome: "Notebooks" },
      { slug: "tvs", nome: "TVs" },
      { slug: "acessorios", nome: "Acessórios" },
      { slug: "outros", nome: "Outros" },
    ],
  },
];

// A ordem deste array é a ordem padrão de exibição do catálogo.
const PRODUTOS: Produto[] = [
  {
    id: "1",
    nome: "Comp. Lenovo",
    preco: 3899.99,
    disponivel: true,
    imagemUrl: null,
    categoriaSlug: "tecnologia",
    subcategoriaSlug: "notebooks",
    criadoEm: "2026-09-12",
    avaliacao: 4.5,
  },
  {
    id: "2",
    nome: "Comp. Samsung",
    preco: 8549.99,
    disponivel: false,
    imagemUrl: null,
    categoriaSlug: "tecnologia",
    subcategoriaSlug: "notebooks",
    criadoEm: "2026-10-03",
    avaliacao: 4.2,
  },
  {
    id: "3",
    nome: "Iphone 15",
    preco: 4769.1,
    disponivel: true,
    imagemUrl: null,
    categoriaSlug: "tecnologia",
    subcategoriaSlug: "celulares",
    criadoEm: "2026-08-21",
    avaliacao: 4.8,
  },
  {
    id: "4",
    nome: "Smart Tv Philips",
    preco: 1229,
    disponivel: true,
    imagemUrl: null,
    categoriaSlug: "tecnologia",
    subcategoriaSlug: "tvs",
    criadoEm: "2026-07-15",
    avaliacao: 3.9,
  },
  {
    id: "5",
    nome: "Xbox Series X",
    preco: 3599.99,
    disponivel: true,
    imagemUrl: null,
    categoriaSlug: "tecnologia",
    subcategoriaSlug: "outros",
    criadoEm: "2026-10-20",
    avaliacao: 4.8,
  },
];

export function listarSlugsDeCategorias(): string[] {
  return CATEGORIAS.map((categoria) => categoria.slug);
}

export async function buscarCategoria(slug: string): Promise<Categoria | null> {
  return CATEGORIAS.find((categoria) => categoria.slug === slug) ?? null;
}

export async function listarProdutosDaCategoria(slug: string): Promise<Produto[]> {
  return PRODUTOS.filter((produto) => produto.categoriaSlug === slug);
}
