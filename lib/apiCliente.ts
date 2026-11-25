import axios from "axios";

const CHAVE_TOKEN = "accessToken";

export function obterTokenAutenticado(): string | null {
  try {
    return localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

export function cabecalhoAuth(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export type ErroHttpClassificado =
  | { tipo: "nao-autorizado" }
  | { tipo: "proibido"; mensagem: string }
  | { tipo: "nao-encontrado" }
  | { tipo: "conflito"; data?: Record<string, unknown> }
  | { tipo: "validacao"; data?: Record<string, unknown> }
  | { tipo: "conexao" }
  | { tipo: "erro"; mensagem: string };

export function classificarErroAxios(
  erro: unknown,
  opcoes?: {
    proibidoPadrao?: string;
    erroPadrao?: string;
  }
): ErroHttpClassificado {
  if (!axios.isAxiosError(erro)) {
    return {
      tipo: "erro",
      mensagem: opcoes?.erroPadrao || "Ocorreu um erro inesperado.",
    };
  }

  if (!erro.response) {
    return { tipo: "conexao" };
  }

  const { status, data } = erro.response;
  const payload = (data && typeof data === "object" ? data : undefined) as
    | Record<string, unknown>
    | undefined;
  const mensagemApi =
    typeof payload?.message === "string" ? payload.message : undefined;

  if (status === 401) return { tipo: "nao-autorizado" };
  if (status === 403) {
    return {
      tipo: "proibido",
      mensagem:
        mensagemApi ||
        opcoes?.proibidoPadrao ||
        "Você não tem permissão para realizar esta ação.",
    };
  }
  if (status === 404) return { tipo: "nao-encontrado" };
  if (status === 409) return { tipo: "conflito", data: payload };
  if (status === 400) return { tipo: "validacao", data: payload };

  return {
    tipo: "erro",
    mensagem:
      mensagemApi || opcoes?.erroPadrao || "Não foi possível concluir a operação.",
  };
}

export function extrairErrosCampos<T extends string>(
  data: Record<string, unknown> | undefined,
  regras: Array<[palavrasChave: string[], campo: T]>,
  mensagemPadrao = "Verifique os dados informados."
): { mensagemGeral: string; campos: Partial<Record<T, string>> } {
  const campos: Partial<Record<T, string>> = {};
  const msgOriginal = data?.message;
  let mensagemGeral = mensagemPadrao;

  if (Array.isArray(msgOriginal)) {
    for (const item of msgOriginal) {
      if (typeof item !== "string") continue;
      const lower = item.toLowerCase();
      for (const [palavras, campo] of regras) {
        if (palavras.some((p) => lower.includes(p))) {
          campos[campo] = item;
          break;
        }
      }
    }
    mensagemGeral = msgOriginal.join("; ");
  } else if (typeof msgOriginal === "string") {
    mensagemGeral = msgOriginal;
  }

  return { mensagemGeral, campos };
}
