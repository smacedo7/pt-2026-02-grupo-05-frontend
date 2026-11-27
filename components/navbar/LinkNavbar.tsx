"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  rotulo?: string;
  className: string;
  classeAtiva: string;
  classeInativa?: string;
  children: React.ReactNode;
};

// Use apenas nos itens que aparecem depois da verificação da sessão: em rotas com
// parâmetro dinâmico, usePathname na pré-renderização exigiria um <Suspense>.
export default function LinkNavbar({
  href,
  rotulo,
  className,
  classeAtiva,
  classeInativa = "",
  children,
}: Props) {
  const ativo = usePathname() === href;

  return (
    <Link
      href={href}
      aria-label={rotulo}
      title={rotulo}
      aria-current={ativo ? "page" : undefined}
      className={`${className} ${ativo ? classeAtiva : classeInativa}`}
    >
      {children}
    </Link>
  );
}
