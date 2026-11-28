export type CategoriaApi = {
  id: number;
  name: string;
  slug: string;
  parentCategoryId: number | null;
};

export type CategoriaDetalheApi = CategoriaApi & {
  subcategories: { id: number; name: string; slug: string }[];
};

export type Subcategoria = {
  slug: string;
  nome: string;
};

export type Categoria = {
  slug: string;
  nome: string;
  chamada?: string;
  subcategorias: Subcategoria[];
};

/** Formato exibido pelos cards. Os campos opcionais só aparecem quando informados. */
export type Produto = {
  id: string;
  nome: string;
  preco: number;
  disponivel: boolean;
  imagemUrl: string | null;
  categoriaSlug: string;
  subcategoriaSlug: string;
  criadoEm: string;
  avaliacao?: number;
  estoque?: number;
  /** null: a tela não recebeu o nome da loja e mostra o aviso no lugar. */
  lojaNome?: string | null;
  categoriaNome?: string;
};
