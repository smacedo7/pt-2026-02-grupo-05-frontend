import type { Metadata } from "next";
import LojasConteudo from "./LojasConteudo";

export const metadata: Metadata = {
  title: "Lojas | Stock.io",
  description: "Explore todas as lojas cadastradas na Stock.io.",
};

export default function LojasPage() {
  return <LojasConteudo />;
}
