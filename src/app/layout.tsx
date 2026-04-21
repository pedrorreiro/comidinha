import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Provider } from "@/components/ui/provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Saborê",
  description:
    "Registre café da manhã, almoço, lanches e jantar e exporte o mês em PDF para sua nutricionista.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.variable}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
