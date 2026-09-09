"use client";

import { type ReactNode } from "react";
import { InnerChrome } from "./InnerChrome";
import { usePathname } from "next/navigation";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <InnerChrome><div id="content" tabIndex={-1} className={pathname === "/" ? undefined : "case-detail"}>{children}</div></InnerChrome>;
}
