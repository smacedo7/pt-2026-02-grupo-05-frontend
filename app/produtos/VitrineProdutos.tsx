"use client";

import { useRef } from "react";
import BarraBusca from "@/components/home/BarraBusca";
import CarrosselCategorias from "@/components/home/CarrosselCategorias";
import SecoesPorCategoria from "@/components/home/SecoesPorCategoria";
import { useVitrine } from "@/components/home/useVitrine";
import Navbar from "@/components/navbar/Navbar";

// A API não busca por nome: o filtro acontece no navegador, sobre o que já veio.
const AVISO_BUSCA =
  "A busca filtra pelo nome somente os produtos carregados nesta página (até 100 por categoria ou subcategoria).";

export default function VitrineProdutos() {
  const vitrine = useVitrine();
  const produtosRef = useRef<HTMLElement>(null);

  const rolarParaResultados = () => {
    if (vitrine.buscando) {
      produtosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
          <BarraBusca
            valor={vitrine.textoBusca}
            aoMudar={vitrine.setTextoBusca}
            aoEnviar={rolarParaResultados}
            aoLimpar={vitrine.limparBusca}
            inputRef={vitrine.buscaRef}
            aviso={AVISO_BUSCA}
          />

          <SecoesPorCategoria ref={produtosRef} variante="fileira" vitrine={vitrine} />
        </div>
      </main>
    </div>
  );
}
