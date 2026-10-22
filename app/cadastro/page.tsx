import type { Metadata } from "next";
import CadastroForm from "./CadastroForm";
import Image from "next/image";
export const metadata: Metadata = {
    title: "Crie sua conta",
};

export default function TelaCadastro() {
    return (
        <main className="flex min-h-screen flex-col bg-creme md:flex-row md:pl-[6vw] md:pt-[8vh]">
            <CadastroForm />

            <div className="order-first px-6 pb-6 pt-8 md:relative md:order-none md:flex-1 md:overflow-hidden md:p-0">
                <div className="flex flex-col items-center gap-4 md:absolute md:inset-x-0 md:top-0">
                    <Image
                        src="/logo.png"
                        alt="Stock.io"
                        width={580}
                        height={130}
                        className="h-auto w-40 md:w-[min(30vw,60vh)]"
                    />
                    <Image
                        src="/mascote.png"
                        alt="Mascote da Stock.io"
                        width={500}
                        height={1130}
                        className="hidden h-auto md:block md:w-[min(35vw,45vh)]"
                    />
                </div>
            </div>
        </main>
    );
}