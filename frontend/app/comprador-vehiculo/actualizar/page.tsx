'use client';
import { useState } from 'react';
import {
  obtenerContratoDeLectura, obtenerContratoDeEscritura, leer, enviar, mensajeDeError,
  NOMBRE_ESTADO_COMPRADOR, StateBuyer, type Buyer,
} from '../../../lib/web3';
import PlantillaFormulario from '../../../components/PlantillaFormulario';
import '../../../components/PlantillaFormulario.css';

// El contrato no reasigna compradores: cada vehículo puede tener varios compradores
// vinculados, y lo que se modifica es el estado de cada uno para esa placa
// (change_state_buyer_vehicle, solo admin). NoValid es definitivo.
export default function ActualizarCompradorVehiculo() {
  const [placa, setPlaca] = useState('');
  const [ci, setCi] = useState('');
  const [comprador, setComprador] = useState<Buyer | null>(null);
  const [estadoActual, setEstadoActual] = useState<StateBuyer | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState(String(StateBuyer.Valid));

  const [cargandoConsulta, setCargandoConsulta] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Consulta el comprador vinculado a la placa y su estado actual
  const consultarVinculacion = async () => {
    if (!placa.trim() || !ci.trim()) return;
    setCargandoConsulta(true);
    setMensajeError(null);
    setMensajeExito(null);
    setComprador(null);
    try {
      const contrato = obtenerContratoDeLectura();
      const args = { plate: placa.trim(), identity_card: ci.trim() };
      const [datos, estado] = await Promise.all([
        leer(contrato.find_buyer_by_vehicle(args)),
        leer(contrato.get_state_buyer_vehicle(args)),
      ]);
      setComprador(datos);
      setEstadoActual(estado);
    } catch (err) {
      setMensajeError(mensajeDeError(err));
    } finally {
      setCargandoConsulta(false);
    }
  };

  // Envía la transacción que cambia el estado del comprador para la placa
  const manejarActualizacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensajeExito(null);
    setMensajeError(null);
    try {
      const { contrato } = await obtenerContratoDeEscritura();
      const resultado = await enviar(contrato.change_state_buyer_vehicle({
        plate: placa.trim(), identity_card: ci.trim(), state: Number(nuevoEstado) as StateBuyer,
      }));
      setEstadoActual(resultado.state);
      setMensajeExito(`Estado actualizado a ${NOMBRE_ESTADO_COMPRADOR[resultado.state]}.`);
    } catch (err) {
      setMensajeError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  };

  return (
    <PlantillaFormulario titulo="Estado del Comprador en un Vehículo" icono="⚙️" mensajeExito={mensajeExito} mensajeError={mensajeError}>
      <div className="searchGroup">
        <input type="text" value={placa} onChange={(e) => setPlaca(e.target.value)} placeholder="Placa" className="inputField" />
        <input type="text" value={ci} onChange={(e) => setCi(e.target.value)} placeholder="CI del comprador" className="inputField" />
        <button type="button" onClick={consultarVinculacion} disabled={cargandoConsulta} className="btnSearch">
          {cargandoConsulta ? 'Buscando...' : 'Ver Asignación'}
        </button>
      </div>

      {comprador && estadoActual !== null && (
        <form onSubmit={manejarActualizacion} className="formGrid">
          <div style={{ padding: '12px', backgroundColor: '#1e293b', borderRadius: '6px', marginBottom: '10px', color: '#f8fafc' }}>
            <p style={{ margin: '0 0 6px 0' }}><strong>Comprador:</strong> {comprador.names} {comprador.last_names}</p>
            <p style={{ margin: 0 }}><strong>Estado actual:</strong> {NOMBRE_ESTADO_COMPRADOR[estadoActual] ?? estadoActual}</p>
          </div>

          <select value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)} className="selectField">
            <option value={StateBuyer.Valid}>Válido</option>
            <option value={StateBuyer.Blocked}>Bloqueado</option>
            <option value={StateBuyer.NoValid}>No válido (definitivo, no se puede revertir)</option>
          </select>

          <button type="submit" disabled={cargando || estadoActual === StateBuyer.NoValid} className="btnUpdate">
            {cargando ? 'Actualizando...' : 'Cambiar Estado'}
          </button>
        </form>
      )}
    </PlantillaFormulario>
  );
}
