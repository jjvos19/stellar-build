'use client';
import { useState } from 'react';
import { obtenerContratoDeLectura, leer, mensajeDeError, NOMBRE_ESTADO_VEHICULO, type Vehicle } from '../../../lib/web3';
import PlantillaFormulario from '../../../components/PlantillaFormulario';
import '../../../components/PlantillaFormulario.css';

export default function BuscarVehiculo() {
  const [placa, setPlaca] = useState('');
  const [vehiculo, setVehiculo] = useState<Vehicle | null>(null);
  const [errorContrato, setErrorContrato] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const manejarBusqueda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa.trim()) return;
    setCargando(true); setErrorContrato(null); setVehiculo(null);
    try {
      const contrato = obtenerContratoDeLectura();
      setVehiculo(await leer(contrato.find_vehicle({ plate: placa.trim() })));
    } catch (err) {
      setErrorContrato(mensajeDeError(err));
    } finally { setCargando(false); }
  };

  return (
    <PlantillaFormulario titulo="Buscar Vehículo" icono="🔍" mensajeError={errorContrato}>
      <form onSubmit={manejarBusqueda} className="searchGroup">
        <label className="campo"><span>Placa</span><input type="text" value={placa} onChange={(e) => setPlaca(e.target.value)} required className="inputField" /></label>
        <button type="submit" disabled={cargando} className="btnSearch">{cargando ? 'Buscando...' : 'Buscar'}</button>
      </form>
      {vehiculo && (
        <div className="resultadoBox">
          <p><strong>Placa:</strong> {vehiculo.plate}</p>
          <p><strong>Marca:</strong> {vehiculo.brand}</p>
          <p><strong>Modelo:</strong> {vehiculo.model}</p>
          <p><strong>Año:</strong> {vehiculo.year}</p>
          <p><strong>Color:</strong> {vehiculo.color}</p>
          <p><strong>Estado:</strong> {NOMBRE_ESTADO_VEHICULO[vehiculo.state] ?? vehiculo.state}</p>
        </div>
      )}
    </PlantillaFormulario>
  );
}
