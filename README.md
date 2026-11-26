This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Integração de produtos

A home e as páginas de categoria consultam a API configurada em `NEXT_PUBLIC_API_URL`
(padrão `http://localhost:3001`). O backend só aceita requisições do navegador vindas de
`http://localhost:3000`.

Limitações atuais:

- `GET /products` não envia imagens nem o nome da loja: os cards mostram "Sem imagem" e
  "Loja não informada". Não é feita uma requisição de detalhe por produto.
- A página de categoria exibe no máximo 100 produtos, somando a categoria e as
  subcategorias diretas. Busca, filtros e ordenação consideram apenas esses produtos.
  Ao atingir o limite, a página avisa.
- Subcategorias de segundo nível em diante não são consultadas.
- A home mostra até 5 produtos por categoria raiz, sem incluir subcategorias, e a busca
  da home considera apenas os produtos carregados.
- Não há avaliação de produto na API, por isso a categoria não exibe nem ordena por
  avaliação.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
