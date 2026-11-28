// "1.299,90": ponto separando milhares e, se houver, centavos depois da vírgula.
const COM_MILHARES = /^[1-9]\d{0,2}(\.\d{3})+(,\d{1,2})?$/;
// "1299,90", "1299.90" ou "1299".
const SIMPLES = /^\d+([.,]\d{1,2})?$/;

/**
 * Lê um preço digitado, com ou sem "R$". Devolve NaN para o que não for um
 * preço (inclusive negativo), em vez de aproveitar só os dígitos.
 */
export function parsearPreco(texto: string): number {
  const limpo = texto.replace(/^\s*R\$/i, "").trim();
  if (COM_MILHARES.test(limpo)) {
    return Number(limpo.replaceAll(".", "").replace(",", "."));
  }
  return SIMPLES.test(limpo) ? Number(limpo.replace(",", ".")) : Number.NaN;
}
