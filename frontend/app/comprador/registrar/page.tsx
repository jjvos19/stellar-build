'use client';
import { useState } from 'react';
import { obtenerContratoDeEscritura, enviar, mensajeDeError } from '../../../lib/web3';
import PlantillaFormulario from '../../../components/PlantillaFormulario';
import '../../../components/PlantillaFormulario.css';

export default function RegistrarComprador() {
  const [nombres, setNombres] = useState(''); const [apellidos, setApellidos] = useState('');
  const [ci, setCi] = useState(''); const [telefono, setTelefono] = useState('');
  const [cargando, setCargando] = useState(false); const [exito, setExito] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);

  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault(); setExito(null); setError(null);
    if (!/^\d+$/.test(telefono.trim())) { setError('El teléfono debe contener solo números.'); return; }
    setCargando(true);
    try {
      const { contrato, direccion } = await obtenerContratoDeEscritura();
      await enviar(contrato.register_buyer({
        register_by: direccion,
        names: nombres.trim(), last_names: apellidos.trim(),
        identity_card: ci.trim(), phonenumber: BigInt(telefono.trim()),
      }));
      setExito(`Comprador ${ci} registrado.`);
      setNombres(''); setApellidos(''); setCi(''); setTelefono('');
    } catch (err) { setError(mensajeDeError(err)); } finally { setCargando(false); }
  };

  return (
    <PlantillaFormulario titulo="Registrar Comprador" icono="👤" mensajeExito={exito} mensajeError={error}>
      <form onSubmit={manejarRegistro} className="formGrid">
        <input type="text" value={nombres} onChange={(e) => setNombres(e.target.value)} placeholder="Nombres" required className="inputField" />
        <input type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} placeholder="Apellidos" required className="inputField" />
        <input type="text" value={ci} onChange={(e) => setCi(e.target.value)} placeholder="CI" required className="inputField" />
        <input type="tel" inputMode="numeric" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Teléfono" required className="inputField" />
        <button type="submit" disabled={cargando} className="btnSubmit">{cargando ? 'Registrando...' : 'Guardar'}</button>
      </form>
    </PlantillaFormulario>
  );
}
