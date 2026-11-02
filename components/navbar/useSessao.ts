"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "@/lib/api";

// Mesma chave gravada pela tela de login. A presença dela não basta: o token
// só vale quando o backend aceita a requisição em GET /users/me.
const CHAVE_TOKEN = "accessToken";

export type EstadoSessao = "verificando" | "deslogado" | "logado";

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
    // Sem acesso ao armazenamento não há token salvo para remover.
  }
}

export function useSessao() {
  const [estado, setEstado] = useState<EstadoSessao>("verificando");

  useEffect(() => {
    let cancelado = false;

    async function verificarSessao() {
      const token = lerToken();
      if (!token) {
        if (!cancelado) setEstado("deslogado");
        return;
      }

      try {
        await api.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelado) setEstado("logado");
      } catch (erro) {
        if (axios.isAxiosError(erro) && erro.response?.status === 401) {
          removerToken();
        }
        // Sem resposta do servidor a sessão não é confirmada; tratamos como deslogado.
        if (!cancelado) setEstado("deslogado");
      }
    }

    verificarSessao();
    return () => {
      cancelado = true;
    };
  }, []);

  function encerrarSessao() {
    removerToken();
    setEstado("deslogado");
  }

  return { estado, encerrarSessao };
}
