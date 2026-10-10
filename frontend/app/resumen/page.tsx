'use client';
import { useEffect, useState } from 'react';
import { obtenerContratoDeLectura, leer, mensajeDeError, formatearBs, CONTRATO_ID, NOMBRE_RED } from '../../lib/web3';
import PlantillaFormulario from '../../components/PlantillaFormulario';
import '../../components/PlantillaFormulario.css';

interface Resumen {
  vehiculos: bigint; compradores: bigint; cargas: bigint;
  precio: bigint | null; limite: number; admin: string;
}

async function obtenerResumen(): Promise<Resumen> {
  const contrato = obtenerContratoDeLectura();
  const [vehiculos, compradores, cargas, precio, limite, admin] = await Promise.all([
    leer(contrato.vehicles_counter()),
    leer(contrato.buyers_counter()),
    leer(contrato.purchases_counter()),
    leer(contrato.get_gasoline_price()).catch(() => null), // PriceNotSet si aún no se definió
    leer(contrato.get_monthly_limit()),
    leer(contrato.get_admin()),
  ]);
  return { vehiculos, compradores, cargas, precio, limite, admin };
}

export default function ResumenContrato() {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [error, setError] = useState<string | null>(null); const [cargando, setCargando] = useState(true);

  const cargarResumen = () =>
    obtenerResumen()
      .then(setResumen)
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false));

  useEffect(() => { cargarResumen(); }, []);

  const consultar = () => { setCargando(true); setError(null); cargarResumen(); };

  return (
    <PlantillaFormulario titulo="Resumen del Contrato" icono="📈" mensajeError={error}>
      {resumen && (
        <div className="resultadoBox">
          <p><strong>Vehículos registrados:</strong> {resumen.vehiculos.toString()}</p>
          <p><strong>Compradores registrados:</strong> {resumen.compradores.toString()}</p>
          <p><strong>Cargas registradas:</strong> {resumen.cargas.toString()}</p>
          <p><strong>Precio por litro:</strong> {resumen.precio !== null ? formatearBs(resumen.precio) : 'Aún no definido'}</p>
          <p><strong>Límite mensual:</strong> {resumen.limite === 0 ? 'Sin límite' : `${resumen.limite} L por vehículo`}</p>
          <p><strong>Admin:</strong> <span className="valorLargo">{resumen.admin}</span></p>
          <p><strong>Contrato ({NOMBRE_RED}):</strong> <span className="valorLargo">{CONTRATO_ID}</span></p>
        </div>
      )}
      <button type="button" onClick={consultar} disabled={cargando} className="btnSearch">{cargando ? 'Actualizando...' : 'Actualizar'}</button>
    </PlantillaFormulario>
  );
}
