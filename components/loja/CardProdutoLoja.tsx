"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProdutoLoja } from "@/lib/produtos/tipos";

const formatadorPreco = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type Props = {
  produto: ProdutoLoja;
  ehDono: boolean;
  aoEditar: (produto: ProdutoLoja) => void;
};

export default function CardProdutoLoja({ produto, ehDono, aoEditar }: Props) {
  const primeiraImagem = produto.images?.[0]?.imageUrl ?? null;
  const disponivel = produto.stock > 0;

  return (
    <article className="relative flex h-full flex-col gap-3 rounded-3xl bg-white p-4 shadow-sm transition-transform hover:-translate-y-0.5 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[#6A38F3]">
      {ehDono && (
        <button
          type="button"
          onClick={() => aoEditar(produto)}
          aria-label={`Editar produto ${produto.name}`}
          title={`Editar ${produto.name}`}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#6A38F3] text-white shadow-md hover:bg-[#5c2de0] transition-colors focus-visible:outline-2 focus-visible:outline-[#C6E700] cursor-pointer"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      )}

      {primeiraImagem ? (
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F6F3E4]">
          <Image
            src={primeiraImagem}
            alt={`Foto do produto ${produto.name}`}
            fill
            unoptimized
            className="object-contain p-2"
          />
        </div>
      ) : (
        <div
          role="img"
          aria-label={`Imagem indisponível: ${produto.name}`}
          className="flex aspect-square items-center justify-center rounded-2xl bg-[#F6F3E4] text-xs text-black/50"
        >
          Sem imagem
        </div>
      )}

      <div className="flex flex-1 flex-col gap-1">
        <h3 className="text-base font-semibold leading-tight text-[#171a17] md:text-lg">
          {/* O ::after estica o link para o card inteiro; o lápis fica acima (z-10). */}
          <Link
            href={`/produtos/${produto.id}`}
            className="outline-none after:absolute after:inset-0 after:rounded-3xl"
          >
            {produto.name}
          </Link>
        </h3>
        <p className="text-sm font-medium text-[#171a17]">
          {formatadorPreco.format(produto.price)}
        </p>
        <p className="text-xs text-black/60">
          Estoque: {produto.stock} {produto.stock === 1 ? "unidade" : "unidades"}
        </p>
      </div>

      {disponivel ? (
        <p className="w-fit rounded-full bg-[#c6e600] px-2.5 py-0.5 text-xs font-bold uppercase text-[#171a17]">
          Disponível
        </p>
      ) : (
        <p className="w-fit rounded-full bg-red-700 px-2.5 py-0.5 text-xs font-bold uppercase text-white">
          Indisponível
        </p>
      )}
    </article>
  );
}
