export type UsuarioPerfil = {
  id: number;
  name: string;
  username: string;
  email: string;
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AtualizarPerfilPayload = {
  name?: string;
  username?: string;
  email?: string;
  profilePictureUrl?: string | null;
};

export type AlterarSenhaPayload = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
};

export type ResultadoBuscarPerfil =
  | { tipo: "sucesso"; perfil: UsuarioPerfil }
  | { tipo: "nao-autorizado" }
  | { tipo: "conexao" }
  | { tipo: "erro"; mensagem: string };

export type ResultadoAtualizarPerfil =
  | { tipo: "sucesso"; perfil: UsuarioPerfil }
  | {
      tipo: "validacao";
      mensagem: string;
      campos?: Partial<Record<keyof AtualizarPerfilPayload, string>>;
    }
  | {
      tipo: "conflito";
      mensagem: string;
      campos?: Partial<Record<"email" | "username", string>>;
    }
  | { tipo: "nao-autorizado" }
  | { tipo: "conexao" }
  | { tipo: "erro"; mensagem: string };

export type ResultadoAlterarSenha =
  | { tipo: "sucesso" }
  | {
      tipo: "validacao";
      mensagem: string;
      campos?: Partial<Record<keyof AlterarSenhaPayload, string>>;
    }
  | { tipo: "nao-autorizado" }
  | { tipo: "conexao" }
  | { tipo: "erro"; mensagem: string };

export type ResultadoDeletarConta =
  | { tipo: "sucesso" }
  | { tipo: "nao-autorizado" }
  | { tipo: "conexao" }
  | { tipo: "erro"; mensagem: string };
