import type { Metadata } from "next";
import Navbar from "@/components/navbar/Navbar";

export const metadata: Metadata = { title: "Produtos | Stock.io" };

export default function PaginaProdutos() {
  return (
    <div className="flex min-h-screen flex-col bg-creme font-sans text-preto">
      <Navbar />
      <header className="bg-preto text-creme">
        <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-8 md:px-10 md:pb-16 md:pt-12">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">Produtos</h1>
        </div>
      </header>
    </div>
  );
}
