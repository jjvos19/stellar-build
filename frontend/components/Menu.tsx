'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, ChevronDown, Lock, Menu as IconoMenu, X, Fuel } from 'lucide-react';
import { GRUPOS_MENU, buscarRuta } from '../lib/navegacion';
import { CONTRATO_ID, NOMBRE_RED } from '../lib/web3';
import './Menu.css';

export default function Menu() {
  const pathname = usePathname();
  const [abiertoMovil, setAbiertoMovil] = useState(false);
  // Grupos abiertos/cerrados por el usuario. Si no tocó un grupo, se abre solo el de la página actual.
  const [estadoGrupos, setEstadoGrupos] = useState<Record<string, boolean>>({});
  const grupoActivo = buscarRuta(pathname)?.grupo.id;

  const estaAbierto = (id: string) => estadoGrupos[id] ?? id === grupoActivo;
  const alternarGrupo = (id: string) => setEstadoGrupos((prev) => ({ ...prev, [id]: !estaAbierto(id) }));
  const cerrarMovil = () => setAbiertoMovil(false);

  // Cerrar el menú móvil con la tecla Escape
  useEffect(() => {
    if (!abiertoMovil) return;
    const alPresionar = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbiertoMovil(false); };
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [abiertoMovil]);

  return (
    <>
      {/* Barra superior (solo en pantallas pequeñas) */}
      <header className="barraMovil">
        <button type="button" className="botonIcono" onClick={() => setAbiertoMovil(true)} aria-label="Abrir menú" aria-expanded={abiertoMovil} aria-controls="menu-lateral">
          <IconoMenu size={22} />
        </button>
        <Link href="/" className="marcaCompacta" onClick={cerrarMovil}>
          <Fuel size={18} /> <span>Gasolina en Bidón</span>
        </Link>
      </header>

      {abiertoMovil && <div className="velo" onClick={cerrarMovil} aria-hidden="true" />}

      <aside id="menu-lateral" className={`menuLateral ${abiertoMovil ? 'abierto' : ''}`} aria-label="Menú principal">
        <div className="franjaBandera" aria-hidden="true"><span /><span /><span /></div>

        <div className="menuCabecera">
          <Link href="/" className="marca" onClick={cerrarMovil}>
            <span className="marcaIcono"><Fuel size={22} /></span>
            <span>
              <span className="marcaNombre">Gasolina en Bidón</span>
              <span className="marcaSub">Sistema de control · Bolivia</span>
            </span>
          </Link>
          <button type="button" className="botonIcono soloMovil" onClick={cerrarMovil} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        <nav className="menuNav">
          <Link href="/" className={`menuEnlace ${pathname === '/' ? 'activo' : ''}`} aria-current={pathname === '/' ? 'page' : undefined} onClick={cerrarMovil}>
            <House size={18} /> <span>Inicio</span>
          </Link>

          {GRUPOS_MENU.map((grupo) => {
            const abierto = estaAbierto(grupo.id);
            const IconoGrupo = grupo.icono;
            return (
              <div key={grupo.id} className={`menuGrupo color-${grupo.color}`}>
                <button type="button" className={`menuGrupoBoton ${grupo.id === grupoActivo ? 'contieneActivo' : ''}`}
                  onClick={() => alternarGrupo(grupo.id)} aria-expanded={abierto} aria-controls={`grupo-${grupo.id}`}>
                  <span className="menuGrupoIcono"><IconoGrupo size={16} /></span>
                  <span className="menuGrupoNombre">{grupo.etiqueta}</span>
                  <ChevronDown size={16} className={`chevron ${abierto ? 'girado' : ''}`} />
                </button>
                {abierto && (
                  <ul id={`grupo-${grupo.id}`} className="menuLista">
                    {grupo.items.map((item) => {
                      const activo = pathname === item.href;
                      const IconoItem = item.icono;
                      return (
                        <li key={item.href}>
                          <Link href={item.href} className={`menuEnlace sub ${activo ? 'activo' : ''}`} aria-current={activo ? 'page' : undefined} onClick={cerrarMovil}>
                            <IconoItem size={16} /> <span>{item.etiqueta}</span>
                            {item.admin && <Lock size={13} className="candado" aria-label="Solo admin" />}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        <footer className="menuPie">
          <span className="chipRed"><span className="puntoVivo" aria-hidden="true" /> {NOMBRE_RED}</span>
          <span className="contratoCorto" title={CONTRATO_ID}>{CONTRATO_ID.slice(0, 6)}…{CONTRATO_ID.slice(-6)}</span>
          <span className="leyenda"><Lock size={12} /> requiere firma del admin</span>
        </footer>
      </aside>
    </>
  );
}
