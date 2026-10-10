'use client';
import { useState } from 'react';
import { obtenerContratoDeLectura, leer, mensajeDeError, type Buyer } from '../../../lib/web3';
import PlantillaFormulario from '../../../components/PlantillaFormulario';
import '../../../components/PlantillaFormulario.css';

export default function BuscarComprador() {
  const [ci, setCi] = useState(''); const [comprador, setComprador] = useState<Buyer | null>(null);
  const [error, setError] = useState<string | null>(null); const [cargando, setCargando] = useState(false);

  const manejarBusqueda = async (e: React.FormEvent) => {
    e.preventDefault(); setCargando(true); setError(null); setComprador(null);
    try {
      const contrato = obtenerContratoDeLectura();
      setComprador(await leer(contrato.find_buyer({ identity_card: ci.trim() })));
    } catch (err) { setError(mensajeDeError(err)); } finally { setCargando(false); }
  };

  return (
    <PlantillaFormulario titulo="Buscar Comprador" icono="🔍" mensajeError={error}>
      <form onSubmit={manejarBusqueda} className="searchGroup">
        <label className="campo"><span>CI</span><input type="text" value={ci} onChange={(e) => setCi(e.target.value)} required className="inputField" /></label>
        <button type="submit" disabled={cargando} className="btnSearch">{cargando ? 'Buscando...' : 'Buscar'}</button>
      </form>
      {comprador && (
        <div className="resultadoBox">
          <p><strong>CI:</strong> {comprador.identity_card}</p>
          <p><strong>Nombres:</strong> {comprador.names}</p>
          <p><strong>Apellidos:</strong> {comprador.last_names}</p>
          <p><strong>Teléfono:</strong> {comprador.phonenumber.toString()}</p>
        </div>
      )}
    </PlantillaFormulario>
  );
}
