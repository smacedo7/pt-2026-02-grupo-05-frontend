import Image from 'next/image';
import type { Produto } from '@/app/listarProdutos';

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

/** Card de produto exibido nas vitrines da página inicial. */
export function ProductCard({ produto }: { produto: Produto }) {
  // para o exemplo da farmácia e mercado
  const badgeColor =
    produto.companyLogo === 'CJR'
      ? 'bg-[#004b6e]'
      : produto.companyLogo === 'NATU'
        ? 'bg-[#e04a6e]'
        : 'bg-gray-200';

  const precoNumerico = Number(produto.price);
  const precoFormatado = Number.isFinite(precoNumerico)
    ? precoNumerico.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '--,--';

  const nomeAcessivel = [
    produto.name || 'Produto sem nome',
    `R$${precoFormatado} por ${produto.unit || 'unidade'}`,
    produto.available ? 'Disponível' : 'Indisponível',
  ].join(', ');

  return (
    <button
      type="button"
      aria-label={nomeAcessivel}
      className="group relative flex h-[260px] w-full cursor-pointer flex-col justify-between rounded-2xl bg-white p-4 text-left shadow-sm transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff] focus-visible:ring-offset-2"
    >
      {produto.companyLogo && (
        <div
          role="img"
          aria-label={`Loja ${produto.companyLogo}`}
          className={`absolute right-4 top-4 z-10 flex h-10 w-10 ${badgeColor} items-center justify-center overflow-hidden rounded-full border-2 border-white text-[10px] font-bold text-white shadow-sm`}
        >
          <span aria-hidden="true">{produto.companyLogo}</span>
        </div>
      )}

      <div
        aria-hidden="true"
        className="relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-[#f8f9fa]"
      >
        {produto.imageUrl ? (
          <Image src={produto.imageUrl} alt="" fill className="object-contain p-2" />
        ) : (
          <span className="text-sm text-gray-300">Sem Imagem</span>
        )}
      </div>

      <div aria-hidden="true" className="mt-auto flex flex-col gap-1 px-1">
        <span className="line-clamp-2 min-h-[20px] text-sm font-semibold leading-tight text-gray-800">
          {produto.name || 'Nome do Produto'}
        </span>

        <div className="mt-1 flex min-h-[20px] items-baseline gap-1">
          <span className="text-sm font-bold text-black">R${precoFormatado}</span>
          <span className="text-xs text-gray-400">/{produto.unit || '--'}</span>
        </div>

        <span
          className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${
            produto.available ? 'text-[#a4cc15]' : 'text-[#e04a6e]'
          }`}
        >
          {produto.available ? 'Disponível' : 'Indisponível'}
        </span>
      </div>
    </button>
  );
}
