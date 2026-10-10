'use client';
import { useEffect, useState } from 'react';
import {
  obtenerContratoDeLectura, obtenerContratoDeEscritura, leer, enviar, mensajeDeError, formatearBs, bsACentavos,
} from '../../../lib/web3';
import PlantillaFormulario from '../../../components/PlantillaFormulario';
import '../../../components/PlantillaFormulario.css';

export default function PrecioGasolina() {
  const [precioActual, setPrecioActual] = useState<bigint | null>(null);
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [cargando, setCargando] = useState(false); const [exito, setExito] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);

  const consultarPrecio = () =>
    leer(obtenerContratoDeLectura().get_gasoline_price()).then(setPrecioActual).catch(() => setPrecioActual(null));

  useEffect(() => { consultarPrecio(); }, []);

  const manejarActualizacion = async (e: React.FormEvent) => {
    e.preventDefault(); setExito(null); setError(null);
    const centavos = bsACentavos(nuevoPrecio);
    if (centavos === null || centavos <= BigInt(0)) { setError('Ingrese un precio válido mayor a cero (ej. 3.74).'); return; }
    setCargando(true);
    try {
      // set_gasoline_price solo lo puede ejecutar el admin del contrato.
      const { contrato } = await obtenerContratoDeEscritura();
      await enviar(contrato.set_gasoline_price({ price: centavos }));
      setExito(`Precio actualizado a ${formatearBs(centavos)} por litro.`);
      setNuevoPrecio('');
      await consultarPrecio();
    } catch (err) { setError(mensajeDeError(err)); } finally { setCargando(false); }
  };

  return (
    <PlantillaFormulario titulo="Precio de la Gasolina" icono="💲" mensajeExito={exito} mensajeError={error}>
      <div className="resultadoBox">
        <p><strong>Precio vigente por litro:</strong> {precioActual !== null ? formatearBs(precioActual) : 'Aún no definido'}</p>
      </div>
      <form onSubmit={manejarActualizacion} className="formGrid">
        <input type="text" inputMode="decimal" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} placeholder="Nuevo precio por litro en Bs (ej. 3.74)" required className="inputField" />
        <button type="submit" disabled={cargando} className="btnUpdate">{cargando ? 'Actualizando...' : 'Cambiar Precio'}</button>
      </form>
    </PlantillaFormulario>
  );
}
