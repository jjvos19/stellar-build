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
        <label className="campo"><span>Nombres</span><input type="text" value={nombres} onChange={(e) => setNombres(e.target.value)} required className="inputField" /></label>
        <label className="campo"><span>Apellidos</span><input type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required className="inputField" /></label>
        <label className="campo"><span>CI</span><input type="text" value={ci} onChange={(e) => setCi(e.target.value)} required className="inputField" /></label>
        <label className="campo"><span>Teléfono</span><input type="tel" inputMode="numeric" value={telefono} onChange={(e) => setTelefono(e.target.value)} required className="inputField" /></label>
        <button type="submit" disabled={cargando} className="btnSubmit">{cargando ? 'Registrando...' : 'Guardar'}</button>
      </form>
    </PlantillaFormulario>
  );
}
