const URL_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type CamposCadastro = {
    name: string;
    username: string;
    email: string;
    password: string;
    passwordConfirmation: string;
};

export type CampoCadastro = keyof CamposCadastro;

export type ResultadoCadastro =
    | { tipo: "criado" }
    | { tipo: "validacao"; campos: Partial<Record<CampoCadastro, string>> }
    | { tipo: "conflito"; campos: ("email" | "username")[] }
    | { tipo: "conexao" }
    | { tipo: "erro" };

// Mensagens do backend vêm em inglês e começam pelo nome do campo.
// O texto exibido é sempre o do frontend, em português.
function mensagemValidacao(campo: CampoCadastro, mensagem: string): string {
    switch (campo) {
        case "name":
            return "Informe seu nome completo.";
        case "username":
            return "Use de 3 a 50 caracteres: letras, números, pontos, hífens ou underscores.";
        case "email":
            return "Informe um email válido.";
        case "password":
            return mensagem.includes("longer")
                ? "A senha deve ter pelo menos oito caracteres."
                : "A senha é longa demais.";
        case "passwordConfirmation":
            return "As senhas não coincidem.";
    }
}

const CAMPOS: CampoCadastro[] = ["name", "username", "email", "password", "passwordConfirmation"];

function errosDeValidacao(mensagens: string[]): Partial<Record<CampoCadastro, string>> {
    const campos: Partial<Record<CampoCadastro, string>> = {};
    for (const mensagem of mensagens) {
        const campo = CAMPOS.find((nome) => mensagem.startsWith(`${nome} `));
        if (campo) {
            campos[campo] = mensagemValidacao(campo, mensagem);
        }
    }
    return campos;
}

export async function criarUsuario(dados: CamposCadastro): Promise<ResultadoCadastro> {
    let resposta: Response;
    try {
        resposta = await fetch(`${URL_API}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: dados.name,
                username: dados.username,
                email: dados.email,
                password: dados.password,
                passwordConfirmation: dados.passwordConfirmation,
            }),
        });
    } catch {
        return { tipo: "conexao" };
    }

    if (resposta.status === 201) {
        return { tipo: "criado" };
    }

    if (resposta.status === 400) {
        const corpo = await resposta.json().catch(() => null);
        const mensagens: string[] = Array.isArray(corpo?.message) ? corpo.message : [];
        return { tipo: "validacao", campos: errosDeValidacao(mensagens) };
    }

    if (resposta.status === 409) {
        const corpo = await resposta.json().catch(() => null);
        const campos = Array.isArray(corpo?.fields)
            ? corpo.fields.filter((campo: unknown): campo is "email" | "username" =>
                  campo === "email" || campo === "username",
              )
            : [];
        return { tipo: "conflito", campos };
    }

    return { tipo: "erro" };
}
