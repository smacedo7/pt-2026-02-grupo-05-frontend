"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { listarProdutosDaCategoriaHome, mensagemFalhaProdutos } from '@/app/listarProdutos';
import { correspondeBuscaPorNome, normalizarTextoBusca } from '@/lib/categorias/catalogo';
import { listarCategoriasRaiz } from '@/lib/categorias/listarCategoriasRaiz';
import type { ProdutoApi } from '@/lib/produtos/tipos';
import { prepararCategoriasHome, type CategoriaHome, type EstadoListaCategorias } from './categorias';

export type EstadoCategoria =
  | { status: 'carregando' }
  | { status: 'ok'; produtos: ProdutoApi[] }
  | { status: 'erro'; mensagem: string };

export type SecaoCategoria = {
  categoria: CategoriaHome;
  estado: EstadoCategoria;
  /** Todos os produtos da categoria que passam na busca; cada tela decide quantos mostrar. */
  produtosFiltrados: ProdutoApi[];
};

const MENSAGEM_CONEXAO =
  'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
const MENSAGEM_ERRO_CATEGORIAS = 'Não foi possível carregar as categorias.';

/** Categorias raiz, produtos de cada uma e busca por nome sobre o que foi carregado. */
export function useVitrine() {
  const buscaRef = useRef<HTMLInputElement>(null);
  const [textoBusca, setTextoBusca] = useState('');
  const [lista, setLista] = useState<EstadoListaCategorias>({ status: 'carregando' });
  const [tentativa, setTentativa] = useState(0);
  const [estados, setEstados] = useState<Record<string, EstadoCategoria>>({});

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      const resposta = await listarCategoriasRaiz();
      if (cancelado) return;

      if (resposta.tipo !== 'ok') {
        setLista({
          status: 'erro',
          mensagem: resposta.tipo === 'conexao' ? MENSAGEM_CONEXAO : MENSAGEM_ERRO_CATEGORIAS,
        });
        return;
      }

      const categorias = prepararCategoriasHome(resposta.categorias);
      setLista({ status: 'ok', categorias });

      categorias.forEach(async (cat) => {
        const resultado = await listarProdutosDaCategoriaHome(cat);
        if (cancelado) return;
        setEstados((prev) => ({
          ...prev,
          [cat.slug]:
            resultado.tipo === 'ok'
              ? { status: 'ok', produtos: resultado.produtos }
              : { status: 'erro', mensagem: mensagemFalhaProdutos(resultado.tipo) },
        }));
      });
    }

    carregar();

    return () => {
      cancelado = true;
    };
  }, [tentativa]);

  const tentarNovamente = () => {
    setLista({ status: 'carregando' });
    setEstados({});
    setTentativa((anterior) => anterior + 1);
  };

  const termoNormalizado = normalizarTextoBusca(textoBusca);
  const buscando = termoNormalizado !== '';

  const resultado = useMemo(() => {
    let carregando = false;
    let totalOk = 0;
    let totalErros = 0;
    let totalEncontrados = 0;
    let mensagemErroGeral = mensagemFalhaProdutos('erro');
    const visiveis: SecaoCategoria[] = [];
    const categorias = lista.status === 'ok' ? lista.categorias : [];

    for (const categoria of categorias) {
      const estado = estados[categoria.slug] ?? { status: 'carregando' };

      if (estado.status === 'carregando') {
        carregando = true;
        visiveis.push({ categoria, estado, produtosFiltrados: [] });
        continue;
      }

      if (estado.status === 'erro') {
        totalErros += 1;
        mensagemErroGeral = estado.mensagem;
        // Durante a busca, ocultamos erros individuais para não poluir os resultados.
        if (!buscando) {
          visiveis.push({ categoria, estado, produtosFiltrados: [] });
        }
        continue;
      }

      totalOk += 1;
      const produtosFiltrados = buscando
        ? estado.produtos.filter((p) => correspondeBuscaPorNome(p.name, termoNormalizado))
        : estado.produtos;

      totalEncontrados += produtosFiltrados.length;

      if (!buscando || produtosFiltrados.length > 0) {
        visiveis.push({ categoria, estado, produtosFiltrados });
      }
    }

    const todasComErro = !carregando && totalOk === 0 && totalErros > 0;
    return {
      secoesVisiveis: visiveis,
      carregandoProdutos: carregando,
      totalEncontrados,
      categoriasComErro: totalErros,
      // Sem categorias carregadas não há o que buscar nem como afirmar que não há resultado.
      semResultados:
        buscando && categorias.length > 0 && !carregando && !todasComErro && totalEncontrados === 0,
      erroNaBusca: buscando && todasComErro ? mensagemErroGeral : null,
    };
  }, [lista, estados, buscando, termoNormalizado]);

  const limparBusca = () => {
    setTextoBusca('');
    buscaRef.current?.focus();
  };

  return {
    buscaRef,
    textoBusca,
    setTextoBusca,
    limparBusca,
    buscando,
    lista,
    tentarNovamente,
    ...resultado,
  };
}
