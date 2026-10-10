'use client';
import { useState } from 'react';
import {
  obtenerContratoDeLectura, leer, mensajeDeError, formatearBs, formatearFecha, formatearMes, type Purchase,
} from '../../../lib/web3';
import PlantillaFormulario from '../../../components/PlantillaFormulario';
import '../../../components/PlantillaFormulario.css';

export default function BuscarCarga() {
  const [id, setId] = useState(''); const [carga, setCarga] = useState<Purchase | null>(null);
  const [error, setError] = useState<string | null>(null); const [cargando, setCargando] = useState(false);

  const manejarBusqueda = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setCarga(null);
    if (!/^\d+$/.test(id.trim())) { setError('El número de carga debe ser un entero.'); return; }
    setCargando(true);
    try {
      const contrato = obtenerContratoDeLectura();
      setCarga(await leer(contrato.get_purchase({ id: BigInt(id.trim()) })));
    } catch (err) { setError(mensajeDeError(err)); } finally { setCargando(false); }
  };

  return (
    <PlantillaFormulario titulo="Buscar Carga" icono="🔍" mensajeError={error}>
      <form onSubmit={manejarBusqueda} className="searchGroup">
        <label className="campo"><span>N° de carga</span><input type="number" min="1" value={id} onChange={(e) => setId(e.target.value)} required className="inputField" /></label>
        <button type="submit" disabled={cargando} className="btnSearch">{cargando ? 'Buscando...' : 'Buscar'}</button>
      </form>
      {carga && (
        <div className="resultadoBox">
          <p><strong>N° de carga:</strong> {carga.id.toString()}</p>
          <p><strong>Placa:</strong> {carga.plate}</p>
          <p><strong>ID del comprador:</strong> {carga.buyer_id.toString()}</p>
          <p><strong>Litros:</strong> {carga.liters}</p>
          <p><strong>Precio por litro:</strong> {formatearBs(carga.price_per_liter)}</p>
          <p><strong>Total pagado:</strong> {formatearBs(carga.price)}</p>
          <p><strong>Fecha:</strong> {formatearFecha(carga.times)}</p>
          <p><strong>Mes:</strong> {formatearMes(carga.year_month)}</p>
        </div>
      )}
    </PlantillaFormulario>
  );
}
