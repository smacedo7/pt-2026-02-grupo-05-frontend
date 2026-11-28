import { NextResponse, type NextRequest } from "next/server";
import { buscarCategoriaPorSlug } from "@/lib/categorias/buscarCategoriaPorSlug";

// Por que consultar a API aqui: slug inexistente precisa responder HTTP 404, e a
// página não consegue fazer isso. Com cacheComponents, a resposta começa com 200
// antes de a categoria ser consultada, e notFound() só troca o conteúdo (testado
// também com "instant = false").
//
// Impacto: cada acesso ou navegação para uma categoria existente faz duas chamadas
// a GET /categories/by-slug/:slug (esta e a da página) e a resposta espera por esta,
// no máximo 5 s. Um slug inexistente faz uma. Pré-carregamentos de links ficam de
// fora pelo matcher. Se a API falhar, a requisição segue e a página mostra o erro,
// em vez de um 404 falso.
export async function proxy(request: NextRequest) {
  const correspondencia = request.nextUrl.pathname.match(/^\/categorias\/([^/]+)\/?$/);

  if (correspondencia) {
    const resultado = await buscarCategoriaPorSlug(correspondencia[1]);
    if (resultado.tipo === "nao-encontrada") {
      return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    {
      source: "/categorias/:slug*",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
