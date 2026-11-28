"use client";

import { useState } from "react";
import Link from "next/link";
import type { Loja } from "@/lib/lojas/tipos";

type Props = {
  loja: Loja;
  categoriaNome?: string;
};

/** Card circular de loja clicável para a listagem de /lojas. */
export default function CardLoja({ loja, categoriaNome }: Props) {
  const [urlComErro, setUrlComErro] = useState<string | null>(null);
  const logoValida = Boolean(loja.logoUrl && urlComErro !== loja.logoUrl);
  const inicial = loja.name.trim().charAt(0).toUpperCase() || "L";

  return (
    <Link
      href={`/lojas/${loja.id}`}
      className="group flex flex-col items-center rounded-2xl p-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff] focus-visible:ring-offset-2"
    >
      <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-black/5 bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md sm:h-32 sm:w-32">
        {logoValida && loja.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={loja.logoUrl}
            alt={`Logo da loja ${loja.name}`}
            onError={() => setUrlComErro(loja.logoUrl)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="select-none text-3xl font-bold text-[#6a38ff]"
          >
            {inicial}
          </span>
        )}
      </div>

      <h2 className="mt-3 line-clamp-2 w-full break-words text-base font-medium leading-snug text-black transition-colors group-hover:text-[#6a38ff]">
        {loja.name}
      </h2>

      {categoriaNome && (
        <p className="mt-0.5 line-clamp-1 w-full break-all text-xs lowercase text-[#6a38ff]">
          {categoriaNome}
        </p>
      )}
    </Link>
  );
}

/** Placeholder animado exibido enquanto as lojas estão carregando. */
export function CardLojaSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col items-center p-2">
      <div className="h-28 w-28 animate-pulse rounded-full bg-white shadow-sm sm:h-32 sm:w-32" />
      <div className="mt-3 h-4 w-24 animate-pulse rounded-full bg-gray-200" />
      <div className="mt-1.5 h-3 w-16 animate-pulse rounded-full bg-gray-200/80" />
    </div>
  );
}
