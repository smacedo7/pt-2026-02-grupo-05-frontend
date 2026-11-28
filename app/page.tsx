"use client";

import { useRef } from 'react';
import Image from 'next/image';
import Navbar from '@/components/navbar/Navbar';
import BarraBusca from '@/components/home/BarraBusca';
import CarrosselCategorias from '@/components/home/CarrosselCategorias';
import SecoesPorCategoria from '@/components/home/SecoesPorCategoria';
import { useVitrine } from '@/components/home/useVitrine';

export default function Home() {
  const produtosRef = useRef<HTMLElement>(null);
  const vitrine = useVitrine();

  const rolarParaResultados = () => {
    if (vitrine.buscando) {
      produtosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[#fcf9f2] font-sans">
      <Navbar />

      <section aria-label="Apresentação" className="relative w-full overflow-hidden bg-[#0b0b0b] pt-12">
        <div className="relative mx-auto h-[320px] max-w-7xl px-6 md:h-[370px]">
          <div className="absolute left-6 top-[37%] z-20 -translate-y-1/2 md:left-22">
            <h1 className="flex flex-col font-sans text-3xl font-bold leading-[1] tracking-normal text-white md:text-[55px]">
              <span className="md:whitespace-nowrap">Do CAOS à organização,</span>
              <span className="md:ml-20 md:whitespace-nowrap lg:ml-[148px]">em alguns cliques</span>
            </h1>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-11 right-5 z-0 hidden h-[750px] w-[500px] md:block md:h-[800px] md:w-[600px]"
          >
            <Image
              src="/mascote-home.png"
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              className="object-contain object-top"
              priority
            />
          </div>
        </div>
      </section>

      <section aria-label="Conteúdo principal" className="relative z-20 flex-1 bg-[#fcf9f2] pb-20 pt-8">
        <div className="mx-auto max-w-7xl px-6">
          <BarraBusca
            valor={vitrine.textoBusca}
            aoMudar={vitrine.setTextoBusca}
            aoEnviar={rolarParaResultados}
            aoLimpar={vitrine.limparBusca}
            inputRef={vitrine.buscaRef}
          />

          <CarrosselCategorias lista={vitrine.lista} aoTentarNovamente={vitrine.tentarNovamente} />

          <SecoesPorCategoria ref={produtosRef} vitrine={vitrine} />
        </div>
      </section>
    </main>
  );
}
