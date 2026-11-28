import axios from "axios";
import { api } from "@/lib/api";
import type { CategoriaApi } from "./tipos";

export type ResultadoCategorias =
  | { tipo: "ok"; categorias: CategoriaApi[] }
  | { tipo: "conexao" }
  | { tipo: "erro" };

export async function listarCategoriasRaiz(): Promise<ResultadoCategorias> {
  try {
    const { data } = await api.get<CategoriaApi[]>("/categories", {
      params: { root: true },
      timeout: 10000,
    });
    return Array.isArray(data) ? { tipo: "ok", categorias: data } : { tipo: "erro" };
  } catch (erro) {
    // Sem resposta do servidor: backend parado, rede caiu ou CORS bloqueou.
    if (axios.isAxiosError(erro) && !erro.response) {
      return { tipo: "conexao" };
    }
    return { tipo: "erro" };
  }
}
