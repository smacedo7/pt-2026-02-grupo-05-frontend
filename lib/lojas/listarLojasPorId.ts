import { api } from "@/lib/api";
import type { Loja } from "./tipos";

export type ResumoLoja = Pick<Loja, "id" | "name" | "logoUrl">;

const LOJAS_POR_PAGINA = 100; // maior `limit` aceito por GET /stores
const MAXIMO_DE_PAGINAS = 10;
// Prazo único para toda a paginação: evita somar vários timeouts sequenciais.
const TEMPO_LIMITE_TOTAL_MS = 3000;

/**
 * Lojas indexadas pelo id, para os cards de produto: GET /products só envia o
 * `storeId`, e consultar as lojas em páginas evita uma requisição por produto.
 * Se a consulta falhar ou estourar o prazo total, devolve o que já tiver e os
 * cards apenas omitem a loja.
 */
export async function listarLojasPorId(): Promise<Map<number, ResumoLoja>> {
  const lojas = new Map<number, ResumoLoja>();
  const prazoFinal = Date.now() + TEMPO_LIMITE_TOTAL_MS;

  try {
    for (let pagina = 0; pagina < MAXIMO_DE_PAGINAS; pagina++) {
      const restanteMs = prazoFinal - Date.now();
      if (restanteMs <= 0) break;

      const { data } = await api.get<ResumoLoja[]>("/stores", {
        params: { limit: LOJAS_POR_PAGINA, offset: pagina * LOJAS_POR_PAGINA },
        timeout: restanteMs,
      });
      if (!Array.isArray(data)) break;
      for (const loja of data) lojas.set(loja.id, loja);
      if (data.length < LOJAS_POR_PAGINA) break;
    }
  } catch {
    // A loja é complemento do card: a falha não impede a lista de produtos.
  }
  return lojas;
}
