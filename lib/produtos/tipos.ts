export type ProdutoDetalhe = {
  id: number;
  storeId: number;
  categoryId: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
  store: {
    id: number;
    name: string;
    logoUrl: string | null; // ainda falta adicionar no backend
  };
  category: {
    id: number;
    name: string;
    slug: string;
  };
  images: { id: number; imageUrl: string; sortOrder: number }[]; // ainda falta adicionar
  ratingAverage: number | null; // ainda falta adicionar (null se não houver avaliações)
  ratingCount: number; // ainda falta adicionar
};