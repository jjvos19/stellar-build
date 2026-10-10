'use client';
import { useState } from 'react';
import { obtenerContratoDeEscritura, enviar, mensajeDeError, StateVehicle } from '../../../lib/web3';
import PlantillaFormulario from '../../../components/PlantillaFormulario';
import '../../../components/PlantillaFormulario.css';

export default function ActualizarVehiculo() {
  const [placa, setPlaca] = useState(''); const [nuevoEstado, setNuevoEstado] = useState(String(StateVehicle.Valid));
  const [cargando, setCargando] = useState(false); const [exito, setExito] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);

  const manejarActualizacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true); setExito(null); setError(null);
    try {
      // change_state_vehicle solo lo puede ejecutar el admin del contrato.
      const { contrato } = await obtenerContratoDeEscritura();
      await enviar(contrato.change_state_vehicle({ plate: placa.trim(), state: Number(nuevoEstado) as StateVehicle }));
      setExito(`Estado de ${placa} actualizado.`);
    } catch (err) { setError(mensajeDeError(err)); } finally { setCargando(false); }
  };

  return (
    <PlantillaFormulario titulo="Cambiar Estado del Vehículo" icono="⚙️" mensajeExito={exito} mensajeError={error}>
      <form onSubmit={manejarActualizacion} className="formGrid">
        <label className="campo"><span>Placa</span><input type="text" value={placa} onChange={(e) => setPlaca(e.target.value)} required className="inputField" /></label>
        <label className="campo">
          <span>Nuevo estado</span>
          <select value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)} className="selectField">
            <option value={StateVehicle.Valid}>Válido</option>
            <option value={StateVehicle.Blocked}>Bloqueado</option>
            <option value={StateVehicle.Stolen}>Robado</option>
            <option value={StateVehicle.NotValid}>No válido (definitivo, no se puede revertir)</option>
          </select>
        </label>
        <button type="submit" disabled={cargando} className="btnUpdate">{cargando ? 'Actualizando...' : 'Modificar Estado'}</button>
      </form>
    </PlantillaFormulario>
  );
}
