import type { Metadata } from "next";
import AdminLayoutClient from "./admin-layout-client";

export const metadata: Metadata = {
  title: "Administração · PeladaPro",
  description: "Painel administrativo da plataforma PeladaPro",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
