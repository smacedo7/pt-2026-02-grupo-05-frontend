"use client";

import React, { useEffect, useRef, useState } from "react";
import { BannerErroModal, ModalBase } from "@/components/ui/ModalBase";
import { alterarMinhaSenha } from "@/lib/perfil/perfilApi";

export type ModalAlterarSenhaProps = {
  aberto: boolean;
  aoVoltar?: () => void;
  aoFechar: () => void;
  aoSalvar: () => void;
};

export default function ModalAlterarSenha(props: ModalAlterarSenhaProps) {
  if (!props.aberto) return null;
  return <ModalAlterarSenhaDialog {...props} />;
}

function ModalAlterarSenhaDialog({
  aoVoltar,
  aoFechar,
  aoSalvar,
}: ModalAlterarSenhaProps) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const primeiroInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    primeiroInputRef.current?.focus();
  }, []);

  function validarCampos(): boolean {
    const novosErros: Record<string, string> = {};

    if (!senhaAtual) novosErros.currentPassword = "Informe sua senha atual.";
    if (!novaSenha || novaSenha.length < 8) {
      novosErros.newPassword = "A nova senha deve ter pelo menos 8 caracteres.";
    }
    if (confirmarSenha !== novaSenha) {
      novosErros.newPasswordConfirmation =
        "A confirmação não coincide com a nova senha.";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErroGeral(null);
    if (!validarCampos()) return;

    setSalvando(true);
    const resultado = await alterarMinhaSenha({
      currentPassword: senhaAtual,
      newPassword: novaSenha,
      newPasswordConfirmation: confirmarSenha,
    });
    setSalvando(false);

    if (resultado.tipo === "sucesso") {
      aoSalvar();
      aoFechar();
      return;
    }

    if (resultado.tipo === "validacao") {
      setErroGeral(resultado.mensagem);
      if (resultado.campos) setErros((prev) => ({ ...prev, ...resultado.campos }));
    } else if (resultado.tipo === "nao-autorizado") {
      setErroGeral("Sessão expirada. Faça login novamente.");
    } else if (resultado.tipo === "conexao") {
      setErroGeral("Não foi possível conectar ao servidor.");
    } else {
      setErroGeral(resultado.mensagem || "Erro ao alterar a senha.");
    }
  }

  return (
    <ModalBase
      tituloId="titulo-modal-alterar-senha"
      largura="lg"
      ocupado={salvando}
      aoVoltar={aoVoltar}
      aoFechar={aoFechar}
    >
      <div className="flex flex-col items-center text-center mb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm mb-3 text-[#6A38F3]">
          <svg
            className="h-12 w-12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
          </svg>
        </div>
        <h2 id="titulo-modal-alterar-senha" className="text-2xl font-normal text-black">
          Alterar Senha
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <BannerErroModal mensagem={erroGeral} />

        <div>
          <label htmlFor="senha-atual" className="sr-only">
            Senha Antiga
          </label>
          <input
            ref={primeiroInputRef}
            id="senha-atual"
            type="password"
            value={senhaAtual}
            onChange={(e) => {
              setSenhaAtual(e.target.value);
              if (erros.currentPassword)
                setErros((prev) => ({ ...prev, currentPassword: "" }));
            }}
            disabled={salvando}
            placeholder="Senha Antiga"
            autoComplete="current-password"
            className={`w-full rounded-[20px] bg-white px-5 py-3 text-base text-black shadow-xs outline-none border transition-all placeholder:text-[#999797] focus:ring-2 focus:ring-[#6A38F3] ${
              erros.currentPassword
                ? "border-red-500 ring-2 ring-red-500/30"
                : "border-transparent"
            }`}
          />
          {erros.currentPassword && (
            <p className="text-xs font-semibold text-red-600 px-3 mt-1">
              {erros.currentPassword}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="nova-senha" className="sr-only">
            Nova Senha
          </label>
          <input
            id="nova-senha"
            type="password"
            value={novaSenha}
            onChange={(e) => {
              setNovaSenha(e.target.value);
              if (erros.newPassword) setErros((prev) => ({ ...prev, newPassword: "" }));
            }}
            disabled={salvando}
            placeholder="Nova Senha"
            autoComplete="new-password"
            className={`w-full rounded-[20px] bg-white px-5 py-3 text-base text-black shadow-xs outline-none border transition-all placeholder:text-[#999797] focus:ring-2 focus:ring-[#6A38F3] ${
              erros.newPassword
                ? "border-red-500 ring-2 ring-red-500/30"
                : "border-transparent"
            }`}
          />
          {erros.newPassword && (
            <p className="text-xs font-semibold text-red-600 px-3 mt-1">
              {erros.newPassword}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmar-senha" className="sr-only">
            Confirmar Senha
          </label>
          <input
            id="confirmar-senha"
            type="password"
            value={confirmarSenha}
            onChange={(e) => {
              setConfirmarSenha(e.target.value);
              if (erros.newPasswordConfirmation)
                setErros((prev) => ({ ...prev, newPasswordConfirmation: "" }));
            }}
            disabled={salvando}
            placeholder="Confirmar Senha"
            autoComplete="new-password"
            className={`w-full rounded-[20px] bg-white px-5 py-3 text-base text-black shadow-xs outline-none border transition-all placeholder:text-[#999797] focus:ring-2 focus:ring-[#6A38F3] ${
              erros.newPasswordConfirmation
                ? "border-red-500 ring-2 ring-red-500/30"
                : "border-transparent"
            }`}
          />
          {erros.newPasswordConfirmation && (
            <p className="text-xs font-semibold text-red-600 px-3 mt-1">
              {erros.newPasswordConfirmation}
            </p>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={salvando}
            className="w-full rounded-full bg-[#6A38F3] hover:bg-[#5c2de0] py-3 text-lg font-normal text-white shadow-md transition-colors focus-visible:outline-2 focus-visible:outline-[#6A38F3] disabled:opacity-50 cursor-pointer"
          >
            {salvando ? "Salvando Senha..." : "Salvar Senha"}
          </button>
        </div>
      </form>
    </ModalBase>
  );
}
