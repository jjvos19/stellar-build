'use client';
import { useState } from 'react';
import { obtenerContratoDeEscritura, enviar, mensajeDeError } from '../../../lib/web3';
import PlantillaFormulario from '../../../components/PlantillaFormulario';
import '../../../components/PlantillaFormulario.css';

export default function RegistrarCompradorVehiculo() {
  const [ci, setCi] = useState(''); const [placa, setPlaca] = useState('');
  const [cargando, setCargando] = useState(false); const [exito, setExito] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);

  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault(); setCargando(true); setExito(null); setError(null);
    try {
      // register_buyer_to_vehicle solo lo puede ejecutar el admin del contrato.
      const { contrato } = await obtenerContratoDeEscritura();
      await enviar(contrato.register_buyer_to_vehicle({ plate: placa.trim(), identity_card: ci.trim() }));
      setExito(`CI ${ci} vinculado a placa ${placa}.`);
      setCi(''); setPlaca('');
    } catch (err) { setError(mensajeDeError(err)); } finally { setCargando(false); }
  };

  return (
    <PlantillaFormulario titulo="Vincular Cliente a Vehículo" icono="🔗" mensajeExito={exito} mensajeError={error}>
      <form onSubmit={manejarRegistro} className="formGrid">
        <input type="text" value={ci} onChange={(e) => setCi(e.target.value)} placeholder="CI" required className="inputField" />
        <input type="text" value={placa} onChange={(e) => setPlaca(e.target.value)} placeholder="Placa" required className="inputField" />
        <button type="submit" disabled={cargando} className="btnSubmit">{cargando ? 'Vinculando...' : 'Guardar'}</button>
      </form>
    </PlantillaFormulario>
  );
}
