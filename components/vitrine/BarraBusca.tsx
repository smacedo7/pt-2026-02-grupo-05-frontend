"use client";

import { useId, type RefObject } from 'react';

type Props = {
  valor: string;
  aoMudar: (valor: string) => void;
  aoEnviar: () => void;
  aoLimpar: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
  /** Explicação exibida abaixo do campo, como o alcance da busca. */
  aviso?: string;
};

const BOTAO_BARRA =
  'flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#6a38ff]/70 transition-colors hover:text-[#6a38ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a38ff]';

/** Barra de pesquisa controlada de produtos. */
export default function BarraBusca({ valor, aoMudar, aoEnviar, aoLimpar, inputRef, aviso }: Props) {
  // Ids únicos: a Home e a página de produtos podem estar no documento ao mesmo tempo.
  const id = useId();
  const idCampo = `${id}-campo`;
  const idAviso = `${id}-aviso`;

  return (
    <form
      role="search"
      aria-label="Buscar produtos"
      onSubmit={(e) => {
        e.preventDefault();
        aoEnviar();
      }}
      className="mb-8 flex flex-col items-end gap-2"
    >
      <div className="flex w-full max-w-[500px] items-center rounded-full border border-gray-100 bg-white py-1.5 pl-5 pr-2 shadow-sm focus-within:ring-2 focus-within:ring-[#6a38ff]">
        <label htmlFor={idCampo} className="sr-only">
          Buscar produtos
        </label>
        <input
          id={idCampo}
          aria-describedby={aviso ? idAviso : undefined}
          ref={inputRef}
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          type="text"
          placeholder="Procurar por..."
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-sm text-[#6a38ff] outline-none placeholder:text-[#6a38ff]/60"
        />
        {valor !== '' && (
          <button
            type="button"
            onClick={aoLimpar}
            aria-label="Limpar busca"
            className={BOTAO_BARRA}
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        <button type="submit" aria-label="Buscar" className={BOTAO_BARRA}>
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>
      {aviso && (
        <p id={idAviso} className="max-w-[500px] px-5 text-right text-xs text-gray-600">
          {aviso}
        </p>
      )}
    </form>
  );
}
