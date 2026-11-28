import axios from "axios";
import { api } from "@/lib/api";
import {
  cabecalhoAuth,
  classificarErroAxios,
  extrairErrosCampos,
  obterTokenAutenticado,
} from "@/lib/apiCliente";
import type {
  AtualizarLojaPayload,
  CategoriaResumo,
  CriarLojaPayload,
  Loja,
  ResultadoAtualizarLoja,
  ResultadoBuscarLoja,
  ResultadoCriarLoja,
  ResultadoDeletarLoja,
  ResultadoListarCategorias,
  ResultadoListarLojas,
} from "./tipos";

export { obterTokenAutenticado };

const LIMITE_LOJAS_POR_PAGINA = 100;
const MAX_PAGINAS_LOJAS = 50;

export async function listarTodasLojas(): Promise<ResultadoListarLojas> {
  const todas: Loja[] = [];
  const idsVistos = new Set<number>();

  try {
    for (let pagina = 0; pagina < MAX_PAGINAS_LOJAS; pagina += 1) {
      const offset = pagina * LIMITE_LOJAS_POR_PAGINA;
      const { data } = await api.get<Loja[]>("/stores", {
        params: { limit: LIMITE_LOJAS_POR_PAGINA, offset },
        timeout: 10000,
      });

      if (!Array.isArray(data)) {
        return { tipo: "erro", mensagem: "Resposta inválida ao listar lojas." };
      }

      for (const loja of data) {
        if (!idsVistos.has(loja.id)) {
          idsVistos.add(loja.id);
          todas.push(loja);
        }
      }

      if (data.length < LIMITE_LOJAS_POR_PAGINA) {
        break;
      }
    }

    return { tipo: "sucesso", lojas: todas };
  } catch (erro) {
    const classificado = classificarErroAxios(erro, {
      erroPadrao: "Não foi possível carregar as lojas.",
    });
    if (classificado.tipo === "conexao") {
      return { tipo: "conexao" };
    }
    return {
      tipo: "erro",
      mensagem:
        "mensagem" in classificado
          ? classificado.mensagem
          : "Não foi possível carregar as lojas.",
    };
  }
}

export async function listarTodasCategorias(): Promise<ResultadoListarCategorias> {
  try {
    const { data } = await api.get<CategoriaResumo[]>("/categories", {
      timeout: 10000,
    });
    if (!Array.isArray(data)) {
      return { tipo: "erro", mensagem: "Resposta inválida ao listar categorias." };
    }
    return { tipo: "sucesso", categorias: data };
  } catch (erro) {
    const classificado = classificarErroAxios(erro, {
      erroPadrao: "Não foi possível carregar as categorias.",
    });
    if (classificado.tipo === "conexao") {
      return { tipo: "conexao" };
    }
    return {
      tipo: "erro",
      mensagem:
        "mensagem" in classificado
          ? classificado.mensagem
          : "Não foi possível carregar as categorias.",
    };
  }
}

export async function buscarLoja(id: number): Promise<ResultadoBuscarLoja> {
  try {
    const { data } = await api.get<Loja>(`/stores/${id}`);
    if (!data || typeof data.id !== "number") {
      return { tipo: "erro", mensagem: "Dados da loja inválidos." };
    }
    return { tipo: "sucesso", loja: data };
  } catch (erro) {
    if (!axios.isAxiosError(erro)) {
      return { tipo: "erro", mensagem: "Erro inesperado ao buscar loja." };
    }
    if (!erro.response) return { tipo: "conexao" };
    if (erro.response.status === 404) return { tipo: "nao-encontrado" };
    return {
      tipo: "erro",
      mensagem: erro.response.data?.message || "Não foi possível carregar a loja.",
    };
  }
}

export async function listarLojasUsuario(userId: number): Promise<Loja[]> {
  try {
    const { data } = await api.get<Loja[]>("/stores", { params: { userId } });
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function listarCategorias(opcoes?: {
  root?: boolean;
  parentCategoryId?: number;
}): Promise<CategoriaResumo[]> {
  try {
    const params: Record<string, string | number | boolean> = {};
    if (opcoes?.root !== undefined) params.root = opcoes.root;
    if (opcoes?.parentCategoryId !== undefined) {
      params.parentCategoryId = opcoes.parentCategoryId;
    }
    const { data } = await api.get<CategoriaResumo[]>("/categories", { params });
    return Array.isArray(data) ? data : [];
  } catch {
    if (opcoes?.parentCategoryId !== undefined) return [];
    return [
      { id: 1, name: "Mercado", slug: "mercado" },
      { id: 2, name: "Farmácia", slug: "farmacia" },
      { id: 3, name: "Beleza", slug: "beleza" },
      { id: 4, name: "Moda", slug: "moda" },
      { id: 5, name: "Eletrônicos", slug: "eletronicos" },
      { id: 6, name: "Jogos", slug: "jogos" },
      { id: 7, name: "Brinquedos", slug: "brinquedos" },
      { id: 8, name: "Casa", slug: "casa" },
    ];
  }
}

export async function criarLoja(
  payload: CriarLojaPayload
): Promise<ResultadoCriarLoja> {
  const token = obterTokenAutenticado();
  if (!token) return { tipo: "nao-autorizado" };

  try {
    const { data } = await api.post<Loja>("/stores", payload, cabecalhoAuth(token));
    if (!data || typeof data.id !== "number") {
      return { tipo: "erro", mensagem: "Resposta do servidor inválida." };
    }
    return { tipo: "sucesso", loja: data };
  } catch (erro) {
    const c = classificarErroAxios(erro, {
      erroPadrao: "Erro desconhecido ao criar a loja.",
    });

    if (c.tipo === "validacao") {
      const { mensagemGeral, campos } = extrairErrosCampos<keyof CriarLojaPayload>(
        c.data,
        [
          [["name", "nome"], "name"],
          [["category"], "categoryId"],
          [["description"], "description"],
          [["logo"], "logoUrl"],
          [["banner"], "bannerUrl"],
          [["sticker"], "stickerUrl"],
        ]
      );
      if (c.data?.code === "CATEGORY_NOT_FOUND") {
        campos.categoryId = "A categoria selecionada não existe.";
      }
      return { tipo: "validacao", mensagem: mensagemGeral, campos };
    }

    if (c.tipo === "conflito") return { tipo: "conflito" };
    if (c.tipo === "proibido") return { tipo: "erro", mensagem: c.mensagem };
    if (c.tipo === "nao-encontrado") {
      return { tipo: "erro", mensagem: "Categoria não encontrada." };
    }
    return c;
  }
}

export async function atualizarLoja(
  id: number,
  payload: AtualizarLojaPayload
): Promise<ResultadoAtualizarLoja> {
  const token = obterTokenAutenticado();
  if (!token) return { tipo: "nao-autorizado" };

  try {
    const { data } = await api.patch<Loja>(`/stores/${id}`, payload, cabecalhoAuth(token));
    if (!data || typeof data.id !== "number") {
      return { tipo: "erro", mensagem: "Resposta do servidor inválida." };
    }
    return { tipo: "sucesso", loja: data };
  } catch (erro) {
    const c = classificarErroAxios(erro, {
      proibidoPadrao:
        "Você não tem permissão para editar esta loja (apenas o proprietário pode alterá-la).",
      erroPadrao: "Erro desconhecido ao atualizar a loja.",
    });

    if (c.tipo === "validacao") {
      const { mensagemGeral, campos } = extrairErrosCampos<keyof AtualizarLojaPayload>(
        c.data,
        [
          [["name", "nome"], "name"],
          [["category"], "categoryId"],
          [["description"], "description"],
          [["logo"], "logoUrl"],
          [["banner"], "bannerUrl"],
          [["sticker"], "stickerUrl"],
        ]
      );
      if (c.data?.code === "CATEGORY_NOT_FOUND") {
        campos.categoryId = "A categoria selecionada não existe.";
      }
      return { tipo: "validacao", mensagem: mensagemGeral, campos };
    }

    if (c.tipo === "conflito") return { tipo: "conflito" };
    return c;
  }
}

export async function deletarLoja(id: number): Promise<ResultadoDeletarLoja> {
  const token = obterTokenAutenticado();
  if (!token) return { tipo: "nao-autorizado" };

  try {
    await api.delete(`/stores/${id}`, cabecalhoAuth(token));
    return { tipo: "sucesso" };
  } catch (erro) {
    const c = classificarErroAxios(erro, {
      proibidoPadrao:
        "Você não tem permissão para deletar esta loja (apenas o proprietário pode removê-la).",
      erroPadrao: "Erro desconhecido ao deletar a loja.",
    });
    if (c.tipo === "validacao") {
      return { tipo: "erro", mensagem: "Requisição inválida ao deletar a loja." };
    }
    if (c.tipo === "conflito") return { tipo: "conflito" };
    return c;
  }
}
