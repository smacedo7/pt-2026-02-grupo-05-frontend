import type { Metadata } from "next";
import CadastroForm from "./CadastroForm";
import Image from "next/image";
export const metadata: Metadata = {
    title: "Crie sua conta",
};

export default function TelaCadastro() {
    return (
        <main className="flex min-h-screen bg-creme pl-[6vw] pt-[8vh]">
            <CadastroForm />

            <div className="relative flex-1 overflow-hidden">
                <div className="absolute inset-x-0 top-0 flex flex-col items-center gap-4">
                    <Image
                        src="/logo.png"
                        alt="Stock.io"
                        width={580}
                        height={130}
                        className="h-auto w-[min(30vw,60vh)]"
                    />
                    <Image
                        src="/mascote.png"
                        alt="Mascote da Stock.io, uma personagem de cabelo roxo fazendo sinal de paz"
                        width={500}
                        height={1130}
                        className="h-auto w-[min(35vw,45vh)]"
                    />
                </div>
            </div>
        </main>
    );
}