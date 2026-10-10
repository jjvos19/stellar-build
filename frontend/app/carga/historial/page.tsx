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
        <input type="text" value={placa} onChange={(e) => setPlaca(e.target.value)} placeholder="Placa" required className="inputField" />
        <button type="submit" disabled={cargando} className="btnSearch">{cargando ? 'Buscando...' : 'Consultar'}</button>
      </form>

      {total !== null && (
        <div className="resultadoBox">
          <p><strong>Placa:</strong> {placaConsultada} — <strong>Cargas registradas:</strong> {total.toString()}</p>
          {cargas.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                  <th style={celda}>N°</th><th style={celda}>Fecha</th><th style={celda}>Litros</th>
                  <th style={celda}>Precio/L</th><th style={celda}>Total</th><th style={celda}>ID comprador</th>
                </tr>
              </thead>
              <tbody>
                {cargas.map((c) => (
                  <tr key={c.id.toString()} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={celda}>{c.id.toString()}</td>
                    <td style={celda}>{formatearFecha(c.times)}</td>
                    <td style={celda}>{c.liters}</td>
                    <td style={celda}>{formatearBs(c.price_per_liter)}</td>
                    <td style={celda}>{formatearBs(c.price)}</td>
                    <td style={celda}>{c.buyer_id.toString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>El vehículo no tiene cargas registradas.</p>
          )}
          {totalPaginas > 1 && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '12px' }}>
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

const celda: React.CSSProperties = { padding: '6px 8px' };
