"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ResumoLoja } from '@/lib/lojas/listarLojasPorId';
import type { ProdutoApi } from '@/lib/produtos/tipos';

const formatadorPreco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Placeholder visual exibido enquanto os produtos de uma categoria carregam. */
export function ProductSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando produto"
      className="flex h-[260px] flex-col justify-between rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 p-4"
    >
      <div
        aria-hidden="true"
        className="mb-4 flex aspect-square items-center justify-center rounded-xl bg-gray-100/50"
      />
      <div aria-hidden="true" className="mt-auto flex flex-col gap-2 px-1">
        <div className="h-3 w-3/4 rounded bg-gray-100" />
        <div className="h-3 w-1/2 rounded bg-gray-100" />
        <div className="mt-2 h-2 w-1/4 rounded bg-gray-100" />
      </div>
    </div>
  );
}

/** Card de produto das vitrines (página inicial e página de produtos). */
export function ProductCard({ produto, loja }: { produto: ProdutoApi; loja?: ResumoLoja }) {
  const [logoFalhou, setLogoFalhou] = useState(false);
  const [imagemComErro, setImagemComErro] = useState<string | null>(null);
  const logo = logoFalhou ? null : loja?.logoUrl;
  const imagem =
    produto.imageUrl && imagemComErro !== produto.imageUrl ? produto.imageUrl : null;
  const precoFormatado = formatadorPreco.format(produto.price);
  const disponivel = produto.stock > 0;
  const disponibilidade = disponivel ? 'Disponível' : 'Indisponível';

  const nomeAcessivel = [
    produto.name,
    precoFormatado,
    disponibilidade.toLowerCase(),
    loja && `loja ${loja.name}`,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Link
      href={`/produtos/${produto.id}`}
      aria-label={nomeAcessivel}
      className="group relative flex h-full min-h-[260px] w-full cursor-pointer flex-col justify-between rounded-2xl bg-white p-4 text-left shadow-sm transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff] focus-visible:ring-offset-2"
    >
      <div
        aria-hidden="true"
        className="relative mb-4 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-[#f8f9fa]"
      >
        {imagem ? (
          <Image
            src={imagem}
            alt=""
            fill
            unoptimized
            className="object-cover"
            onError={() => setImagemComErro(imagem)}
          />
        ) : (
          <span className="text-sm text-gray-400">Sem imagem</span>
        )}
      </div>

      {logo && (
        <span className="absolute right-3 top-3 block h-12 w-12 overflow-hidden rounded-full bg-white shadow">
          <Image
            src={logo}
            alt=""
            fill
            unoptimized
            className="object-cover"
            onError={() => setLogoFalhou(true)}
          />
        </span>
      )}

      <div aria-hidden="true" className="mt-auto flex flex-col gap-1 px-1">
        <span className="line-clamp-2 min-h-[20px] break-words text-sm font-semibold leading-tight text-gray-800">
          {produto.name}
        </span>
        {/* Sem logo cadastrado, o nome identifica a loja. */}
        {loja && !logo && <span className="break-words text-xs text-gray-500">{loja.name}</span>}

        <span className="mt-1 text-sm font-bold text-black">{precoFormatado}</span>

        <span
          className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${
            disponivel ? 'text-[#a4cc15]' : 'text-[#e04a6e]'
          }`}
        >
          {disponibilidade}
        </span>
      </div>
    </Link>
  );
}
