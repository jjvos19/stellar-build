'use client';
import { useState } from 'react';
import { obtenerContratoDeLectura, leer, mensajeDeError, type Buyer } from '../../../lib/web3';
import PlantillaFormulario from '../../../components/PlantillaFormulario';
import '../../../components/PlantillaFormulario.css';

// El contrato buy-jerrycan-gasoline no tiene una función para modificar los datos
// de un comprador (solo register_buyer y find_buyer). Esta pantalla muestra los
// datos actuales; para permitir la edición hay que agregar al contrato una función
// como update_buyer, regenerar el binding y llamarla desde aquí.
export default function ActualizarComprador() {
  const [ci, setCi] = useState('');
  const [comprador, setComprador] = useState<Buyer | null>(null);
  const [cargandoConsulta, setCargandoConsulta] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const consultarComprador = async () => {
    if (!ci.trim()) return;
    setCargandoConsulta(true);
    setMensajeError(null);
    setComprador(null);
    try {
      const contrato = obtenerContratoDeLectura();
      setComprador(await leer(contrato.find_buyer({ identity_card: ci.trim() })));
    } catch (err) {
      setMensajeError(mensajeDeError(err));
    } finally {
      setCargandoConsulta(false);
    }
  };

  return (
    <PlantillaFormulario titulo="Actualizar Comprador" icono="⚙️" mensajeError={mensajeError}>
      <div className="searchGroup">
        <input
          type="text"
          value={ci}
          onChange={(e) => setCi(e.target.value)}
          placeholder="Ingrese el CI a buscar"
          className="inputField"
        />
        <button type="button" onClick={consultarComprador} disabled={cargandoConsulta} className="btnSearch">
          {cargandoConsulta ? 'Buscando...' : 'Ver Datos'}
        </button>
      </div>

      {comprador && (
        <div className="formGrid">
          <div style={{ padding: '12px', backgroundColor: '#1e293b', borderRadius: '6px', marginBottom: '10px', color: '#f8fafc' }}>
            <p style={{ margin: '0 0 6px 0' }}><strong>Nombres:</strong> {comprador.names}</p>
            <p style={{ margin: '0 0 6px 0' }}><strong>Apellidos:</strong> {comprador.last_names}</p>
            <p style={{ margin: 0 }}><strong>Teléfono:</strong> {comprador.phonenumber.toString()}</p>
          </div>
          <p style={{ margin: 0, color: '#94a3b8' }}>
            El contrato actual no permite modificar los datos de un comprador.
          </p>
        </div>
      )}
    </PlantillaFormulario>
  );
}
