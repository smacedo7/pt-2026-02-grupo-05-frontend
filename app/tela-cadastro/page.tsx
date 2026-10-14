import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Crie sua conta",
};

export default function TelaCadastro() {
    return (
        <main className="flex min-h-screen bg-creme px-12 pt-16">
             <section className="w-full max-w-sm rounded-t-3xl bg-preto px-10 py-12 text-creme">
            <h1 className="mb-8 text-center text-2xl font-bold uppercase">Crie sua conta</h1>
            <form className="flex flex-col gap-3">
                <div>
                    <input type="text" placeholder="Nome Completo" 
                    className="w-full rounded-full bg-creme px-5 py-2 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo"/>
                </div>

                <div>
                    <input type="text" placeholder="Username" 
                    className="w-full rounded-full bg-creme px-5 py-2 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo"/>
                </div>

                <div>
                    <input type="email" placeholder="Email"
                    className="w-full rounded-full bg-creme px-5 py-2 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo" />
                </div>

                <div>
                    <input type="password" placeholder="Senha"
                    className="w-full rounded-full bg-creme px-5 py-2 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo" />
                </div>

                <div>
                    <input type="password" placeholder="Confirmar Senha"
                    className="w-full rounded-full bg-creme px-5 py-2 text-preto placeholder:text-preto/50 outline-none focus:ring-2 focus:ring-roxo" />
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
        </main>
    );
}