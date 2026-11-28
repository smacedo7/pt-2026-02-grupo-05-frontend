"use client";

import { Suspense } from "react";
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

// Em rotas com parâmetro dinâmico, usePathname suspende na pré-renderização. O
// <Suspense> mostra o mesmo link, sem destaque, até a rota ser conhecida.
export default function LinkNavbar(props: Props) {
  return (
    <Suspense fallback={<Item {...props} ativo={false} />}>
      <ItemDaRota {...props} />
    </Suspense>
  );
}

function ItemDaRota(props: Props) {
  return <Item {...props} ativo={usePathname() === props.href} />;
}

function Item({
  href,
  rotulo,
  className,
  classeAtiva,
  classeInativa = "",
  children,
  ativo,
}: Props & { ativo: boolean }) {
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
