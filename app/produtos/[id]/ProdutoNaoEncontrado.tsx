import Link from "next/link";

export default function ProdutoNaoEncontrado() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-3xl font-extrabold">Produto não encontrado</h1>
      <p className="max-w-md text-base">Ele pode ter sido removido, ou o endereço está incorreto.</p>
      <Link
        href="/produtos"
        className="rounded-full bg-roxo px-5 py-2.5 text-sm font-bold text-white hover:bg-[#5c2de0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roxo"
      >
        Ver todos os produtos
      </Link>
    </main>
  );
}
