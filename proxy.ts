import { NextResponse, type NextRequest } from "next/server";
import { listarSlugsDeCategorias } from "@/lib/categorias/dados-demonstrativos";

// Slugs de categoria desconhecidas recebem HTTP 404 antes de a página renderizar.
// A página de categoria é pré-renderizada parcialmente, e nesse caso a resposta
// já começaria com 200. Por isso a checagem fica aqui, na requisição.
export function proxy(request: NextRequest) {
  const correspondencia = request.nextUrl.pathname.match(/^\/categorias\/([^/]+)\/?$/);

  if (correspondencia && !listarSlugsDeCategorias().includes(correspondencia[1])) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/categorias/:slug*",
};
