// components/PlantillaFormulario.tsx
import React from 'react';
import './PlantillaFormulario.css';

interface PlantillaFormularioProps {
  titulo: string;
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
  return (
    <main className="formContainer">
      <h1 className="titulo">
        {icono} {titulo}
      </h1>
      
      {children}

      {mensajeExito && <div className="alertExito">✅ {mensajeExito}</div>}
      {mensajeError && <div className="alertError">⚠️ {mensajeError}</div>}
    </main>
  );
}
