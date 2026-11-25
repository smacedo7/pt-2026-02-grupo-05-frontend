export type CategoriaHome = {
  nome: string;
  slug: string;
  imagem: string;
};

// Gera o slug da categoria: 'Farmácia' → 'farmacia', 'Eletrônicos' → 'eletronicos'
function slugify(nome: string): string {
  return nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const NOMES_IMAGENS_CATEGORIAS: ReadonlyArray<{ nome: string; imagem: string }> = [
  { nome: 'Mercado', imagem: '/imagens/categorias/mercado.png' },
  { nome: 'Farmácia', imagem: '/imagens/categorias/farmacia.png' },
  { nome: 'Beleza', imagem: '/imagens/categorias/beleza.png' },
  { nome: 'Moda', imagem: '/imagens/categorias/moda.png' },
  { nome: 'Eletrônicos', imagem: '/imagens/categorias/eletronicos.png' },
  { nome: 'Jogos', imagem: '/imagens/categorias/jogos.png' },
  { nome: 'Brinquedos', imagem: '/imagens/categorias/brinquedos.png' },
  { nome: 'Casa', imagem: '/imagens/categorias/casa.png' },
];

export const CATEGORIAS_HOME: readonly CategoriaHome[] = NOMES_IMAGENS_CATEGORIAS.map((cat) => ({
  ...cat,
  slug: slugify(cat.nome),
}));
