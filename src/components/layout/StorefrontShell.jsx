"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function StorefrontShell({ children }) {
  const pathname = usePathname();

  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  if (isAdminRoute || isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}