import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thiago.dev — Portfólio",
  description: "Portfólio de projetos, desenvolvimento e tecnologia de Thiago.",
  applicationName: "Thiago.dev",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
