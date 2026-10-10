'use client';
import { useState } from 'react';
import { obtenerContratoDeLectura, leer, mensajeDeError, formatearMes, mesActual } from '../../../lib/web3';
import PlantillaFormulario from '../../../components/PlantillaFormulario';
import '../../../components/PlantillaFormulario.css';

/** "2026-10" (valor de <input type="month">) → 202610 */
const aAnioMes = (valor: string) => Number(valor.replace('-', ''));
/** 202610 → "2026-10" */
const aValorMes = (anioMes: number) => `${String(anioMes).slice(0, 4)}-${String(anioMes).slice(4)}`;

export default function LitrosPorMes() {
  const [placa, setPlaca] = useState('');
  const [mes, setMes] = useState(aValorMes(mesActual()));
  const [datos, setDatos] = useState<{ placa: string; anioMes: number; litros: number; actual: number; limite: number } | null>(null);
  const [error, setError] = useState<string | null>(null); const [cargando, setCargando] = useState(false);

  const manejarBusqueda = async (e: React.FormEvent) => {
    e.preventDefault(); setCargando(true); setError(null); setDatos(null);
    try {
      const contrato = obtenerContratoDeLectura();
      const plate = placa.trim();
      const anioMes = aAnioMes(mes);
      const [litros, actual, limite] = await Promise.all([
        leer(contrato.get_month_liters({ plate, year_month: anioMes })),
        leer(contrato.get_current_month_liters({ plate })),
        leer(contrato.get_monthly_limit()),
      ]);
      setDatos({ placa: plate, anioMes, litros, actual, limite });
    } catch (err) { setError(mensajeDeError(err)); } finally { setCargando(false); }
  };

  return (
    <PlantillaFormulario titulo="Litros Cargados por Mes" icono="📊" mensajeError={error}>
      <form onSubmit={manejarBusqueda} className="formGrid">
        <label className="campo"><span>Placa</span><input type="text" value={placa} onChange={(e) => setPlaca(e.target.value)} required className="inputField" /></label>
        <label className="campo"><span>Mes</span><input type="month" value={mes} onChange={(e) => setMes(e.target.value)} required className="inputField" /></label>
        <button type="submit" disabled={cargando} className="btnSearch">{cargando ? 'Consultando...' : 'Consultar'}</button>
      </form>
      {datos && (
        <div className="resultadoBox">
          <p><strong>Placa:</strong> {datos.placa}</p>
          <p><strong>Litros en {formatearMes(datos.anioMes)}:</strong> {datos.litros} L</p>
          <p><strong>Litros en el mes actual:</strong> {datos.actual} L</p>
          <p><strong>Límite mensual:</strong> {datos.limite === 0 ? 'Sin límite' : `${datos.limite} L`}</p>
          {datos.limite > 0 && (
            <p><strong>Disponible este mes:</strong> {Math.max(0, datos.limite - datos.actual)} L</p>
          )}
        </div>
      )}
    </PlantillaFormulario>
  );
}
