// app/produtos/[id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { buscarProdutoPorId } from "@/lib/produtos/buscarProdutoID";

type Props = {
  params: Promise<{ id: string }>;
};

async function ConteudoProduto({ params }: Props) {
  const { id } = await params;
  const idNumero = Number(id);

  if (!Number.isInteger(idNumero)) {
    notFound();
  }

  const resultado = await buscarProdutoPorId(idNumero);

  if (resultado.tipo === "naoEncontrado") {
    notFound();
  }

  if (resultado.tipo === "conexao") {
    return <p>Não foi possível conectar ao servidor. Tente novamente.</p>;
  }

  if (resultado.tipo === "erro") {
    return <p>Algo deu errado ao carregar o produto.</p>;
  }

  const { produto } = resultado;

  return (
    <main>
      <h1>{produto.nome}</h1>
      <p>R$ {produto.preco.toFixed(2).replace(".", ",")}</p>
      <p>{produto.estoque} disponíveis</p>
      <p>{produto.descricao}</p>
    </main>
  );
}

export default function PaginaProduto({ params }: Props) {
  return (
    <Suspense fallback={<p>Carregando produto...</p>}>
      <ConteudoProduto params={params} />
    </Suspense>
  );
}