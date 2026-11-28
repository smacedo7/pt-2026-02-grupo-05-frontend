"use client";

import Image from 'next/image';
import Navbar from '@/components/navbar/Navbar';
import BarraBusca from '@/components/vitrine/BarraBusca';
import CarrosselCategorias from '@/components/vitrine/CarrosselCategorias';
import SecoesPorCategoria from '@/components/vitrine/SecoesPorCategoria';
import { useVitrine } from '@/components/vitrine/useVitrine';

export default function Home() {
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
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[#fcf9f2] font-sans">
      <Navbar />

      <section aria-label="Apresentação" className="w-full bg-preto">
        <div className="mx-auto flex h-[368px] max-w-7xl items-center justify-between gap-4 px-6 md:h-[418px]">
          {/* A fonte acompanha a largura para as duas linhas nunca quebrarem. */}
          <h1 className="flex w-fit flex-col pb-12 font-sans text-[clamp(1.375rem,7.2vw,1.875rem)] font-bold leading-none tracking-normal text-white md:items-end md:text-[clamp(1.875rem,4vw,3.4375rem)]">
            <span className="whitespace-nowrap">Do CAOS à organização,</span>
            <span className="whitespace-nowrap">em alguns cliques</span>
          </h1>

          {/* Apoiado na base do banner; 460px de largura dão 405px de altura, que cabem nos 418px. */}
          <Image
            src="/mascote-home.png"
            alt=""
            width={832}
            height={732}
            sizes="(min-width: 1150px) 460px, 40vw"
            className="hidden h-auto w-[40vw] max-w-[460px] shrink-0 self-end md:block"
            priority
          />
        </div>
      </section>

      <section aria-label="Conteúdo principal" className="relative z-20 flex-1 bg-[#fcf9f2] pb-20 pt-8">
        <div className="mx-auto max-w-7xl px-6">
          <BarraBusca
            valor={textoBusca}
            aoMudar={setTextoBusca}
            aoEnviar={rolarParaResultados}
            aoLimpar={limparBusca}
            inputRef={buscaRef}
          />

          <CarrosselCategorias lista={lista} aoTentarNovamente={tentarNovamente} />

          <SecoesPorCategoria
            secaoRef={produtosRef}
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
      </section>
    </main>
  );
}
