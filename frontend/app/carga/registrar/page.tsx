'use client';
import { useEffect, useState } from 'react';
import {
  obtenerContratoDeLectura, obtenerContratoDeEscritura, leer, enviar, mensajeDeError, formatearBs,
} from '../../../lib/web3';
import PlantillaFormulario from '../../../components/PlantillaFormulario';
import '../../../components/PlantillaFormulario.css';

export default function RegistrarCarga() {
  const [placa, setPlaca] = useState(''); const [ci, setCi] = useState(''); const [litros, setLitros] = useState('');
  const [precio, setPrecio] = useState<bigint | null>(null);
  const [cargando, setCargando] = useState(false); const [exito, setExito] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);

  // Precio vigente por litro, para mostrar el total estimado antes de registrar
  useEffect(() => {
    leer(obtenerContratoDeLectura().get_gasoline_price()).then(setPrecio).catch(() => setPrecio(null));
  }, []);

  const litrosNumero = /^\d+$/.test(litros) ? Number(litros) : 0;

  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault(); setExito(null); setError(null);
    if (litrosNumero <= 0) { setError('Los litros deben ser un número entero mayor a cero.'); return; }
    setCargando(true);
    try {
      // register_purchase solo lo puede ejecutar el admin del contrato.
      const { contrato } = await obtenerContratoDeEscritura();
      const id = await enviar(contrato.register_purchase({ plate: placa.trim(), identity_card: ci.trim(), liters: litrosNumero }));
      setExito(`Carga N° ${id} registrada: ${litrosNumero} L para la placa ${placa}.`);
      setPlaca(''); setCi(''); setLitros('');
    } catch (err) { setError(mensajeDeError(err)); } finally { setCargando(false); }
  };

  return (
    <PlantillaFormulario titulo="Registrar Carga de Gasolina" icono="⛽" mensajeExito={exito} mensajeError={error}>
      <form onSubmit={manejarRegistro} className="formGrid">
        <input type="text" value={placa} onChange={(e) => setPlaca(e.target.value)} placeholder="Placa" required className="inputField" />
        <input type="text" value={ci} onChange={(e) => setCi(e.target.value)} placeholder="CI del comprador" required className="inputField" />
        <input type="number" min="1" step="1" value={litros} onChange={(e) => setLitros(e.target.value)} placeholder="Litros" required className="inputField" />
        <div className="resultadoBox">
          <p><strong>Precio por litro:</strong> {precio !== null ? formatearBs(precio) : 'No definido'}</p>
          {precio !== null && litrosNumero > 0 && (
            <p><strong>Total estimado:</strong> {formatearBs(precio * BigInt(litrosNumero))}</p>
          )}
        </div>
        <button type="submit" disabled={cargando} className="btnSubmit">{cargando ? 'Registrando...' : 'Registrar Carga'}</button>
      </form>
    </PlantillaFormulario>
  );
}
