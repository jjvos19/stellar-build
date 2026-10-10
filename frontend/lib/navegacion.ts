import {
  Car, Search, CirclePlus, RefreshCw, Users, UserPlus, IdCard, Link2, UserCog,
  Fuel, History, ChartColumn, Settings, LayoutDashboard, Coins, Gauge, ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

// Configuración única de la navegación: la usan el menú lateral, la cabecera de
// cada página (migas, descripción, aviso de admin) y las tarjetas de la portada.

export type ColorBandera = 'rojo' | 'amarillo' | 'verde';

export interface ItemMenu {
  href: string;
  etiqueta: string;
  descripcion: string;
  icono: LucideIcon;
  /** La operación requiere la firma del admin del contrato. */
  admin?: boolean;
}

export interface GrupoMenu {
  id: string;
  etiqueta: string;
  descripcion: string;
  icono: LucideIcon;
  color: ColorBandera;
  items: ItemMenu[];
}

export const GRUPOS_MENU: GrupoMenu[] = [
  {
    id: 'vehiculos', etiqueta: 'Vehículos', icono: Car, color: 'rojo',
    descripcion: 'Registro y estado de los vehículos habilitados.',
    items: [
      { href: '/vehiculo/buscar', etiqueta: 'Buscar vehículo', icono: Search,
        descripcion: 'Consulta los datos y el estado de un vehículo por su placa.' },
      { href: '/vehiculo/registrar', etiqueta: 'Registrar vehículo', icono: CirclePlus,
        descripcion: 'Registra un vehículo nuevo. La transacción se firma con tu wallet.' },
      { href: '/vehiculo/actualizar', etiqueta: 'Cambiar estado', icono: RefreshCw, admin: true,
        descripcion: 'Marca un vehículo como válido, bloqueado, robado o no válido.' },
    ],
  },
  {
    id: 'compradores', etiqueta: 'Compradores', icono: Users, color: 'amarillo',
    descripcion: 'Personas autorizadas a comprar gasolina en bidón.',
    items: [
      { href: '/comprador/buscar', etiqueta: 'Buscar comprador', icono: Search,
        descripcion: 'Consulta los datos de un comprador por su número de carnet.' },
      { href: '/comprador/registrar', etiqueta: 'Registrar comprador', icono: UserPlus,
        descripcion: 'Registra un comprador nuevo. La transacción se firma con tu wallet.' },
      { href: '/comprador/actualizar', etiqueta: 'Ficha del comprador', icono: IdCard,
        descripcion: 'Muestra los datos registrados de un comprador. El contrato no permite editarlos.' },
    ],
  },
  {
    id: 'asignaciones', etiqueta: 'Asignaciones', icono: Link2, color: 'verde',
    descripcion: 'Vínculo entre compradores y vehículos.',
    items: [
      { href: '/comprador-vehiculo/buscar', etiqueta: 'Buscar asignación', icono: Search,
        descripcion: 'Verifica si un comprador está vinculado a una placa y con qué estado.' },
      { href: '/comprador-vehiculo/registrar', etiqueta: 'Vincular comprador', icono: Link2, admin: true,
        descripcion: 'Vincula un comprador registrado a un vehículo registrado.' },
      { href: '/comprador-vehiculo/actualizar', etiqueta: 'Estado del vínculo', icono: UserCog, admin: true,
        descripcion: 'Habilita, bloquea o invalida a un comprador para una placa.' },
    ],
  },
  {
    id: 'cargas', etiqueta: 'Cargas', icono: Fuel, color: 'rojo',
    descripcion: 'Ventas de gasolina y consumo mensual.',
    items: [
      { href: '/carga/registrar', etiqueta: 'Registrar carga', icono: Fuel, admin: true,
        descripcion: 'Registra una venta de gasolina validando vehículo, comprador, precio y límite mensual.' },
      { href: '/carga/buscar', etiqueta: 'Buscar carga', icono: Search,
        descripcion: 'Consulta el detalle de una carga por su número.' },
      { href: '/carga/historial', etiqueta: 'Historial por placa', icono: History,
        descripcion: 'Lista todas las cargas de un vehículo, de 10 en 10.' },
      { href: '/carga/litros', etiqueta: 'Litros por mes', icono: ChartColumn,
        descripcion: 'Litros cargados por un vehículo en un mes y cupo disponible.' },
    ],
  },
  {
    id: 'administracion', etiqueta: 'Administración', icono: Settings, color: 'amarillo',
    descripcion: 'Configuración y estado general del contrato.',
    items: [
      { href: '/resumen', etiqueta: 'Resumen', icono: LayoutDashboard,
        descripcion: 'Totales del contrato y configuración vigente.' },
      { href: '/admin/precio', etiqueta: 'Precio por litro', icono: Coins, admin: true,
        descripcion: 'Define el precio de la gasolina que se aplica a las nuevas cargas.' },
      { href: '/admin/limite', etiqueta: 'Límite mensual', icono: Gauge, admin: true,
        descripcion: 'Litros máximos que un vehículo puede cargar por mes (0 = sin límite).' },
      { href: '/admin/administrador', etiqueta: 'Administrador', icono: ShieldCheck, admin: true,
        descripcion: 'Transfiere el rol de admin. Requiere la firma del admin actual y del nuevo.' },
    ],
  },
];

/** Busca el grupo y la opción del menú que corresponden a una ruta. */
export function buscarRuta(pathname: string): { grupo: GrupoMenu; item: ItemMenu } | null {
  for (const grupo of GRUPOS_MENU) {
    const item = grupo.items.find((i) => i.href === pathname);
    if (item) return { grupo, item };
  }
  return null;
}
