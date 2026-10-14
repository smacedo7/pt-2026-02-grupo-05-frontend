import type {Metadata} from "next";

export const metadata: Metadata = {
    title: "Crie sua conta",
};

export default function TelaCadastro(){
    return(
<main className="min-h-screen bg-creme">
    <h1>Crie sua conta</h1>
        <form>
            <div>
                <input type="text" placeholder="Nome Completo" />
            </div>

            <div>
                <input type="text" placeholder="Username"/>
            </div>

            <div>
                <input type="email" placeholder="Email"/>
            </div>

            <div> 
                <input type="password" placeholder="Senha"/>
            </div>

            <div>
                <input type="password" placeholder="Confirmar Senha"/>
            </div>

            <div>
                <button type="submit">CRIAR CONTA</button>
            </div>
        </form>

<p>
    Já possui uma conta? <a href="/login">Login</a>
</p>
</main>
    );
}