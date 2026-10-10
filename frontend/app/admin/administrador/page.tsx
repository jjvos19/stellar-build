'use client';
import { useEffect, useState } from 'react';
import type { contract } from 'buy-jerrycan-gasoline';
import {
  obtenerContratoDeLectura, obtenerContratoDeEscritura, conectarWallet, firmaDeAutorizacion, leer, mensajeDeError,
} from '../../../lib/web3';
import PlantillaFormulario from '../../../components/PlantillaFormulario';
import '../../../components/PlantillaFormulario.css';

// set_admin requiere DOS firmas: la del admin actual (envía la transacción) y la
// del nuevo admin (autoriza recibir el rol). Con Freighter se hace en 3 pasos,
// cambiando de cuenta en la extensión entre el paso 2 y el 3.
type Paso = 'inicio' | 'firmaNuevo' | 'firmaActual';

export default function Administrador() {
  const [adminActual, setAdminActual] = useState<string | null>(null);
  const [nuevoAdmin, setNuevoAdmin] = useState('');
  const [tx, setTx] = useState<contract.AssembledTransaction<null> | null>(null);
  const [paso, setPaso] = useState<Paso>('inicio');
  const [cargando, setCargando] = useState(false); const [exito, setExito] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);

  const consultarAdmin = () =>
    leer(obtenerContratoDeLectura().get_admin()).then(setAdminActual).catch((err) => setError(mensajeDeError(err)));

  useEffect(() => { consultarAdmin(); }, []);

  const reiniciar = () => { setTx(null); setPaso('inicio'); };

  // Paso 1: el admin actual prepara (simula) la transacción
  const prepararTransferencia = async (e: React.FormEvent) => {
    e.preventDefault(); setExito(null); setError(null);
    const destino = nuevoAdmin.trim();
    if (!/^G[A-Z2-7]{55}$/.test(destino)) { setError('Ingrese una dirección Stellar válida (empieza con G, 56 caracteres).'); return; }
    if (destino === adminActual) { setError('La dirección ingresada ya es el admin actual.'); return; }
    setCargando(true);
    try {
      const { contrato, direccion } = await obtenerContratoDeEscritura();
      if (direccion !== adminActual) throw new Error('Conecte en Freighter la cuenta del admin actual para preparar la transferencia.');
      const preparada = await contrato.set_admin({ new_admin: destino });
      setTx(preparada);
      setPaso('firmaNuevo');
    } catch (err) { setError(mensajeDeError(err)); } finally { setCargando(false); }
  };

  // Paso 2: el nuevo admin firma su autorización
  const firmarComoNuevoAdmin = async () => {
    if (!tx) return;
    setError(null); setCargando(true);
    try {
      const direccion = await conectarWallet();
      if (direccion !== nuevoAdmin.trim()) throw new Error('Cambie la cuenta en Freighter a la del NUEVO admin.');
      await tx.signAuthEntries({ address: direccion, signAuthEntry: firmaDeAutorizacion(direccion) });
      setPaso('firmaActual');
    } catch (err) { setError(mensajeDeError(err)); } finally { setCargando(false); }
  };

  // Paso 3: el admin actual firma y envía la transacción
  const firmarYEnviar = async () => {
    if (!tx) return;
    setError(null); setCargando(true);
    try {
      const direccion = await conectarWallet();
      if (direccion !== adminActual) throw new Error('Vuelva a cambiar la cuenta en Freighter a la del admin ACTUAL.');
      await tx.signAndSend();
      setExito(`El rol de admin fue transferido a ${nuevoAdmin.trim()}.`);
      setNuevoAdmin(''); reiniciar();
      await consultarAdmin();
    } catch (err) { setError(mensajeDeError(err)); } finally { setCargando(false); }
  };

  return (
    <PlantillaFormulario titulo="Administrador del Contrato" icono="🛡️" mensajeExito={exito} mensajeError={error}>
      <div className="resultadoBox">
        <p><strong>Admin actual:</strong> <span className="valorLargo">{adminActual ?? '...'}</span></p>
      </div>

      {paso === 'inicio' && (
        <form onSubmit={prepararTransferencia} className="formGrid">
          <label className="campo"><span>Dirección del nuevo admin</span><input type="text" value={nuevoAdmin} onChange={(e) => setNuevoAdmin(e.target.value)} placeholder="G..." required className="inputField" /></label>
          <button type="submit" disabled={cargando} className="btnUpdate">{cargando ? 'Preparando...' : '1. Preparar transferencia (admin actual)'}</button>
        </form>
      )}

      {paso === 'firmaNuevo' && (
        <div className="formGrid">
          <p>Cambie la cuenta en Freighter a la del <strong>nuevo admin</strong> y firme la autorización.</p>
          <button type="button" onClick={firmarComoNuevoAdmin} disabled={cargando} className="btnUpdate">{cargando ? 'Firmando...' : '2. Firmar como nuevo admin'}</button>
          <button type="button" onClick={reiniciar} disabled={cargando} className="btnSearch">Cancelar</button>
        </div>
      )}

      {paso === 'firmaActual' && (
        <div className="formGrid">
          <p>Vuelva a cambiar la cuenta en Freighter a la del <strong>admin actual</strong> para firmar y enviar.</p>
          <button type="button" onClick={firmarYEnviar} disabled={cargando} className="btnUpdate">{cargando ? 'Enviando...' : '3. Firmar y enviar (admin actual)'}</button>
          <button type="button" onClick={reiniciar} disabled={cargando} className="btnSearch">Cancelar</button>
        </div>
      )}
    </PlantillaFormulario>
  );
}
