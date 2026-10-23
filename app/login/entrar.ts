import axios from "axios";
import { api } from "@/lib/api";

export type ResultadoLogin =
    | { tipo: "autenticado"; accessToken: string }
    | { tipo: "credenciais" }
    | { tipo: "validacao" }
    | { tipo: "conexao" }
    | { tipo: "erro" };

export async function entrar(email: string, senha: string): Promise<ResultadoLogin> {
    try {
        const { data } = await api.post<{ accessToken?: unknown }>("/auth/login", {
            email,
            password: senha,
        });
        if (typeof data?.accessToken === "string") {
            return { tipo: "autenticado", accessToken: data.accessToken };
        }
        return { tipo: "erro" };
    } catch (erro) {
        if (!axios.isAxiosError(erro)) {
            return { tipo: "erro" };
        }
        // Sem resposta do servidor: backend parado, rede caiu ou CORS bloqueou.
        if (!erro.response) {
            return { tipo: "conexao" };
        }
        if (erro.response.status === 401) {
            return { tipo: "credenciais" };
        }
        if (erro.response.status === 400) {
            return { tipo: "validacao" };
        }
        return { tipo: "erro" };
    }
}
