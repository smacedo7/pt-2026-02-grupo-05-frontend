import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/",
  headers: {
    "Content-Type": "application/json",
  },
});

const CAMINHO_CADASTRO = "users";

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


const MENSAGENS: Record<CampoCadastro, string> = {
  name: "Informe seu nome completo.",
  username:
    "Use de 3 a 50 caracteres: letras, números, pontos, hífens ou underscores.",
  email: "Informe um email válido.",
  password: "A senha deve ter pelo menos oito caracteres.",
  passwordConfirmation: "As senhas não coincidem.",
};

const CAMPOS: CampoCadastro[] = [
  "name",
  "username",
  "email",
  "password",
  "passwordConfirmation",
];

function textoDoErro(campo: CampoCadastro, mensagemApi: string) {
  if (campo === "password" && !mensagemApi.includes("longer")) {
    return "A senha é longa demais.";
  }
  return MENSAGENS[campo];
}

function errosDeValidacao(mensagens: string[]) {
  const campos: Partial<Record<CampoCadastro, string>> = {};
  for (const mensagem of mensagens) {
    const campo = CAMPOS.find((nome) => mensagem.startsWith(`${nome} `));
    if (campo) {
      campos[campo] = textoDoErro(campo, mensagem);
    }
  }
  return campos;
}

export async function criarUsuario(
  dados: CamposCadastro,
): Promise<ResultadoCadastro> {
  try {
    await api.post(CAMINHO_CADASTRO, dados);
    return { tipo: "criado" };
  } catch (erro) {
    if (!axios.isAxiosError(erro)) {
      return { tipo: "erro" };
    }
    if (!erro.response) {
      return { tipo: "conexao" };
    }

    const { status, data } = erro.response;

    if (status === 400) {
      const mensagens: string[] = Array.isArray(data?.message) ? data.message : [];
      return { tipo: "validacao", campos: errosDeValidacao(mensagens) };
    }

    if (status === 409) {
      const campos = Array.isArray(data?.fields)
        ? data.fields.filter(
            (campo: unknown): campo is "email" | "username" =>
              campo === "email" || campo === "username",
          )
        : [];
      return { tipo: "conflito", campos };
    }

    return { tipo: "erro" };
  }
}