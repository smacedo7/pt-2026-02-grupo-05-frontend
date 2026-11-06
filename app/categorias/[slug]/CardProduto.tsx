import Image from "next/image";
import type { Produto } from "@/lib/categorias/tipos";

const formatadorPreco = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatadorAvaliacao = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

type Props = {
  produto: Produto;
};

export default function CardProduto({ produto }: Props) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-3xl bg-white p-4 shadow-sm">
      {produto.imagemUrl ? (
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-creme">
          <Image
            src={produto.imagemUrl}
            alt={`Foto do produto ${produto.nome}`}
            fill
            sizes="(min-width: 1280px) 220px, (min-width: 768px) 33vw, (min-width: 360px) 50vw, 100vw"
            className="object-contain p-2"
          />
        </div>
      ) : (
        <div
          role="img"
          aria-label={`Imagem indisponível: ${produto.nome}`}
          className="flex aspect-square items-center justify-center rounded-2xl bg-creme text-xs text-preto/60"
        >
          Sem imagem
        </div>
      )}

      <div className="flex flex-1 flex-col gap-1">
        <h3 className="text-base font-semibold leading-tight text-preto md:text-lg">{produto.nome}</h3>
        <p className="text-sm font-medium text-preto">{formatadorPreco.format(produto.preco)}</p>
        <p className="text-xs text-preto/80">
          Avaliação média: {formatadorAvaliacao.format(produto.avaliacao)} de 5
        </p>
      </div>

      {produto.disponivel ? (
        <p className="w-fit rounded-full bg-limao px-2.5 py-0.5 text-xs font-bold uppercase text-preto">
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
