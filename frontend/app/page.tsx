import Link from "next/link";
import { ArrowRight, Lock, Wallet, ShieldCheck, Zap } from "lucide-react";
import { GRUPOS_MENU } from "../lib/navegacion";
import "./inicio.css";

export default function Home() {
  return (
    <main className="inicio">
      <section className="heroe">
        <div className="franjaHeroe" aria-hidden="true" />
        <p className="heroeEtiqueta"><Zap size={14} /> Contrato inteligente en Stellar</p>
        <h1 className="heroeTitulo">
          Control de venta de <span className="resaltado">gasolina en bidón</span>
        </h1>
        <p className="heroeTexto">
          Registra vehículos y compradores, vincúlalos y controla cada carga con límites mensuales.
          Cada operación queda registrada en la blockchain de forma transparente.
        </p>
        <div className="heroeAcciones">
          <Link href="/carga/registrar" className="btnSubmit">Registrar carga <ArrowRight size={18} /></Link>
          <Link href="/resumen" className="btnSearch">Ver resumen</Link>
        </div>
      </section>

      <section className="pasos" aria-label="Cómo funciona">
        <div className="paso"><span className="pasoNumero">1</span><div><strong>Registra</strong><p>El vehículo y el comprador.</p></div></div>
        <div className="paso"><span className="pasoNumero">2</span><div><strong>Vincula</strong><p>El comprador a la placa (admin).</p></div></div>
        <div className="paso"><span className="pasoNumero">3</span><div><strong>Carga</strong><p>Se valida estado, precio y límite.</p></div></div>
      </section>

      <section className="modulos" aria-label="Módulos">
        {GRUPOS_MENU.map((grupo) => {
          const IconoGrupo = grupo.icono;
          return (
            <article key={grupo.id} className={`modulo color-${grupo.color}`}>
              <header className="moduloCabecera">
                <span className="moduloIcono"><IconoGrupo size={22} /></span>
                <div>
                  <h2>{grupo.etiqueta}</h2>
                  <p>{grupo.descripcion}</p>
                </div>
              </header>
              <ul>
                {grupo.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <span>{item.etiqueta}</span>
                      {item.admin && <Lock size={13} aria-label="Solo admin" className="candadoModulo" />}
                      <ArrowRight size={15} className="flecha" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      <section className="avisos">
        <div className="aviso"><Wallet size={20} /><p>Para registrar necesitas la wallet <strong>Freighter</strong> en la red correcta.</p></div>
        <div className="aviso"><ShieldCheck size={20} /><p>Las opciones con <Lock size={13} /> solo las puede ejecutar el <strong>admin</strong> del contrato.</p></div>
      </section>
    </main>
  );
}
