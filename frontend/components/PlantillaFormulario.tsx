// components/PlantillaFormulario.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Lock, CircleCheck, TriangleAlert } from 'lucide-react';
import { buscarRuta } from '../lib/navegacion';
import './PlantillaFormulario.css';

interface PlantillaFormularioProps {
  titulo: string;
  /** Ícono de respaldo (emoji) si la ruta no está en lib/navegacion.ts */
  icono?: string;
  children: React.ReactNode;
  mensajeExito?: string | null;
  mensajeError?: string | null;
}

export default function PlantillaFormulario({
  titulo,
  icono = '📋',
  children,
  mensajeExito,
  mensajeError,
}: PlantillaFormularioProps) {
  // Grupo, descripción, ícono y si requiere admin salen de la configuración del menú
  const ruta = buscarRuta(usePathname());
  const Icono = ruta?.item.icono;

  return (
    <main className={`pagina color-${ruta?.grupo.color ?? 'amarillo'}`}>
      <header className="paginaCabecera">
        {ruta && (
          <nav className="migas" aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span>{ruta.grupo.etiqueta}</span>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">{ruta.item.etiqueta}</span>
          </nav>
        )}

        <div className="paginaTituloFila">
          <span className="paginaIcono" aria-hidden="true">{Icono ? <Icono size={24} /> : icono}</span>
          <h1 className="titulo">{titulo}</h1>
          {ruta?.item.admin && (
            <span className="chipAdmin" title="La cuenta conectada en la wallet debe ser el admin del contrato">
              <Lock size={13} /> Solo admin
            </span>
          )}
        </div>
        {ruta && <p className="paginaDescripcion">{ruta.item.descripcion}</p>}
      </header>

      <section className="tarjeta">
        {children}

        <div aria-live="polite">
          {mensajeExito && (
            <div className="alerta alertExito" role="status">
              <CircleCheck size={20} aria-hidden="true" /> <span>{mensajeExito}</span>
            </div>
          )}
        </div>
        <div aria-live="assertive">
          {mensajeError && (
            <div className="alerta alertError" role="alert">
              <TriangleAlert size={20} aria-hidden="true" /> <span>{mensajeError}</span>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
