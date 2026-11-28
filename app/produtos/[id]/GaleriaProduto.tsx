"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProdutoDetalheApi } from "@/lib/produtos/tipos";

type Props = {
  nome: string;
  imagens: ProdutoDetalheApi["images"];
};

/** Imagens do produto, na ordem enviada pela API. */
export default function GaleriaProduto({ nome, imagens }: Props) {
  const [indice, setIndice] = useState(0);
  const atual = imagens[indice] ?? imagens[0];

  if (!atual) {
    return (
      <div
        role="img"
        aria-label={`Imagem indisponível: ${nome}`}
        className="flex aspect-square items-center justify-center rounded-3xl bg-white text-sm text-preto/60"
      >
        Sem imagem
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-white">
        <Image
          src={atual.imageUrl}
          alt={`Foto do produto ${nome}`}
          fill
          unoptimized
          priority
          className="object-contain p-4"
        />
      </div>

      {imagens.length > 1 && (
        <ul aria-label="Outras imagens do produto" className="flex flex-wrap gap-3">
          {imagens.map((imagem, posicao) => (
            <li key={imagem.id}>
              <button
                type="button"
                aria-label={`Ver imagem ${posicao + 1} de ${imagens.length}`}
                aria-pressed={imagem.id === atual.id}
                onClick={() => setIndice(posicao)}
                className="relative block h-16 w-16 cursor-pointer overflow-hidden rounded-xl border-2 border-transparent bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roxo aria-pressed:border-roxo"
              >
                <Image src={imagem.imageUrl} alt="" fill unoptimized className="object-contain p-1" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
