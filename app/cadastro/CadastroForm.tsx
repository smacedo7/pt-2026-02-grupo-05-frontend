"use client";

import { useState } from "react";
import Link from "next/link";
export default function CadastroForm() {
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    return (
        <section className="w-full flex-1 rounded-t-3xl bg-preto px-6 pb-10 pt-8 md:w-[45vw] md:flex-none md:rounded-t-[5vw] md:px-[5vw] md:pt-[6vh] text-creme">
            <h1 className="mb-[5vh] text-center text-2xl md:text-3xl font-bold uppercase">Crie sua conta</h1>
            <form className="flex flex-col gap-3">

                <div>
                    <label htmlFor="nome" className="sr-only">
                        Nome completo
                    </label>
                    <input
                        id="nome"
                        type="text"
                        name="name"
                        placeholder="Nome Completo"
                        className="w-full rounded-full bg-creme px-5 py-2.5 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo"
                    />
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
                        className="w-full rounded-full bg-creme px-5 py-2.5 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo"
                    />
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
                        className="w-full rounded-full bg-creme px-5 py-2.5 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo"
                    />
                </div>

                <div className="relative">
                    <label htmlFor="senha" className="sr-only">
                        Senha
                    </label>
                    <input
                        id="senha"
                        type={mostrarSenha ? "text" : "password"}
                        name="password"
                        placeholder="Senha"
                        className="w-full rounded-full bg-creme py-2.5 pl-5 pr-12 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo"
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

                <div className="relative">
                    <label htmlFor="confirmar-senha" className="sr-only">
                        Confirmar senha
                    </label>
                    <input
                        id="confirmar-senha"
                        type={mostrarConfirmar ? "text" : "password"}
                        name="passwordConfirmation"
                        placeholder="Confirmar Senha"
                        className="w-full rounded-full bg-creme py-2.5 pl-5 pr-12 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo"
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

                <div>
                    <button type="submit"
                        className="mt-5 w-full cursor-pointer rounded-full bg-roxo py-3 font-bold text-creme hover:opacity-90">
                        CADASTRAR
                    </button>
                </div>
            </form>

            <p className="mt-5 text-lg">
                Já possui uma conta?{" "} <a href="/login" className="font-bold text-roxo">Login</a>
            </p>
        </section>
    );
}