'use client';
import { useState } from 'react';
import {
  obtenerContratoDeLectura, leer, mensajeDeError, formatearBs, formatearFecha, type Purchase,
} from '../../../lib/web3';
import PlantillaFormulario from '../../../components/PlantillaFormulario';
import '../../../components/PlantillaFormulario.css';

const POR_PAGINA = 10;

export default function HistorialCargas() {
  const [placa, setPlaca] = useState('');
  const [placaConsultada, setPlacaConsultada] = useState('');
  const [total, setTotal] = useState<bigint | null>(null);
  const [pagina, setPagina] = useState(0);
  const [cargas, setCargas] = useState<Purchase[]>([]);
  const [error, setError] = useState<string | null>(null); const [cargando, setCargando] = useState(false);

  const cargarPagina = async (placaBuscar: string, numeroPagina: number) => {
    setCargando(true); setError(null);
    try {
      const contrato = obtenerContratoDeLectura();
      const [cantidad, lista] = await Promise.all([
        leer(contrato.get_vehicle_purchases_count({ plate: placaBuscar })),
        leer(contrato.list_vehicle_purchases({
          plate: placaBuscar, start: BigInt(numeroPagina * POR_PAGINA), limit: POR_PAGINA,
        })),
      ]);
      setPlacaConsultada(placaBuscar); setTotal(cantidad); setPagina(numeroPagina); setCargas(lista);
    } catch (err) { setError(mensajeDeError(err)); } finally { setCargando(false); }
  };

  const manejarBusqueda = (e: React.FormEvent) => {
    e.preventDefault();
    setTotal(null); setCargas([]);
    cargarPagina(placa.trim(), 0);
  };

  const totalPaginas = total !== null ? Math.max(1, Math.ceil(Number(total) / POR_PAGINA)) : 1;

  return (
    <PlantillaFormulario titulo="Historial de Cargas por Vehículo" icono="📜" mensajeError={error}>
      <form onSubmit={manejarBusqueda} className="searchGroup">
        <label className="campo"><span>Placa</span><input type="text" value={placa} onChange={(e) => setPlaca(e.target.value)} required className="inputField" /></label>
        <button type="submit" disabled={cargando} className="btnSearch">{cargando ? 'Buscando...' : 'Consultar'}</button>
      </form>

      {total !== null && (
        <div className="resultadoBox">
          <p><strong>Placa:</strong> {placaConsultada}</p>
          <p><strong>Cargas registradas:</strong> {total.toString()}</p>
          {cargas.length > 0 ? (
            <div className="tablaContenedor">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>N°</th><th>Fecha</th><th>Litros</th>
                    <th>Precio/L</th><th>Total</th><th>ID comprador</th>
                  </tr>
                </thead>
                <tbody>
                  {cargas.map((c) => (
                    <tr key={c.id.toString()}>
                      <td>{c.id.toString()}</td>
                      <td>{formatearFecha(c.times)}</td>
                      <td>{c.liters}</td>
                      <td>{formatearBs(c.price_per_liter)}</td>
                      <td>{formatearBs(c.price)}</td>
                      <td>{c.buyer_id.toString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="nota">El vehículo no tiene cargas registradas.</p>
          )}
          {totalPaginas > 1 && (
            <div className="paginacion">
              <button type="button" className="btnSearch" disabled={cargando || pagina === 0}
                onClick={() => cargarPagina(placaConsultada, pagina - 1)}>← Anterior</button>
              <span>Página {pagina + 1} de {totalPaginas}</span>
              <button type="button" className="btnSearch" disabled={cargando || pagina + 1 >= totalPaginas}
                onClick={() => cargarPagina(placaConsultada, pagina + 1)}>Siguiente →</button>
            </div>
          )}
        </div>
      )}
    </PlantillaFormulario>
  );
}
