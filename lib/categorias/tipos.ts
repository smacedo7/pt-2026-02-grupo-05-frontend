export type Subcategoria = {
  slug: string;
  nome: string;
};

export type Categoria = {
  slug: string;
  nome: string;
  chamada: string;
  subcategorias: Subcategoria[];
};

export type Produto = {
  id: string;
  nome: string;
  preco: number;
  disponivel: boolean;
  imagemUrl: string | null;
  categoriaSlug: string;
  subcategoriaSlug: string;
  criadoEm: string;
  avaliacao: number;
};
