import type { Metadata } from "next";
import CadastroForm from "./CadastroForm";
export const metadata: Metadata = {
    title: "Crie sua conta",
};

export default function TelaCadastro() {
    return (
        <main className="flex min-h-screen bg-creme px-12 pt-16">
             <CadastroForm/>
        </main>
    );
}