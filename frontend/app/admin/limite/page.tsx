'use client';
import { useEffect, useState } from 'react';
import { obtenerContratoDeLectura, obtenerContratoDeEscritura, leer, enviar, mensajeDeError } from '../../../lib/web3';
import PlantillaFormulario from '../../../components/PlantillaFormulario';
import '../../../components/PlantillaFormulario.css';

export default function LimiteMensual() {
  const [limiteActual, setLimiteActual] = useState<number | null>(null);
  const [nuevoLimite, setNuevoLimite] = useState('');
  const [cargando, setCargando] = useState(false); const [exito, setExito] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);

  const consultarLimite = () =>
    leer(obtenerContratoDeLectura().get_monthly_limit()).then(setLimiteActual).catch((err) => setError(mensajeDeError(err)));

  useEffect(() => { consultarLimite(); }, []);

  const manejarActualizacion = async (e: React.FormEvent) => {
    e.preventDefault(); setExito(null); setError(null);
    if (!/^\d+$/.test(nuevoLimite.trim())) { setError('El límite debe ser un número entero de litros (0 = sin límite).'); return; }
    const litros = Number(nuevoLimite.trim());
    setCargando(true);
    try {
      // set_monthly_limit solo lo puede ejecutar el admin del contrato.
      const { contrato } = await obtenerContratoDeEscritura();
      await enviar(contrato.set_monthly_limit({ liters: litros }));
      setExito(litros === 0 ? 'Límite mensual eliminado.' : `Límite mensual actualizado a ${litros} L por vehículo.`);
      setNuevoLimite('');
      await consultarLimite();
    } catch (err) { setError(mensajeDeError(err)); } finally { setCargando(false); }
  };

  return (
    <PlantillaFormulario titulo="Límite Mensual de Litros" icono="📏" mensajeExito={exito} mensajeError={error}>
      <div className="resultadoBox">
        <p><strong>Límite vigente por vehículo:</strong> {limiteActual === null ? '...' : limiteActual === 0 ? 'Sin límite' : `${limiteActual} L por mes`}</p>
      </div>
      <form onSubmit={manejarActualizacion} className="formGrid">
        <label className="campo"><span>Nuevo límite en litros</span><input type="number" min="0" step="1" value={nuevoLimite} onChange={(e) => setNuevoLimite(e.target.value)} placeholder="0 = sin límite" required className="inputField" /></label>
        <button type="submit" disabled={cargando} className="btnUpdate">{cargando ? 'Actualizando...' : 'Cambiar Límite'}</button>
      </form>
    </PlantillaFormulario>
  );
}
