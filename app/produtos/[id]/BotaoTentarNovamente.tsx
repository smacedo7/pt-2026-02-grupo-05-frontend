"use client";

import { useRouter } from "next/navigation";

/** Revalida a rota atual no servidor sem recarregar o documento inteiro. */
export default function BotaoTentarNovamente() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="cursor-pointer rounded-full bg-roxo px-5 py-2.5 text-sm font-bold text-white hover:bg-[#5c2de0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roxo"
    >
      Tentar novamente
    </button>
  );
}
