"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { BotaoDeletarConfirmacao, ModalBase } from "@/components/ui/ModalBase";
import { mensagemErroResultado } from "@/lib/apiCliente";
import type { UsuarioPerfil } from "@/lib/perfil/tipos";
import {
  atualizarMeuPerfil,
  buscarMeuPerfil,
  deletarMinhaConta,
} from "@/lib/perfil/perfilApi";

export type ModalEditarPerfilProps = {
  aberto: boolean;
  aoFechar: () => void;
  aoAbrirAlterarSenha: () => void;
  aoAtualizar?: (perfil: UsuarioPerfil) => void;
  aoDeletarConta: () => void;
};

const URL_REGEX = /^https?:\/\/.+/i;
const USERNAME_REGEX = /^[a-z0-9._-]+$/;

export default function ModalEditarPerfil(props: ModalEditarPerfilProps) {
  if (!props.aberto) return null;
  return <ModalEditarPerfilDialog {...props} />;
}

function ModalEditarPerfilDialog({
  aoFechar,
  aoAbrirAlterarSenha,
  aoAtualizar,
  aoDeletarConta,
}: ModalEditarPerfilProps) {
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [editandoFoto, setEditandoFoto] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [deletando, setDeletando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  const primeiroInputRef = useRef<HTMLInputElement>(null);
  const ocupado = carregando || salvando || deletando;

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setCarregando(true);
      const res = await buscarMeuPerfil();
      if (cancelado) return;

      if (res.tipo === "sucesso") {
        setNome(res.perfil.name);
        setUsername(res.perfil.username);
        setEmail(res.perfil.email);
        setFotoUrl(res.perfil.profilePictureUrl ?? "");
      } else {
        toast.error(mensagemErroResultado(res));
      }
      setCarregando(false);
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (!carregando) {
      primeiroInputRef.current?.focus();
    }
  }, [carregando]);

  function validarCampos(): boolean {
    const novosErros: Record<string, string> = {};

    const nomeTrim = nome.trim();
    if (!nomeTrim) novosErros.name = "O nome é obrigatório.";
    else if (nomeTrim.length > 255)
      novosErros.name = "O nome deve ter no máximo 255 caracteres.";

    const userNorm = username.trim().toLowerCase();
    if (
      userNorm.length < 3 ||
      userNorm.length > 50 ||
      !USERNAME_REGEX.test(userNorm)
    ) {
      novosErros.username =
        "Username deve ter entre 3 e 50 caracteres (apenas letras minúsculas, números, ponto, hífen e _).";
    }

    const emailTrim = email.trim();
    if (!emailTrim || !emailTrim.includes("@")) {
      novosErros.email = "Informe um e-mail válido.";
    }

    const fotoLimpa = fotoUrl.trim();
    if (fotoLimpa && (!URL_REGEX.test(fotoLimpa) || fotoLimpa.length > 255)) {
      novosErros.profilePictureUrl =
        "Informe uma URL válida (http:// ou https://) com até 255 caracteres.";
    }

    setErros(novosErros);
    const primeiroErro = Object.values(novosErros)[0];
    if (primeiroErro) toast.error(primeiroErro);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validarCampos()) return;

    setSalvando(true);
    const resultado = await atualizarMeuPerfil({
      name: nome.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      profilePictureUrl: fotoUrl.trim() ? fotoUrl.trim() : null,
    });
    setSalvando(false);

    if (resultado.tipo === "sucesso") {
      toast.success("Perfil atualizado com sucesso!");
      aoAtualizar?.(resultado.perfil);
      aoFechar();
      return;
    }

    if (
      (resultado.tipo === "validacao" || resultado.tipo === "conflito") &&
      resultado.campos
    ) {
      setErros((prev) => ({ ...prev, ...resultado.campos }));
    }
    toast.error(
      mensagemErroResultado(resultado, {
        padrao: "Erro ao salvar alterações.",
      })
    );
  }

  async function handleDeletarConta() {
    setDeletando(true);
    const resultado = await deletarMinhaConta();
    setDeletando(false);

    if (resultado.tipo === "sucesso") {
      toast.success("Conta excluída com sucesso.");
      aoFechar();
      aoDeletarConta();
      return;
    }

    setConfirmandoExclusao(false);
    toast.error(
      mensagemErroResultado(resultado, {
        padrao: "Não foi possível deletar a conta.",
      })
    );
  }

  const avatarValido = Boolean(fotoUrl.trim() && URL_REGEX.test(fotoUrl.trim()));

  return (
    <ModalBase
      tituloId="titulo-modal-editar-perfil"
      titulo="Editar Perfil"
      tituloApenasLeitor
      largura="lg"
      ocupado={salvando || deletando}
      aoFechar={aoFechar}
    >
      {/* Avatar Circular com botão de editar foto sobreposto conforme Figma */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative h-28 w-28">
          <div className="relative h-28 w-28 rounded-full overflow-hidden bg-white border-2 border-white shadow-md flex items-center justify-center text-3xl font-bold text-[#6A38F3]">
            {avatarValido ? (
              <Image
                src={fotoUrl.trim()}
                alt="Foto de perfil"
                fill
                unoptimized
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <span>{(nome || "U").charAt(0).toUpperCase()}</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setEditandoFoto((prev) => !prev)}
            disabled={ocupado}
            aria-label="Alterar URL da foto de perfil"
            title="Alterar foto de perfil"
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6A38F3] shadow-md hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
        </div>
      </div>

      {carregando ? (
        <div className="py-12 text-center text-sm text-black/60">
          Carregando seu perfil...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {editandoFoto && (
            <div className="space-y-1">
              <label
                htmlFor="perfil-foto-url"
                className="text-xs font-semibold text-black/70 px-3"
              >
                URL da foto de perfil
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="perfil-foto-url"
                  type="url"
                  value={fotoUrl}
                  onChange={(e) => {
                    setFotoUrl(e.target.value);
                    if (erros.profilePictureUrl)
                      setErros((prev) => ({ ...prev, profilePictureUrl: "" }));
                  }}
                  disabled={ocupado}
                  placeholder="https://exemplo.com/foto.png"
                  className={`flex-1 rounded-[20px] bg-white px-4 py-2.5 text-sm text-black shadow-xs outline-none border focus:ring-2 focus:ring-[#6A38F3] ${
                    erros.profilePictureUrl ? "border-red-500" : "border-transparent"
                  }`}
                />
                {fotoUrl && (
                  <button
                    type="button"
                    onClick={() => setFotoUrl("")}
                    disabled={ocupado}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 cursor-pointer"
                  >
                    Remover
                  </button>
                )}
              </div>
              {erros.profilePictureUrl && (
                <p className="text-xs font-semibold text-red-600 px-3">
                  {erros.profilePictureUrl}
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="perfil-nome" className="sr-only">
              Nome
            </label>
            <input
              ref={primeiroInputRef}
              id="perfil-nome"
              type="text"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                if (erros.name) setErros((prev) => ({ ...prev, name: "" }));
              }}
              disabled={ocupado}
              placeholder="Nome"
              maxLength={255}
              className={`w-full rounded-[20px] bg-white px-5 py-3 text-base text-black shadow-xs outline-none border transition-all placeholder:text-[#999797] focus:ring-2 focus:ring-[#6A38F3] ${
                erros.name ? "border-red-500 ring-2 ring-red-500/30" : "border-transparent"
              }`}
            />
            {erros.name && (
              <p className="text-xs font-semibold text-red-600 px-3 mt-1">{erros.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="perfil-username" className="sr-only">
              Username
            </label>
            <input
              id="perfil-username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (erros.username) setErros((prev) => ({ ...prev, username: "" }));
              }}
              disabled={ocupado}
              placeholder="Username"
              maxLength={50}
              className={`w-full rounded-[20px] bg-white px-5 py-3 text-base text-black shadow-xs outline-none border transition-all placeholder:text-[#999797] focus:ring-2 focus:ring-[#6A38F3] ${
                erros.username ? "border-red-500 ring-2 ring-red-500/30" : "border-transparent"
              }`}
            />
            {erros.username && (
              <p className="text-xs font-semibold text-red-600 px-3 mt-1">{erros.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="perfil-email" className="sr-only">
              Email
            </label>
            <input
              id="perfil-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (erros.email) setErros((prev) => ({ ...prev, email: "" }));
              }}
              disabled={ocupado}
              placeholder="Email"
              maxLength={255}
              className={`w-full rounded-[20px] bg-white px-5 py-3 text-base text-black shadow-xs outline-none border transition-all placeholder:text-[#999797] focus:ring-2 focus:ring-[#6A38F3] ${
                erros.email ? "border-red-500 ring-2 ring-red-500/30" : "border-transparent"
              }`}
            />
            {erros.email && (
              <p className="text-xs font-semibold text-red-600 px-3 mt-1">{erros.email}</p>
            )}
          </div>

          <div className="pt-3 space-y-2.5">
            <BotaoDeletarConfirmacao
              idDialogo="titulo-confirmar-deletar-conta"
              rotuloBotao="Deletar conta"
              variante="outline"
              textoConfirmacao="Excluir conta permanentemente? Suas lojas, produtos e avaliações serão removidos."
              confirmando={confirmandoExclusao}
              ocupado={ocupado}
              deletando={deletando}
              aoIniciarConfirmacao={() => setConfirmandoExclusao(true)}
              aoCancelar={() => setConfirmandoExclusao(false)}
              aoConfirmar={handleDeletarConta}
            />

            <button
              type="button"
              onClick={aoAbrirAlterarSenha}
              disabled={ocupado}
              className="w-full rounded-full border border-[#6A38F3] bg-white/80 hover:bg-[#6A38F3]/10 text-[#6A38F3] py-2.5 text-base font-normal shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              Alterar senha
            </button>

            <button
              type="submit"
              disabled={ocupado}
              className="w-full rounded-full bg-[#6A38F3] hover:bg-[#5c2de0] py-2.5 text-base font-normal text-white shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      )}
    </ModalBase>
  );
}
