import * as Gasolina from 'buy-jerrycan-gasoline';
import type { contract } from 'buy-jerrycan-gasoline';
import { isConnected, requestAccess, getNetworkDetails, signTransaction, signAuthEntry } from '@stellar/freighter-api';

// Red y contrato: se leen de .env.local; si faltan, se usan los valores
// embebidos en el binding (generado con --network testnet).
const RED = {
  networkPassphrase: process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || Gasolina.networks.testnet.networkPassphrase,
  contractId: process.env.NEXT_PUBLIC_STELLAR_CONTRACT_ID || Gasolina.networks.testnet.contractId,
};
export const NOMBRE_RED = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet';
export const CONTRATO_ID = RED.contractId;
export const RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';

// Re-exporta los tipos y enums del contrato para usarlos en las páginas.
export { StateVehicle, StateBuyer } from 'buy-jerrycan-gasoline';
export type { Buyer, Vehicle, Purchase, BuyerWithState } from 'buy-jerrycan-gasoline';

/** Nombres para mostrar de los estados del contrato. */
export const NOMBRE_ESTADO_VEHICULO: Record<number, string> = {
  [Gasolina.StateVehicle.Valid]: 'Válido',
  [Gasolina.StateVehicle.NotValid]: 'No válido',
  [Gasolina.StateVehicle.Stolen]: 'Robado',
  [Gasolina.StateVehicle.Blocked]: 'Bloqueado',
};
export const NOMBRE_ESTADO_COMPRADOR: Record<number, string> = {
  [Gasolina.StateBuyer.Valid]: 'Válido',
  [Gasolina.StateBuyer.Blocked]: 'Bloqueado',
  [Gasolina.StateBuyer.NoValid]: 'No válido',
};

// ---------------------------------------------------------------------------
// Clientes del contrato
// ---------------------------------------------------------------------------

/** Cliente solo para consultas (simulación). No requiere wallet ni firma. */
export function obtenerContratoDeLectura() {
  return new Gasolina.Client({ ...RED, rpcUrl: RPC_URL });
}

/** Conecta la wallet Freighter y devuelve la dirección (G...) del usuario. */
export async function conectarWallet(): Promise<string> {
  const conexion = await isConnected();
  if (!conexion.isConnected) {
    throw new Error('No se encontró la wallet Freighter. Instala la extensión desde https://freighter.app');
  }

  const acceso = await requestAccess();
  if (acceso.error) throw new Error(acceso.error.message);

  const red = await getNetworkDetails();
  if (red.networkPassphrase !== RED.networkPassphrase) {
    throw new Error(`Freighter está en otra red. Cámbiala a ${NOMBRE_RED}.`);
  }

  return acceso.address;
}

/**
 * Cliente para transacciones que modifican el contrato.
 * Conecta Freighter y devuelve el cliente junto con la dirección que firmará
 * (útil para parámetros como `register_by`).
 */
export async function obtenerContratoDeEscritura() {
  const direccion = await conectarWallet();

  const contrato = new Gasolina.Client({
    ...RED,
    rpcUrl: RPC_URL,
    publicKey: direccion,
    signTransaction: async (xdr: string) => {
      const firmada = await signTransaction(xdr, {
        networkPassphrase: RED.networkPassphrase,
        address: direccion,
      });
      if (firmada.error) throw new Error(firmada.error.message);
      return firmada;
    },
  });

  return { contrato, direccion };
}

/**
 * Firma con Freighter una autorización (auth entry) de una cuenta que no es la
 * que envía la transacción. Ej: set_admin requiere también la firma del nuevo admin.
 * Uso: await tx.signAuthEntries({ address, signAuthEntry: firmaDeAutorizacion(address) })
 */
export function firmaDeAutorizacion(direccion: string) {
  return async (entrada: string) => {
    const firmada = await signAuthEntry(entrada, { networkPassphrase: RED.networkPassphrase, address: direccion });
    if (firmada.error) throw new Error(firmada.error.message);
    if (!firmada.signedAuthEntry) throw new Error('Freighter no devolvió la firma de la autorización.');
    return { signedAuthEntry: firmada.signedAuthEntry, signerAddress: firmada.signerAddress };
  };
}

// ---------------------------------------------------------------------------
// Formatos
// ---------------------------------------------------------------------------

/** Montos del contrato (i128 en centavos) → "Bs 3.74". */
export function formatearBs(centavos: bigint): string {
  const negativo = centavos < BigInt(0);
  const abs = negativo ? -centavos : centavos;
  const enteros = abs / BigInt(100);
  const decimales = (abs % BigInt(100)).toString().padStart(2, '0');
  return `${negativo ? '-' : ''}Bs ${enteros}.${decimales}`;
}

/** "3.74" → 374n (centavos). Devuelve null si el texto no es un monto válido. */
export function bsACentavos(texto: string): bigint | null {
  const m = texto.trim().replace(',', '.').match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!m) return null;
  return BigInt(m[1]) * BigInt(100) + BigInt((m[2] ?? '0').padEnd(2, '0'));
}

/** Timestamp del ledger (segundos UTC) → fecha y hora de Bolivia. */
export function formatearFecha(segundos: bigint): string {
  return new Date(Number(segundos) * 1000).toLocaleString('es-BO', { timeZone: 'America/La_Paz' });
}

/** 202610 → "10/2026". */
export function formatearMes(anioMes: number): string {
  const texto = String(anioMes);
  return `${texto.slice(4)}/${texto.slice(0, 4)}`;
}

/** Mes actual en hora de Bolivia, formato AAAAMM (ej. 202610). */
export function mesActual(): number {
  const [mes, anio] = new Date()
    .toLocaleDateString('es-BO', { timeZone: 'America/La_Paz', month: '2-digit', year: 'numeric' })
    .split('/');
  return Number(anio + mes);
}

// ---------------------------------------------------------------------------
// Ejecución de transacciones
// ---------------------------------------------------------------------------

type ResultadoContrato<T> = contract.Result<T>;
/** Si el método devuelve Result<T>, extrae T; si no, deja el tipo tal cual. */
type Valor<R> = R extends ResultadoContrato<infer T> ? T : R;

function esResult(valor: unknown): valor is ResultadoContrato<unknown> {
  return !!valor && typeof (valor as { isErr?: unknown }).isErr === 'function';
}

function desenvolver<R>(valor: R): Valor<R> {
  if (esResult(valor)) {
    if (valor.isErr()) throw new Error(traducirError(valor.unwrapErr().message));
    return valor.unwrap() as Valor<R>;
  }
  return valor as Valor<R>;
}

/**
 * Devuelve el resultado de una consulta.
 * Ej: const vehiculo = await leer(contrato.find_vehicle({ plate }));
 */
export async function leer<R>(llamada: Promise<contract.AssembledTransaction<R>>): Promise<Valor<R>> {
  const tx = await llamada;
  return desenvolver(tx.result);
}

/**
 * Firma con Freighter, envía la transacción y espera la confirmación.
 * Si la simulación ya indica un error del contrato, no pide la firma.
 * Ej: await enviar(contrato.register_vehicle({ ... }));
 */
export async function enviar<R>(llamada: Promise<contract.AssembledTransaction<R>>): Promise<Valor<R>> {
  const tx = await llamada;
  desenvolver(tx.result);
  const enviada = await tx.signAndSend();
  return desenvolver(enviada.result);
}

// ---------------------------------------------------------------------------
// Errores del contrato
// ---------------------------------------------------------------------------

const MENSAJES_DE_ERROR: Record<string, string> = {
  ExceededMonthlyLimit: 'Se excede el límite mensual de litros.',
  StolenVehicle: 'El vehículo está reportado como robado.',
  NoValidVehicle: 'El vehículo ya no circula.',
  NotExistsBuyer: 'No existe el comprador.',
  PlateExists: 'Ya existe un vehículo con esa placa.',
  PlateNotExists: 'No existe la placa.',
  BuyerExists: 'Ya existe el comprador.',
  BlankIdentityCard: 'El carnet de identidad no puede estar vacío.',
  BuyerVehicleExists: 'El comprador ya está registrado para el vehículo.',
  BuyerVehicleNotExists: 'El comprador no está registrado para el vehículo.',
  StringTooLong: 'Uno de los textos es demasiado largo.',
  InvalidState: 'Estado no permitido.',
  VehicleBlocked: 'El vehículo está bloqueado.',
  BuyerNotAllowed: 'El comprador no está habilitado para el vehículo.',
  PriceNotSet: 'Aún no se definió el precio de la gasolina.',
  InvalidPrice: 'El precio debe ser mayor a cero.',
  InvalidLiters: 'Los litros deben ser mayores a cero.',
  BuyerStateLocked: 'El comprador está en NoValid para el vehículo y no puede cambiar de estado.',
  PurchaseNotExists: 'No existe la carga.',
};

// El SDK devuelve como mensaje el comentario (doc) del error en el contrato,
// ej. '"Existe la placa!!!"'. Este mapa convierte ese texto al nombre (PlateExists).
let nombresPorDoc: Map<string, string> | null = null;

function traducirError(mensaje: string): string {
  if (!nombresPorDoc) {
    nombresPorDoc = new Map(
      obtenerContratoDeLectura().spec.errorCases().map((c) => [c.doc().toString(), c.name().toString()]),
    );
  }
  const nombre = nombresPorDoc.get(mensaje) ?? mensaje;
  return MENSAJES_DE_ERROR[nombre] ?? mensaje.replace(/^"|"$/g, '');
}

/**
 * Convierte cualquier error (del contrato, de Freighter o de red) en un mensaje legible.
 * Úsalo en los catch: setError(mensajeDeError(err))
 */
export function mensajeDeError(err: unknown): string {
  console.error('[web3]', err);
  const texto = err instanceof Error ? err.message : String(err);
  // Errores del contrato que llegan como texto: "Error(Contract, #6)"
  const codigo = texto.match(/Error\(Contract, #(\d+)\)/)?.[1];
  if (codigo) {
    const nombre = Gasolina.Errors[Number(codigo) as keyof typeof Gasolina.Errors]?.message;
    if (nombre) return traducirError(nombre);
  }
  return texto;
}
