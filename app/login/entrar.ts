const URL_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type ResultadoLogin =
    | { tipo: "autenticado"; accessToken: string }
    | { tipo: "credenciais" }
    | { tipo: "validacao" }
    | { tipo: "conexao" }
    | { tipo: "erro" };

export async function entrar(email: string, senha: string): Promise<ResultadoLogin> {
    let resposta: Response;
    try {
        resposta = await fetch(`${URL_API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: senha }),
        });
    } catch {
        return { tipo: "conexao" };
    }

    if (resposta.status === 401) {
        return { tipo: "credenciais" };
    }

    if (resposta.status === 400) {
        return { tipo: "validacao" };
    }

    if (resposta.ok) {
        const corpo = await resposta.json().catch(() => null);
        if (typeof corpo?.accessToken === "string") {
            return { tipo: "autenticado", accessToken: corpo.accessToken };
        }
    }

    return { tipo: "erro" };
}
