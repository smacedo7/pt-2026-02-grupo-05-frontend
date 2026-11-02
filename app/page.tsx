"use client";

import React, { useRef } from 'react';
import Image from 'next/image';

//vai ser alterado para ficar identico ao DTO
interface Produto {
  id: string | number;
  nome: string;
  preco: string;
  unidade: string;
  disponivel: boolean;
  imagemUrl: string;
  empresaLogo: string;
  isPlaceholder?: boolean;
}

const categorias = [
  { nome: 'Mercado', imagem: '/categorias/mercado.png' },
  { nome: 'Farmácia', imagem: '/categorias/farmacia.png' },
  { nome: 'Beleza', imagem: '/categorias/beleza.png' },
  { nome: 'Moda', imagem: '/categorias/moda.png' },
  { nome: 'Eletrônicos', imagem: '/categorias/eletronicos.png' },
  { nome: 'Jogos', imagem: '/categorias/jogos.png' },
  { nome: 'Brinquedos', imagem: '/categorias/brinquedos.png' },
  { nome: 'Casa', imagem: '/categorias/casa.png' },
];

//placeholder pré integração com o BACK (vai ser substituido)
const mockData: Record<string, Produto[]> = {
  mercado: [
    { id: 1, nome: 'Brownie Meio A.', preco: '4,70', unidade: 'kg', disponivel: true, imagemUrl: '', empresaLogo: 'CJR' },
    { id: 2, nome: 'Brownie Trad.', preco: '3,80', unidade: 'kg', disponivel: false, imagemUrl: '', empresaLogo: 'CJR' },
    { id: 3, nome: 'Nozes', preco: '29,99', unidade: 'kg', disponivel: true, imagemUrl: '', empresaLogo: 'G5' },
    { id: 4, nome: 'Banana', preco: '3,99', unidade: 'kg', disponivel: true, imagemUrl: '', empresaLogo: 'NATU' },
    { id: 5, nome: 'Limão Siciliano', preco: '17,99', unidade: 'kg', disponivel: false, imagemUrl: '', empresaLogo: 'NATU' },
  ],
  farmacia: [
    { id: 6, nome: '', preco: '', unidade: '', disponivel: true, imagemUrl: '', empresaLogo: '' },
    { id: 7, nome: '', preco: '', unidade: '', disponivel: false, imagemUrl: '', empresaLogo: '' },
    { id: 8, nome: '', preco: '', unidade: '', disponivel: false, imagemUrl: '', empresaLogo: '' },
    { id: 9, nome: '', preco: '', unidade: '', disponivel: true, imagemUrl: '', empresaLogo: '' },
    { id: 10, nome: '', preco: '', unidade: '', disponivel: true, imagemUrl: '', empresaLogo: '' },
  ],
  beleza: [],
  moda: [],
  eletronicos: [],
  jogos: [],
  brinquedos: [],
  casa: [],
};

//para teste
const ProductCard = ({ produto }: { produto: Produto }) => {
  

  if (produto.isPlaceholder) {
    return (
      <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col justify-between h-[260px]">
        <div className="bg-gray-100/50 aspect-square rounded-xl mb-4 flex items-center justify-center">
          <span className="text-gray-300 text-sm font-medium">Espaço vazio</span>
        </div>
        <div className="flex flex-col gap-2 px-1 mt-auto">
          <div className="h-3 bg-gray-100 rounded w-3/4"></div>
          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          <div className="h-2 bg-gray-100 rounded w-1/4 mt-2"></div>
        </div>
      </div>
    );
  }

//para o exemplo da farmácia e mercado
  const badgeColor = produto.empresaLogo === 'CJR' ? 'bg-[#004b6e]' : produto.empresaLogo === 'NATU' ? 'bg-[#e04a6e]' : 'bg-gray-200';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:-translate-y-1 transition-transform duration-300 cursor-pointer group relative flex flex-col justify-between h-[260px]">
      
      {produto.empresaLogo && (
        <div className={`absolute top-4 right-4 w-10 h-10 ${badgeColor} rounded-full z-10 flex items-center justify-center text-white text-[10px] font-bold border-2 border-white shadow-sm overflow-hidden`}>
          {produto.empresaLogo}
        </div>
      )}

      <div className="bg-[#f8f9fa] aspect-square rounded-xl mb-4 overflow-hidden relative flex items-center justify-center">
        {produto.imagemUrl ? (
          <Image src={produto.imagemUrl} alt={produto.nome} fill className="object-contain p-2" />
        ) : (
          <span className="text-gray-300 text-sm">Sem Imagem</span>
        )}
      </div>
      
      <div className="flex flex-col gap-1 px-1 mt-auto">
        <span className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 min-h-[20px]">
          {produto.nome || 'Nome do Produto'}
        </span>
        
        <div className="flex items-baseline gap-1 mt-1 min-h-[20px]">
          <span className="text-sm font-bold text-black">
            {produto.preco ? `R$${produto.preco}` : 'R$ --,--'}
          </span>
          <span className="text-xs text-gray-400">
            {produto.unidade ? `/${produto.unidade}` : '/--'}
          </span>
        </div>
        
        <span className={`text-[10px] font-bold uppercase mt-1 tracking-wider ${produto.disponivel ? 'text-[#a4cc15]' : 'text-[#e04a6e]'}`}>
          {produto.disponivel ? 'Disponível' : 'Indisponível'}
        </span>
      </div>
    </div>
  );
};


export default function Home() {
  const categoriasRef = useRef<HTMLDivElement>(null);
  const scrollInterval = useRef<NodeJS.Timeout | null>(null);

  const startScroll = (direcao: 'esquerda' | 'direita') => {
    if (scrollInterval.current) return;
    const passo = direcao === 'esquerda' ? -12 : 12;
    scrollInterval.current = setInterval(() => {
      if (categoriasRef.current) {
        categoriasRef.current.scrollBy({ left: passo, behavior: 'auto' });
      }
    }, 20);
  };

  const stopScroll = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
  };

  return (
    <main className="min-h-screen flex flex-col font-sans bg-[#fcf9f2] overflow-x-hidden">

      {/* espaço que dps vai virar a navbar */}
      <header className="bg-[#0b0b0b] relative w-full pt-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative h-[320px] md:h-[370px]">
          
          <div className="absolute left-10 md:left-22 top-[37%] -translate-y-1/2 z-20">
            <h2 className="text-[45px] md:text-[55px] font-sans font-bold text-white leading-[1] tracking-normal flex flex-col">
              <span className="whitespace-nowrap">Do CAOS à organização,</span>
              <span className="whitespace-nowrap md:ml-20 lg:ml-[148px]">em alguns cliques</span>
            </h2>
          </div>

          <div className="absolute right-5 -top-11 md:-top-11 w-[500px] md:w-[600px] h-[750px] md:h-[800px] z-0 pointer-events-none">
            <Image
              src="/mascote-home.png"
              alt="Mascote Stock.io"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              className="object-contain object-top"
              priority
            />
          </div>
        </div>
      </header>

      {/* conteudo principal*/}
      <section className="relative z-20 bg-[#fcf9f2] flex-1 pb-20 pt-8">
        <div className="max-w-7xl mx-auto px-6">

          {/* Barra de Busca */}
          <div className="flex justify-end mb-8">
            <div className="bg-white rounded-full flex items-center px-5 py-3 w-full max-w-[500px] shadow-sm border border-gray-100">
              <input
                type="text"
                placeholder="Procurar por..."
                className="flex-1 outline-none text-sm text-[#6a38ff]/40 placeholder:text-[#6a38ff]/40 bg-transparent"
              />
              <svg className="text-[#6a38ff]/40 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          </div>

          {/* Categoria */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-3xl font-sans text-black">Categoria</h3>
            
            <div className="flex gap-2">
              <button 
                onMouseDown={() => startScroll('esquerda')} onMouseUp={stopScroll} onMouseLeave={stopScroll} onTouchStart={() => startScroll('esquerda')} onTouchEnd={stopScroll}
                className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 active:scale-95 transition-all border border-gray-100 text-[#6a38ff] select-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button 
                onMouseDown={() => startScroll('direita')} onMouseUp={stopScroll} onMouseLeave={stopScroll} onTouchStart={() => startScroll('direita')} onTouchEnd={stopScroll}
                className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 active:scale-95 transition-all border border-gray-100 text-[#6a38ff] select-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>

          <div 
            ref={categoriasRef}
            className="flex gap-10 lg:gap-14 overflow-x-auto pb-6 mb-10 pr-6 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
          >
            {categorias.map((cat) => (
              <button key={cat.nome} className="flex items-center justify-center bg-white rounded-3xl w-[110px] h-[110px] shrink-0 shadow-sm hover:shadow-md transition-all cursor-pointer p-3">
                <Image src={cat.imagem} alt={cat.nome} width={70} height={70} className="object-contain" />
              </button>
            ))}
          </div>

          {/* parte produtos*/}
          <div className="flex flex-col gap-16 mt-10">
            
            {categorias.map((cat) => {
              const categoriaKey = cat.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') as keyof typeof mockData;
              const produtosReais = mockData[categoriaKey] || [];

              let produtosExibidos: Produto[] = produtosReais.slice(0, 5);

              // pra gerar os placeholders de exemplos nas categorias vazias
              if (produtosExibidos.length === 0) {
                produtosExibidos = Array(3).fill(null).map((_, index) => ({
                  id: `skeleton-${categoriaKey}-${index}`,
                  nome: '', preco: '', unidade: '', disponivel: true, imagemUrl: '', empresaLogo: '',
                  isPlaceholder: true 
                }));
              }

              return (
                <div key={cat.nome}>
                  {/* Título da Categoria */}
                  <div className="flex justify-between items-end mb-6">
                    <h3 className="text-2xl font-bold text-black">
                      Produtos <span className="text-sm font-normal text-black lowercase">em</span> <span className="text-sm text-[#6a38ff] font-normal">{cat.nome}</span>
                    </h3>
                    <button className="text-sm text-[#6a38ff] font-semibold hover:underline">
                      ver mais
                    </button>
                  </div>

                  {/* Grid de Produtos */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {produtosExibidos.map((prod) => (
                      <ProductCard key={prod.id} produto={prod} />
                    ))}
                  </div>
                </div>
              );
            })}

          </div>

        </div>
      </section>
    </main>
  );
}