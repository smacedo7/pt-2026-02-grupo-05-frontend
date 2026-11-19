import Link from "next/link";
import CardProduto from "@/app/categorias/[slug]/CardProduto";
import type { Produto } from "@/lib/categorias/tipos";

type Usuario = {
  nome: string;
  usuario: string;
  email: string;
  foto?: string;
  produtos: Produto[];
};

// depois vou trocar pelo da api
const usuario: Usuario = {
  nome: "Nome do Usuário",
  usuario: "nomeusuario",
  email: "usuario@email.com",
  foto: undefined,
  produtos: [
    {
      id: "1",
      nome: "Produto A",
      preco: 254.99,
      disponivel: true,
      imagemUrl: null,
      categoriaSlug: "tecnologia",
      subcategoriaSlug: "exemplo",
      criadoEm: "2026-11-01T10:00:00Z",
      avaliacao: 4.5,
    },
    {
      id: "2",
      nome: "Produto B",
      preco: 199.99,
      disponivel: false,
      imagemUrl: null,
      categoriaSlug: "tecnologia",
      subcategoriaSlug: "exemplo",
      criadoEm: "2026-11-02T10:00:00Z",
      avaliacao: 4.0,
    },
    {
      id: "3",
      nome: "Produto C",
      preco: 599.9,
      disponivel: true,
      imagemUrl: null,
      categoriaSlug: "tecnologia",
      subcategoriaSlug: "exemplo",
      criadoEm: "2026-11-03T10:00:00Z",
      avaliacao: 5.0,
    },
  ],
};

// depois isso vai mudar pra quando tiver logado ou não
const ehDono = true;

export default function PerfilPage() {
  const inicial = usuario.nome.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-creme pb-12">
      {/* espaço pra navbar que vai vir depois */}
      <header className="w-full bg-preto pt-28">
        <div className="relative mx-auto h-24 max-w-7xl px-6 sm:h-40 lg:h-[325px]">
          <Link
            href="/"
            aria-label="Voltar"
            className="absolute bottom-4 left-2 h-9 w-6 rounded text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:bottom-8 sm:left-6 sm:h-11 sm:w-7 lg:bottom-[52px] lg:h-[55px] lg:w-9"
          >
            <svg
              viewBox="0 0 35 55"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-full w-full"
              aria-hidden="true"
            >
              <path d="M31 3L4 27.5L31 52" />
            </svg>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6">
        {/* cabeçalho do perfil */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 lg:ml-[72px]">
             {/* deixa a foto por cima da parte preta */}
            <div className="relative z-10 -mt-14 ml-7 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gray-300 sm:-mt-24 sm:ml-0 sm:h-44 sm:w-44 lg:-mt-[190px] lg:h-[230px] lg:w-[230px]">
              {usuario.foto ? (
                <img
                  src={usuario.foto}
                  alt={`Foto de ${usuario.nome}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-gray-600 sm:text-6xl lg:text-8xl">
                  {inicial}
                </span>
              )}
            </div>

            <h1 className="mt-3 break-words text-3xl font-bold sm:text-5xl lg:leading-none">
              {usuario.nome}
            </h1>
            <p className="mt-2 text-lg text-gray-500 sm:mt-3 sm:text-2xl lg:leading-none">
              @ {usuario.usuario}
            </p>
            <p className="mt-2 flex items-center gap-2 break-all text-lg text-gray-500 sm:mt-3.5 sm:text-2xl lg:leading-none">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5 shrink-0 sm:h-6 sm:w-6 lg:h-[22px] lg:w-[22px]"
                aria-hidden="true"
              >
                <path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v.5l-10 6.25L2 6.5V6zm0 3.35V18a2 2 0 002 2h16a2 2 0 002-2V9.35l-9.47 5.92a1 1 0 01-1.06 0L2 9.35z" />
              </svg>
              {usuario.email}
            </p>
          </div>

          {ehDono && (
            <Link
              href="/perfil/editar"
              className="flex w-full items-center justify-center rounded-full bg-[#6D3BFF] px-8 py-3 text-lg font-medium text-white shadow-md hover:bg-[#5a2ee0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D3BFF] focus-visible:ring-offset-2 sm:mt-6 sm:w-auto lg:mt-8 lg:h-11 lg:w-[324px] lg:py-0 lg:text-xl"
            >
              Editar Perfil
            </Link>
          )}
        </section>

        {/* produtos */}
        <section className="mt-10 lg:mt-16" aria-labelledby="titulo-produtos">
          <div className="flex items-baseline justify-between">
            <h2
              id="titulo-produtos"
              className="text-2xl font-bold sm:text-3xl lg:text-[32px] lg:leading-none"
            >
              Produtos
            </h2>
            {usuario.produtos.length > 0 && (
              <Link
                href="/perfil/produtos"
                className="text-sm font-semibold text-[#6D3BFF] hover:underline"
              >
                ver mais
              </Link>
            )}
          </div>

          {usuario.produtos.length > 0 ? (
            <div className="mt-4 flex snap-x gap-4 overflow-x-auto pb-4 lg:mt-11 lg:gap-8">
              {usuario.produtos.map((produto) => (
                <div
                  key={produto.id}
                  className="w-48 shrink-0 snap-start sm:w-56 lg:w-[229px]"
                >
                  <CardProduto produto={produto} />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-gray-500">Nenhum produto cadastrado ainda.</p>
          )}
        </section>
      </div>
    </main>
  );
}