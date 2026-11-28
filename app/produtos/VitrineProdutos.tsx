"use client";

import CarrosselCategorias from "@/components/home/CarrosselCategorias";
import SecoesPorCategoria from "@/components/home/SecoesPorCategoria";
import { useVitrine } from "@/components/home/useVitrine";
import Navbar from "@/components/navbar/Navbar";

export default function VitrineProdutos() {
  const vitrine = useVitrine();

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f3e4] font-sans text-preto">
      <Navbar />
      <main className="flex-1">
        <h1 className="sr-only">Produtos</h1>

        <div className="bg-preto pb-2 pt-8 md:pt-12">
          <div className="mx-auto max-w-7xl px-6">
            <CarrosselCategorias escuro lista={vitrine.lista} aoTentarNovamente={vitrine.tentarNovamente} />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-20 pt-4">
          <SecoesPorCategoria variante="fileira" vitrine={vitrine} />
        </div>
      </main>
    </div>
  );
}
