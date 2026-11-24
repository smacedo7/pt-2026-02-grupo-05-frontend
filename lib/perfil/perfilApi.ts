import { api } from "@/lib/api";
import {
  cabecalhoAuth,
  classificarErroAxios,
  extrairErrosCampos,
  obterTokenAutenticado,
} from "@/lib/apiCliente";
import type {
  AlterarSenhaPayload,
  AtualizarPerfilPayload,
  ResultadoAlterarSenha,
  ResultadoAtualizarPerfil,
  ResultadoBuscarPerfil,
  ResultadoDeletarConta,
  UsuarioPerfil,
} from "./tipos";

export async function buscarMeuPerfil(): Promise<ResultadoBuscarPerfil> {
  const token = obterTokenAutenticado();
  if (!token) return { tipo: "nao-autorizado" };

  try {
    const { data } = await api.get<UsuarioPerfil>("/users/me", cabecalhoAuth(token));
    if (!data || typeof data.id !== "number") {
      return { tipo: "erro", mensagem: "Dados de perfil inválidos." };
    }
    return { tipo: "sucesso", perfil: data };
  } catch (erro) {
    const c = classificarErroAxios(erro, {
      erroPadrao: "Não foi possível carregar o perfil.",
    });
    if (c.tipo === "nao-autorizado" || c.tipo === "conexao") return c;
    return {
      tipo: "erro",
      mensagem: "mensagem" in c ? c.mensagem : "Não foi possível carregar o perfil.",
    };
  }
}

export async function atualizarMeuPerfil(
  payload: AtualizarPerfilPayload
): Promise<ResultadoAtualizarPerfil> {
  const token = obterTokenAutenticado();
  if (!token) return { tipo: "nao-autorizado" };

  try {
    const { data } = await api.patch<UsuarioPerfil>(
      "/users/me",
      payload,
      cabecalhoAuth(token)
    );
    if (!data || typeof data.id !== "number") {
      return { tipo: "erro", mensagem: "Resposta inválida do servidor." };
    }
    return { tipo: "sucesso", perfil: data };
  } catch (erro) {
    const c = classificarErroAxios(erro, {
      erroPadrao: "Não foi possível salvar as alterações.",
    });

    if (c.tipo === "conflito") {
      const campos: Partial<Record<"email" | "username", string>> = {};
      const lista = Array.isArray(c.data?.fields) ? (c.data.fields as string[]) : [];
      if (lista.includes("email")) campos.email = "Este e-mail já está em uso por outra conta.";
      if (lista.includes("username")) campos.username = "Este nome de usuário já está em uso.";
      return {
        tipo: "conflito",
        mensagem:
          lista.length > 0
            ? "E-mail ou nome de usuário já cadastrado por outro usuário."
            : "Dados já estão em uso.",
        campos,
      };
    }

    if (c.tipo === "validacao") {
      const { mensagemGeral, campos } = extrairErrosCampos<keyof AtualizarPerfilPayload>(
        c.data,
        [
          [["username"], "username"],
          [["email"], "email"],
          [["name"], "name"],
          [["profilepictureurl", "url"], "profilePictureUrl"],
        ]
      );
      return { tipo: "validacao", mensagem: mensagemGeral, campos };
    }

    if (c.tipo === "nao-autorizado" || c.tipo === "conexao") return c;
    return {
      tipo: "erro",
      mensagem: "mensagem" in c ? c.mensagem : "Não foi possível salvar as alterações.",
    };
  }
}

export async function alterarMinhaSenha(
  payload: AlterarSenhaPayload
): Promise<ResultadoAlterarSenha> {
  const token = obterTokenAutenticado();
  if (!token) return { tipo: "nao-autorizado" };

  try {
    await api.patch("/users/me/password", payload, cabecalhoAuth(token));
    return { tipo: "sucesso" };
  } catch (erro) {
    const c = classificarErroAxios(erro, {
      erroPadrao: "Não foi possível alterar a senha.",
    });

    if (c.tipo === "validacao") {
      if (c.data?.code === "CURRENT_PASSWORD_INCORRECT") {
        return {
          tipo: "validacao",
          mensagem: "A senha atual informada está incorreta.",
          campos: { currentPassword: "A senha atual está incorreta." },
        };
      }
      const { mensagemGeral, campos } = extrairErrosCampos<keyof AlterarSenhaPayload>(
        c.data,
        [
          [["currentpassword"], "currentPassword"],
          [["newpasswordconfirmation", "match"], "newPasswordConfirmation"],
          [["newpassword"], "newPassword"],
        ],
        "Verifique as senhas informadas."
      );
      if (campos.newPasswordConfirmation) {
        campos.newPasswordConfirmation = "As senhas não coincidem.";
      }
      return { tipo: "validacao", mensagem: mensagemGeral, campos };
    }

    if (c.tipo === "nao-autorizado" || c.tipo === "conexao") return c;
    return {
      tipo: "erro",
      mensagem: "mensagem" in c ? c.mensagem : "Não foi possível alterar a senha.",
    };
  }
}

export async function deletarMinhaConta(): Promise<ResultadoDeletarConta> {
  const token = obterTokenAutenticado();
  if (!token) return { tipo: "nao-autorizado" };

  try {
    await api.delete("/users/me", cabecalhoAuth(token));
    return { tipo: "sucesso" };
  } catch (erro) {
    const c = classificarErroAxios(erro, {
      erroPadrao: "Não foi possível deletar a conta.",
    });
    if (c.tipo === "nao-autorizado" || c.tipo === "conexao") return c;
    return {
      tipo: "erro",
      mensagem: "mensagem" in c ? c.mensagem : "Não foi possível deletar a conta.",
    };
  }
}
