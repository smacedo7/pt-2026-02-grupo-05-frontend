import axios from "axios";
import { api } from "@/lib/api";

// chave gerada na tela de loguin
const CHAVE_TOKEN = "accessToken";

// mesmo DTO do backend
export type UsuarioPerfil = {
  id: number;
  name: string;
  username: string;
  email: string;
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ResultadoPerfil =
  | { tipo: "ok"; usuario: UsuarioPerfil }
  | { tipo: "sem-sessao" }
  | { tipo: "conexao" }
  | { tipo: "erro" };

function lerToken(): string | null {
  try {
    return localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

function removerToken() {
  try {
    localStorage.removeItem(CHAVE_TOKEN);
  } catch {
  }
}

export async function buscarPerfil(): Promise<ResultadoPerfil> {
  const token = lerToken();
  if (!token) {
    return { tipo: "sem-sessao" };
  }

  try {
    const { data } = await api.get<UsuarioPerfil>("/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!data || typeof data.username !== "string") {
      return { tipo: "erro" };
    }
    return { tipo: "ok", usuario: data };
  } catch (erro) {
    if (!axios.isAxiosError(erro)) {
      return { tipo: "erro" };
    }
    if (!erro.response) {
      return { tipo: "conexao" };
    }
    if (erro.response.status === 401) {
      removerToken();
      return { tipo: "sem-sessao" };
    }
    return { tipo: "erro" };
  }
}