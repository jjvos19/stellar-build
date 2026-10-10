import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./layout.css";
import Link from 'next/link';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="es">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0f172a', color: '#f8fafc' }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          
          {/* MENÚ LATERAL IZQUIERDO FIJO */}
          <aside style={{
            width: '260px',
            backgroundColor: '#1e293b',
            borderRight: '1px solid #334155',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
            boxSizing: 'border-box'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#38bdf8', margin: '0 0 10px 0' }}>
              Sistema de compra de gasolina en bidon
            </h2>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/" style={estiloLink}>🏠 Inicio</Link>

            <div className="navGroup">
              <span className="navCategoria">🚗 Módulo Vehículos</span>
              <Link href="/vehiculo/buscar" style={estiloLink}>🔍 Buscar</Link>
              <Link href="/vehiculo/registrar" style={estiloLink}>🚗 Registrar</Link>
              <Link href="/vehiculo/actualizar" style={estiloLink}>⚙️ Actualizar</Link>
            </div>

            <div className="navGroup">
              <span className="navCategoria">👤 Módulo Comprador</span>
              <Link href="/comprador/buscar" style={estiloLink}>🔍 Buscar</Link>
              <Link href="/comprador/registrar" style={estiloLink}>👤 Registrar</Link>
              <Link href="/comprador/actualizar" style={estiloLink}>⚙️ Actualizar</Link>
            </div>

            {/* GRUPO: COMPRADOR - VEHÍCULO */}
            <div className="navGroup">
              <span className="navCategoria">🤝 Asignación</span>
              <Link href="/comprador-vehiculo/buscar" className="navLink">🔍 Buscar por Placa</Link>
              <Link href="/comprador-vehiculo/registrar" className="navLink">➕ Vincular</Link>
              <Link href="/comprador-vehiculo/actualizar" className="navLink">⚙️ Reasignar</Link>
            </div>

            {/* GRUPO: CARGAS DE GASOLINA */}
            <div className="navGroup">
              <span className="navCategoria">⛽ Cargas</span>
              <Link href="/carga/registrar" className="navLink">⛽ Registrar</Link>
              <Link href="/carga/buscar" className="navLink">🔍 Buscar</Link>
              <Link href="/carga/historial" className="navLink">📜 Historial por Placa</Link>
              <Link href="/carga/litros" className="navLink">📊 Litros por Mes</Link>
            </div>

            {/* GRUPO: ADMINISTRACIÓN DEL CONTRATO */}
            <div className="navGroup">
              <span className="navCategoria">🛠️ Administración</span>
              <Link href="/resumen" className="navLink">📈 Resumen</Link>
              <Link href="/admin/precio" className="navLink">💲 Precio</Link>
              <Link href="/admin/limite" className="navLink">📏 Límite Mensual</Link>
              <Link href="/admin/administrador" className="navLink">🛡️ Administrador</Link>
            </div>

            </nav>
          </aside>

          {/* CONTENIDO DINÁMICO DE CADA RUTA / PÁGINA */}
          <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
            {children}
          </div>

        </div>
      </body>
    </html>
  );
}

// Estilo reutilizable para los enlaces del menú lateral
const estiloLink: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: '6px',
  color: '#cbd5e1',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: '500',
  display: 'block',
  transition: 'background-color 0.2s, color 0.2s',
};