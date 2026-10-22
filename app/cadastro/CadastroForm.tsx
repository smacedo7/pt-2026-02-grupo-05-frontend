"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

const campoBase =
    "w-full rounded-full bg-creme py-2.5 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo";

export default function CadastroForm() {
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [erros, setErros] = useState<Record<string, string>>({});

    function classeCampo(campo: string) {
        return erros[campo] ? "ring-2 ring-red-500" : "";
    }

    function aoEnviar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();

        const dados = new FormData(evento.currentTarget);
        const nome = String(dados.get("name") ?? "").trim();
        const username = String(dados.get("username") ?? "").trim();
        const email = String(dados.get("email") ?? "").trim();
        const senha = String(dados.get("password") ?? "");
        const confirmacao = String(dados.get("passwordConfirmation") ?? "");

        const novosErros: Record<string, string> = {};

        if (!nome) {
            novosErros.name = "Informe seu nome completo.";
        }
        if (!username) {
            novosErros.username = "Informe um username.";
        }
        if (!email) {
            novosErros.email = "Informe seu email.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            novosErros.email = "Informe um email válido.";
        }
        if (!senha) {
            novosErros.password = "Informe uma senha.";
        }
        if (!confirmacao) {
            novosErros.passwordConfirmation = "Confirme sua senha.";
        } else if (senha !== confirmacao) {
            novosErros.passwordConfirmation = "As senhas não coincidem.";
        }

        setErros(novosErros);

        if (Object.keys(novosErros).length > 0) {
            return;
        }

    }

    return (
        <section className="w-full flex-1 rounded-t-3xl bg-preto px-6 pb-10 pt-8 text-creme md:w-[45vw] md:flex-none md:rounded-t-[5vw] md:px-[5vw] md:pt-[6vh]">
            <h1 className="mb-[5vh] text-center text-2xl font-bold uppercase md:text-3xl">
                Crie sua conta
            </h1>

            <form
                onSubmit={aoEnviar}
                method="post"
                noValidate
                className="flex flex-col gap-3"
            >
                <div>
                    <label htmlFor="nome" className="sr-only">
                        Nome completo
                    </label>
                    <input
                        id="nome"
                        type="text"
                        name="name"
                        placeholder="Nome Completo"
                        aria-invalid={erros.name ? true : undefined}
                        aria-describedby={erros.name ? "erro-nome" : undefined}
                        className={`${campoBase} px-5 ${classeCampo("name")}`}
                    />
                    {erros.name && (
                        <p id="erro-nome" role="alert" className="mt-1 px-5 text-sm text-red-400">
                            {erros.name}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="username" className="sr-only">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        name="username"
                        placeholder="Username"
                        aria-invalid={erros.username ? true : undefined}
                        aria-describedby={erros.username ? "erro-username" : undefined}
                        className={`${campoBase} px-5 ${classeCampo("username")}`}
                    />
                    {erros.username && (
                        <p id="erro-username" role="alert" className="mt-1 px-5 text-sm text-red-400">
                            {erros.username}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="email" className="sr-only">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Email"
                        aria-invalid={erros.email ? true : undefined}
                        aria-describedby={erros.email ? "erro-email" : undefined}
                        className={`${campoBase} px-5 ${classeCampo("email")}`}
                    />
                    {erros.email && (
                        <p id="erro-email" role="alert" className="mt-1 px-5 text-sm text-red-400">
                            {erros.email}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="senha" className="sr-only">
                        Senha
                    </label>
                    <div className="relative">
                        <input
                            id="senha"
                            type={mostrarSenha ? "text" : "password"}
                            name="password"
                            placeholder="Senha"
                            aria-invalid={erros.password ? true : undefined}
                            aria-describedby={erros.password ? "erro-senha" : undefined}
                            className={`${campoBase} pl-5 pr-12 ${classeCampo("password")}`}
                        />
                        <button
                            type="button"
                            onClick={() => setMostrarSenha(!mostrarSenha)}
                            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-preto/50"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-5 w-5"
                            >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>
                    </div>
                    {erros.password && (
                        <p id="erro-senha" role="alert" className="mt-1 px-5 text-sm text-red-400">
                            {erros.password}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="confirmar-senha" className="sr-only">
                        Confirmar senha
                    </label>
                    <div className="relative">
                        <input
                            id="confirmar-senha"
                            type={mostrarConfirmar ? "text" : "password"}
                            name="passwordConfirmation"
                            placeholder="Confirmar Senha"
                            aria-invalid={erros.passwordConfirmation ? true : undefined}
                            aria-describedby={
                                erros.passwordConfirmation ? "erro-confirmar-senha" : undefined
                            }
                            className={`${campoBase} pl-5 pr-12 ${classeCampo("passwordConfirmation")}`}
                        />
                        <button
                            type="button"
                            onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                            aria-label={
                                mostrarConfirmar
                                    ? "Ocultar confirmação de senha"
                                    : "Mostrar confirmação de senha"
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-preto/50"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-5 w-5"
                            >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>
                    </div>
                    {erros.passwordConfirmation && (
                        <p
                            id="erro-confirmar-senha"
                            role="alert"
                            className="mt-1 px-5 text-sm text-red-400"
                        >
                            {erros.passwordConfirmation}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="mt-5 w-full cursor-pointer rounded-full bg-roxo py-3 font-bold text-creme hover:opacity-90"
                >
                    CADASTRAR
                </button>
            </form>

            <p className="mt-5 text-lg">
                Já possui uma conta?{" "}
                <Link href="/login" className="font-bold text-roxo">
                    Login
                </Link>
            </p>
        </section>
    );
}