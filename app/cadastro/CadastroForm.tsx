"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { criarUsuario, type CampoCadastro } from "./api";

const campoBase =
    "w-full rounded-full bg-creme py-2.5 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo";

export default function CadastroForm() {
    const router = useRouter();
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [erros, setErros] = useState<Partial<Record<CampoCadastro, string>>>({});
    const [erroGeral, setErroGeral] = useState("");
    const [enviando, setEnviando] = useState(false);

    const envioEmAndamento = useRef(false);

    function classeCampo(campo: CampoCadastro) {
        return erros[campo] ? "ring-2 ring-red-500" : "";
    }

    async function aoEnviar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        if (envioEmAndamento.current) {
            return;
        }

        const dados = new FormData(evento.currentTarget);
        const nome = String(dados.get("name") ?? "").trim();
        const username = String(dados.get("username") ?? "").trim();
        const email = String(dados.get("email") ?? "").trim();
        const senha = String(dados.get("password") ?? "");
        const confirmacao = String(dados.get("passwordConfirmation") ?? "");

        const novosErros: Partial<Record<CampoCadastro, string>> = {};

        if (!nome) {
            novosErros.name = "Informe seu nome completo.";
        }
        if (!username) {
            novosErros.username = "Informe um username.";
        } else if (!/^[A-Za-z0-9._-]{3,50}$/.test(username)) {
            novosErros.username =
                "Use de 3 a 50 caracteres: letras, números, pontos, hífens ou underscores.";
        }
        if (!email) {
            novosErros.email = "Informe seu email.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            novosErros.email = "Informe um email válido.";
        }
        if (!senha) {
            novosErros.password = "Informe uma senha.";
        } else if (senha.length < 8) {
            novosErros.password = "A senha deve ter pelo menos oito caracteres.";
        }
        if (!confirmacao) {
            novosErros.passwordConfirmation = "Confirme sua senha.";
        } else if (senha !== confirmacao) {
            novosErros.passwordConfirmation = "As senhas não coincidem.";
        }

        setErros(novosErros);
        setErroGeral("");

        if (Object.keys(novosErros).length > 0) {
            return;
        }

        envioEmAndamento.current = true;
        setEnviando(true);

        const resultado = await criarUsuario({
            name: nome,
            username,
            email,
            password: senha,
            passwordConfirmation: confirmacao,
        });

        if (resultado.tipo === "criado") {
           
            router.push("/login");
            return;
        }

        switch (resultado.tipo) {
            case "validacao":
                setErros(resultado.campos);
                if (Object.keys(resultado.campos).length === 0) {
                    setErroGeral("Revise os dados informados.");
                }
                break;

            case "conflito": {
                const emUso: Partial<Record<CampoCadastro, string>> = {};
                if (resultado.campos.includes("email")) {
                    emUso.email = "Este email já está em uso.";
                }
                if (resultado.campos.includes("username")) {
                    emUso.username = "Este username já está em uso.";
                }
                setErros(emUso);
                if (Object.keys(emUso).length === 0) {
                    setErroGeral("Email ou username já cadastrado.");
                }
                break;
            }

            case "conexao":
                setErroGeral(
                    "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
                );
                break;

            default:
                setErroGeral("Não foi possível concluir o cadastro. Tente novamente.");
        }

        envioEmAndamento.current = false;
        setEnviando(false);
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

                {erroGeral && (
                    <p role="alert" className="mt-3 px-5 text-center text-sm text-red-400">
                        {erroGeral}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={enviando}
                    aria-busy={enviando}
                    className="mt-5 w-full cursor-pointer rounded-full bg-roxo py-3 font-bold text-creme hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {enviando ? "CADASTRANDO..." : "CADASTRAR"}
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