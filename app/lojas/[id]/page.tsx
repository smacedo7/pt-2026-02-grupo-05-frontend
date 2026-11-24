import { Suspense } from "react";
import type { Metadata } from "next";
import LojaDetalhesConteudo from "./LojaDetalhesConteudo";
import { buscarLoja } from "@/lib/lojas/lojasApi";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const lojaId = Number(id);
  if (Number.isNaN(lojaId)) {
    return { title: "Loja | Stock.io" };
  }

  const res = await buscarLoja(lojaId);
  if (res.tipo === "sucesso") {
    return {
      title: `${res.loja.name} | Stock.io`,
      description: res.loja.description || "Loja parceira Stock.io",
    };
  }

  return {
    title: "Loja | Stock.io",
  };
}

async function LojaCarregador({ params }: Props) {
  const { id } = await params;
  const lojaId = Number(id);
  return <LojaDetalhesConteudo lojaId={lojaId} />;
}

export default function LojaPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f6f8e2] flex items-center justify-center p-6 text-center">
          <p className="text-gray-600 font-semibold text-lg">Carregando loja...</p>
        </div>
      }
    >
      <LojaCarregador params={params} />
    </Suspense>
  );
}
