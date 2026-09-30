import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });

export const metadata: Metadata = {
  title: "Give Your Peak | Calzado y Accesorios Deportivos",
  description: "Alcanza tu máximo potencial con el mejor calzado deportivo en Perú.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.variable} ${oswald.variable} font-sans bg-dark-bg text-white`}>
        {children}
      </body>
    </html>
  );
}
