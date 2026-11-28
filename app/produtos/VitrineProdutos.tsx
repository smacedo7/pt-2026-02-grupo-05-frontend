"use client";

import BarraBusca from "@/components/vitrine/BarraBusca";
import CarrosselCategorias from "@/components/vitrine/CarrosselCategorias";
import SecoesPorCategoria from "@/components/vitrine/SecoesPorCategoria";
import { useVitrine } from "@/components/vitrine/useVitrine";
import Navbar from "@/components/navbar/Navbar";

// A API não busca por nome: o filtro acontece no navegador, sobre o que já veio.
const AVISO_BUSCA =
  "A busca filtra pelo nome somente os produtos carregados nesta página (até 100 por categoria ou subcategoria).";

export default function VitrineProdutos() {
  const {
    buscaRef,
    produtosRef,
    textoBusca,
    setTextoBusca,
    limparBusca,
    rolarParaResultados,
    buscando,
    lista,
    lojas,
    tentarNovamente,
    secoesVisiveis,
    carregandoProdutos,
    totalEncontrados,
    categoriasComErro,
    semResultados,
    erroNaBusca,
  } = useVitrine();

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f3e4] font-sans text-preto">
      <Navbar />
      <main className="flex-1">
        <h1 className="sr-only">Produtos</h1>

        <div className="bg-preto pb-2 pt-8 md:pt-12">
          <div className="mx-auto max-w-7xl px-6">
            <CarrosselCategorias escuro lista={lista} aoTentarNovamente={tentarNovamente} />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-20 pt-4">
          <BarraBusca
            valor={textoBusca}
            aoMudar={setTextoBusca}
            aoEnviar={rolarParaResultados}
            aoLimpar={limparBusca}
            inputRef={buscaRef}
            aviso={AVISO_BUSCA}
          />

          <SecoesPorCategoria
            secaoRef={produtosRef}
            variante="fileira"
            mostrarResumoBusca
            secoesVisiveis={secoesVisiveis}
            lojas={lojas}
            textoBusca={textoBusca}
            buscando={buscando}
            carregandoProdutos={carregandoProdutos}
            totalEncontrados={totalEncontrados}
            categoriasComErro={categoriasComErro}
            semResultados={semResultados}
            erroNaBusca={erroNaBusca}
            aoLimparBusca={limparBusca}
            aoTentarNovamente={tentarNovamente}
          />
        </div>
      </main>
    </div>
  );
}
