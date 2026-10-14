"use client";

import { useState } from "react";

export default function CadastroForm() {
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    return (
        <section className="w-full max-w-sm rounded-t-3xl bg-preto px-10 py-12 text-creme">
            <h1 className="mb-8 text-center text-2xl font-bold uppercase">Crie sua conta</h1>
            <form className="flex flex-col gap-3">
                <div>
                    <input type="text" placeholder="Nome Completo"
                        className="w-full rounded-full bg-creme px-5 py-2 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo" />
                </div>

                <div>
                    <input type="text" placeholder="Username"
                        className="w-full rounded-full bg-creme px-5 py-2 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo" />
                </div>

                <div>
                    <input type="email" placeholder="Email"
                        className="w-full rounded-full bg-creme px-5 py-2 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo" />
                </div>

                <div className="relative">
                    <input type={mostrarSenha ? "text" : "password"}
                        placeholder="Senha"
                        className="w-full rounded-full bg-creme px-5 py-2 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo"
                    />
                    <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                        aria-label={mostrarSenha ? "Ocultar" : "Mostrar"}
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
                    <input
                        type={mostrarConfirmar ? "text" : "password"}
                        placeholder="Confirmar Senha"
                        className="w-full rounded-full bg-creme py-2 pl-5 pr-12 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo"
                    />
                    <button
                        type="button"
                        onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                        aria-label={mostrarConfirmar ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
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
                        className="mt-3 w-full cursor-pointer rounded-full bg-roxo py-2 font-bold text-creme hover:opacity-90">
                        CRIAR CONTA
                    </button>
                </div>
            </form>

            <p className="mt-6 text-sm">
                Já possui uma conta?{" "} <a href="/login" className="font-bold text-roxo">Login</a>
            </p>
        </section>
    );
}