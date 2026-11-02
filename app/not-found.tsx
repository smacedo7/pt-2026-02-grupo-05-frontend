import Link from "next/link";

export default function PaginaNaoEncontrada() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-creme px-6 text-center text-preto">
      <h1 className="text-3xl font-extrabold">Página não encontrada</h1>
      <p className="max-w-md text-base">O endereço informado não corresponde a nenhuma página ou categoria.</p>
      <Link
        href="/"
        className="rounded-full bg-roxo px-5 py-2.5 text-sm font-bold text-white hover:bg-[#5c2de0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roxo"
      >
        Voltar para o início
      </Link>
    </main>
  );
}
