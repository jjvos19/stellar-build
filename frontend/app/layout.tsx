import type { Metadata } from "next";
import { Exo_2, Inter, JetBrains_Mono } from "next/font/google";
import Menu from "../components/Menu";
import "./globals.css";
import "./layout.css";

// Exo 2: títulos con aire futurista · Inter: texto legible · JetBrains Mono: direcciones y códigos
const fuenteTitulo = Exo_2({ variable: "--font-titulo", subsets: ["latin"], weight: ["600", "700", "800"] });
const fuenteTexto = Inter({ variable: "--font-texto", subsets: ["latin"] });
const fuenteMono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Cargado de Gasolina en Bidon",
  description: "Se encarga del registro de vehiculos y personas que pueden cargar gasolina en bidon.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${fuenteTitulo.variable} ${fuenteTexto.variable} ${fuenteMono.variable}`}>
      <body>
        <div className="estructura">
          <Menu />
          <div className="contenido">{children}</div>
        </div>
      </body>
    </html>
  );
}
