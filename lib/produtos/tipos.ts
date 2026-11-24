export type ProdutoDetalhe = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  estoque: number;
  categoriaNome: string;
  lojaId: string;
  lojaNome: string;
  lojaLogoUrl: string | null;
  imagens: string[];
  notaMedia: number | null;
  totalAvaliacoes: number;
};