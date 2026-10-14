"use client";

import { useState } from "react";

export default function CadastroForm() {
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    return (
        <section className="w-[45vw] shrink-0 rounded-t-[5vw] bg-preto px-[5vw] pb-10 pt-[6vh] text-creme">
            <h1 className="mb-[5vh] text-center text-3xl font-bold uppercase">Crie sua conta</h1>
            <form className="flex flex-col gap-3">
                <div>
                    <input type="text" name= "name" placeholder="Nome Completo"
                        className="w-full rounded-full bg-creme px-5 py-2.5 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo" />
                </div>

                <div>
                    <input type="text" name="username" placeholder="Username"
                        className="w-full rounded-full bg-creme px-5 py-2.5 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo" />
                </div>

                <div>
                    <input type="email" name="email" placeholder="Email"
                        className="w-full rounded-full bg-creme px-5 py-2.5 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo" />
                </div>

                <div className="relative">
                    <input type={mostrarSenha ? "text" : "password"}
                        name="password"
                        placeholder="Senha"
                        className="w-full rounded-full bg-creme px-5 py-2.5 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo"
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
                        name="passwordConfirmation"
                        placeholder="Confirmar Senha"
                        className="w-full rounded-full bg-creme py-2.5 pl-5 pr-12 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo"
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
                        className="mt-5 w-full cursor-pointer rounded-full bg-roxo py-3 font-bold text-creme hover:opacity-90">
                        ENTRAR
                    </button>
                </div>
            </form>

            <p className="mt-5 text-lg">
                Já possui uma conta?{" "} <a href="/login" className="font-bold text-roxo">Login</a>
            </p>
        </section>
    );
}