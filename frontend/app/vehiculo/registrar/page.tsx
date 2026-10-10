'use client';
import { useState } from 'react';
import { obtenerContratoDeEscritura, enviar, mensajeDeError } from '../../../lib/web3';
import PlantillaFormulario from '../../../components/PlantillaFormulario';
import '../../../components/PlantillaFormulario.css';

export default function RegistrarVehiculo() {
  const [placa, setPlaca] = useState(''); const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState(''); const [anio, setAnio] = useState(''); const [color, setColor] = useState('');
  const [cargando, setCargando] = useState(false); const [exito, setExito] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);

  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true); setExito(null); setError(null);
    try {
      const { contrato, direccion } = await obtenerContratoDeEscritura();
      await enviar(contrato.register_vehicle({
        register_by: direccion,
        plate: placa, brand: marca, model: modelo, year: Number(anio), color,
      }));
      setExito(`Vehículo ${placa} registrado.`);
      setPlaca(''); setMarca(''); setModelo(''); setAnio(''); setColor('');
    } catch (err) { setError(mensajeDeError(err)); } finally { setCargando(false); }
  };

  return (
    <PlantillaFormulario titulo="Registrar Nuevo Vehículo" icono="🚗" mensajeExito={exito} mensajeError={error}>
      <form onSubmit={manejarRegistro} className="formGrid">
        <label className="campo"><span>Placa</span><input type="text" value={placa} onChange={(e) => setPlaca(e.target.value)} required className="inputField" /></label>
        <label className="campo"><span>Marca</span><input type="text" value={marca} onChange={(e) => setMarca(e.target.value)} required className="inputField" /></label>
        <label className="campo"><span>Modelo</span><input type="text" value={modelo} onChange={(e) => setModelo(e.target.value)} required className="inputField" /></label>
        <label className="campo"><span>Año</span><input type="number" value={anio} onChange={(e) => setAnio(e.target.value)} required className="inputField" /></label>
        <label className="campo"><span>Color</span><input type="text" value={color} onChange={(e) => setColor(e.target.value)} required className="inputField" /></label>
        <button type="submit" disabled={cargando} className="btnSubmit">{cargando ? 'Registrando...' : 'Guardar'}</button>
      </form>
    </PlantillaFormulario>
  );
}
