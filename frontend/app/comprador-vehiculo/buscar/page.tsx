'use client';
import { useState } from 'react';
import { obtenerContratoDeLectura, leer, mensajeDeError, NOMBRE_ESTADO_COMPRADOR, StateBuyer, type Buyer } from '../../../lib/web3';
import PlantillaFormulario from '../../../components/PlantillaFormulario';
import '../../../components/PlantillaFormulario.css';

export default function BuscarCompradorVehiculo() {
  const [placa, setPlaca] = useState(''); const [ci, setCi] = useState('');
  const [datos, setDatos] = useState<{ comprador: Buyer; estado: StateBuyer } | null>(null);
  const [error, setError] = useState<string | null>(null); const [cargando, setCargando] = useState(false);

  const manejarBusqueda = async (e: React.FormEvent) => {
    e.preventDefault(); setCargando(true); setError(null); setDatos(null);
    try {
      const contrato = obtenerContratoDeLectura();
      const args = { plate: placa.trim(), identity_card: ci.trim() };
      const [comprador, estado] = await Promise.all([
        leer(contrato.find_buyer_by_vehicle(args)),
        leer(contrato.get_state_buyer_vehicle(args)),
      ]);
      setDatos({ comprador, estado });
    } catch (err) { setError(mensajeDeError(err)); } finally { setCargando(false); }
  };

  return (
    <PlantillaFormulario titulo="Buscar Comprador de un Vehículo" icono="🔍" mensajeError={error}>
      <form onSubmit={manejarBusqueda} className="searchGroup">
        <input type="text" value={placa} onChange={(e) => setPlaca(e.target.value)} placeholder="Placa" required className="inputField" />
        <input type="text" value={ci} onChange={(e) => setCi(e.target.value)} placeholder="CI" required className="inputField" />
        <button type="submit" disabled={cargando} className="btnSearch">{cargando ? 'Buscando...' : 'Consultar'}</button>
      </form>
      {datos && (
        <div className="resultadoBox">
          <p><strong>Nombres:</strong> {datos.comprador.names}</p>
          <p><strong>Apellidos:</strong> {datos.comprador.last_names}</p>
          <p><strong>CI:</strong> {datos.comprador.identity_card}</p>
          <p><strong>Estado para la placa:</strong> {NOMBRE_ESTADO_COMPRADOR[datos.estado] ?? datos.estado}</p>
        </div>
      )}
    </PlantillaFormulario>
  );
}
