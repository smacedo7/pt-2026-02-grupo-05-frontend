import type { Metadata } from "next";
import VitrineProdutos from "./VitrineProdutos";

export const metadata: Metadata = { title: "Produtos | Stock.io" };

export default function PaginaProdutos() {
  return <VitrineProdutos />;
}
