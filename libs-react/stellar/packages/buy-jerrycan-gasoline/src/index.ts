import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CC7XIIG5OXBLTKKN455XNWV4IAR6FD6P2GW3VXJQQO5BVSXAVGXF5LHL",
  }
} as const


/**
 * Estructura para el comprador de gasolina.
 */
export interface Buyer {
  /**
 * ID del registro.
 */
id: u64;
  /**
 * Numero de carnet del comprador. Ej. 4569987
 */
identity_card: string;
  /**
 * Apellidos del comprador. Ej. Valencia O.
 */
last_names: string;
  /**
 * Nombres del comprador. Ej. Juan Jose
 */
names: string;
  /**
 * Numero de telefono celular. Ej. 71260680
 */
phonenumber: u64;
  /**
 * Direccion de la persona que registro, no necesariamente es el dueño.
 */
register_by: string;
}

export const Errors = {
  /**
   * errExceededMonthlyLimit: se excede el limite mensual.
   */
  1: {message:"ExceededMonthlyLimit"},
  /**
   * errStolenVehicle: el vehiculo esta robado.
   */
  2: {message:"StolenVehicle"},
  /**
   * errNoValidVehicle: el vehiculo ya no circula.
   */
  3: {message:"NoValidVehicle"},
  /**
   * errNotExistsBuyer / "No existe el comprador!!!"
   */
  4: {message:"NotExistsBuyer"},
  /**
   * "Existe la placa!!!"
   */
  5: {message:"PlateExists"},
  /**
   * "No existe la placa!!!"
   */
  6: {message:"PlateNotExists"},
  /**
   * "Existe el comprador!!!"
   */
  7: {message:"BuyerExists"},
  /**
   * "No debe ser vacio Carnet de identidad"
   */
  8: {message:"BlankIdentityCard"},
  /**
   * "Existe el comprador para el vehiculo!!!"
   */
  9: {message:"BuyerVehicleExists"},
  /**
   * "No existe el comprador para el vehiculo!!!"
   */
  10: {message:"BuyerVehicleNotExists"},
  /**
   * Cadena demasiado larga (ver string_utils::MAX_STRING_LEN).
   */
  11: {message:"StringTooLong"},
  /**
   * Estado no permitido (NotUse).
   */
  12: {message:"InvalidState"},
  /**
   * El vehiculo esta bloqueado.
   */
  13: {message:"VehicleBlocked"},
  /**
   * El comprador no esta habilitado (Blocked / NoValid) para el vehiculo.
   */
  14: {message:"BuyerNotAllowed"},
  /**
   * Aun no se definio el precio de la gasolina.
   */
  15: {message:"PriceNotSet"},
  /**
   * El precio debe ser mayor a cero.
   */
  16: {message:"InvalidPrice"},
  /**
   * Los litros deben ser mayores a cero.
   */
  17: {message:"InvalidLiters"},
  /**
   * El comprador esta en NoValid para el vehiculo y no puede cambiar de estado.
   */
  18: {message:"BuyerStateLocked"},
  /**
   * No existe la carga.
   */
  19: {message:"PurchaseNotExists"}
}

export type DataKey = {tag: "Admin", values: void} | {tag: "BuyersCounter", values: void} | {tag: "VehiclesCounter", values: void} | {tag: "PurchasesCounter", values: void} | {tag: "GasolinePrice", values: void} | {tag: "MonthlyLimit", values: void} | {tag: "Vehicle", values: readonly [string]} | {tag: "Buyer", values: readonly [u64]} | {tag: "BuyerIdByCard", values: readonly [string]} | {tag: "VehicleBuyer", values: readonly [string, u64]} | {tag: "Purchase", values: readonly [u64]} | {tag: "VehiclePurchaseCount", values: readonly [string]} | {tag: "VehiclePurchase", values: readonly [string, u64]} | {tag: "MonthlyLiters", values: readonly [string, u32]};


/**
 * Estructura para registrar el vehiculo.
 */
export interface Vehicle {
  /**
 * Marca del vehiculo. Ej. Suzuki
 */
brand: string;
  /**
 * Color del vehiculo. Ej. Plateado
 */
color: string;
  /**
 * Identificador del vehiculo.
 */
id: u64;
  /**
 * Modelo del vehiculo. Ej. Grand Vitara
 */
model: string;
  /**
 * Placa del vehiculo. Ej. 4816STF
 */
plate: string;
  /**
 * Direccion de la persona que registro, no necesariamente es el dueño.
 */
register_by: string;
  /**
 * Estado del vehiculo.
 */
state: StateVehicle;
  /**
 * Año del vehiculo. Ej. 2020
 */
year: u32;
}


/**
 * Registro de una carga de gasolina.
 */
export interface Purchase {
  /**
 * Identificador del comprador.
 */
buyer_id: u64;
  /**
 * Identificador de la carga.
 */
id: u64;
  /**
 * Cantidad de litros.
 */
liters: u32;
  /**
 * Placa del vehiculo.
 */
plate: string;
  /**
 * Precio pagado = litros * precio por litro (en centavos).
 */
price: i128;
  /**
 * Precio por litro vigente al momento de la carga (en centavos).
 */
price_per_liter: i128;
  /**
 * Fecha de venta (timestamp del ledger, segundos UTC).
 */
times: u64;
  /**
 * Mes de la carga en hora de Bolivia, formato AAAAMM. Ej. 202610
 */
year_month: u32;
}

/**
 * Estado del comprador.
 */
export enum StateBuyer {
  NotUse = 0,
  Valid = 1,
  Blocked = 2,
  NoValid = 3,
}


/**
 * Estado del vehiculo.
 */
export enum StateVehicle {
  NotUse = 0,
  Valid = 1,
  NotValid = 2,
  Stolen = 3,
  Blocked = 4,
}


/**
 * Id del comprador y su estado para un vehiculo.
 */
export interface BuyerWithState {
  /**
 * Identificador del comprador.
 */
buyer_id: u64;
  /**
 * Estado del comprador.
 */
state: StateBuyer;
}






export interface Client {
  /**
   * Construct and simulate a get_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Devuelve la direccion del administrador.
   */
  get_admin: (options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a set_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Transfiere el rol de administrador. Requiere la firma del admin actual
   * y la del nuevo admin (evita transferir a una direccion equivocada).
   */
  set_admin: ({new_admin}: {new_admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a find_buyer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Busca al comprador por el numero de carnet.
   */
  find_buyer: ({identity_card}: {identity_card: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Buyer>>>

  /**
   * Construct and simulate a find_vehicle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Busca un vehiculo por el numero de placa.
   */
  find_vehicle: ({plate}: {plate: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Vehicle>>>

  /**
   * Construct and simulate a get_purchase transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Obtiene una carga por su id.
   */
  get_purchase: ({id}: {id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Purchase>>>

  /**
   * Construct and simulate a buyers_counter transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Contador de compradores (buyersCounter).
   */
  buyers_counter: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a register_buyer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Registra un comprador. `register_by` (equivalente a `msg.sender`) debe firmar.
   */
  register_buyer: ({register_by, names, last_names, identity_card, phonenumber}: {register_by: string, names: string, last_names: string, identity_card: string, phonenumber: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<boolean>>>

  /**
   * Construct and simulate a get_month_liters transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Litros cargados por el vehiculo en un mes dado (AAAAMM, ej. 202610).
   */
  get_month_liters: ({plate, year_month}: {plate: string, year_month: u32}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a register_vehicle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Registra el vehiculo. `register_by` (equivalente a `msg.sender`) debe firmar.
   */
  register_vehicle: ({register_by, plate, brand, model, year, color}: {register_by: string, plate: string, brand: string, model: string, year: u32, color: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<boolean>>>

  /**
   * Construct and simulate a vehicles_counter transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Contador de vehiculos (vehiclesCounter).
   */
  vehicles_counter: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a get_monthly_limit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Limite mensual de litros por vehiculo (0 = sin limite).
   */
  get_monthly_limit: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_state_vehicle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Obtiene el estado del vehiculo.
   */
  get_state_vehicle: ({plate}: {plate: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<StateVehicle>>>

  /**
   * Construct and simulate a purchases_counter transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Contador de cargas de gasolina.
   */
  purchases_counter: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a register_purchase transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Registra una carga de gasolina para un vehiculo. Solo admin.
   * 
   * Valida que: el vehiculo exista y este Valid; el comprador este habilitado
   * (Valid) para el vehiculo; exista un precio; y no se exceda el limite mensual.
   * El precio se calcula con el precio vigente. Devuelve el id de la carga.
   */
  register_purchase: ({plate, identity_card, liters}: {plate: string, identity_card: string, liters: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u64>>>

  /**
   * Construct and simulate a set_monthly_limit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Define el limite de litros por vehiculo por mes. 0 = sin limite. Solo admin.
   */
  set_monthly_limit: ({liters}: {liters: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_gasoline_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Precio vigente de la gasolina por litro (centavos).
   */
  get_gasoline_price: (options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a set_gasoline_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Define el precio de la gasolina por litro, en centavos. Ej. 374 = Bs 3,74. Solo admin.
   */
  set_gasoline_price: ({price}: {price: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a change_state_vehicle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Cambia el estado de un vehiculo. Solo admin.
   * Si el vehiculo esta en NotValid devuelve Error::NoValidVehicle.
   */
  change_state_vehicle: ({plate, state}: {plate: string, state: StateVehicle}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Vehicle>>>

  /**
   * Construct and simulate a find_buyer_by_vehicle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Busca el comprador asignado al vehiculo.
   */
  find_buyer_by_vehicle: ({plate, identity_card}: {plate: string, identity_card: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Buyer>>>

  /**
   * Construct and simulate a list_vehicle_purchases transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Lista las cargas de un vehiculo, paginado (maximo 50 por llamada).
   */
  list_vehicle_purchases: ({plate, start, limit}: {plate: string, start: u64, limit: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Array<Purchase>>>

  /**
   * Construct and simulate a get_state_buyer_vehicle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Estado del comprador para un vehiculo.
   */
  get_state_buyer_vehicle: ({plate, identity_card}: {plate: string, identity_card: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<StateBuyer>>>

  /**
   * Construct and simulate a get_current_month_liters transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Litros cargados por el vehiculo en el mes actual (hora de Bolivia).
   */
  get_current_month_liters: ({plate}: {plate: string}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a register_buyer_to_vehicle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Habilita a un comprador para comprar para un vehiculo. Solo admin.
   */
  register_buyer_to_vehicle: ({plate, identity_card}: {plate: string, identity_card: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<boolean>>>

  /**
   * Construct and simulate a change_state_buyer_vehicle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Cambia el estado de un comprador para un vehiculo. Solo admin.
   * Si el comprador esta en NoValid devuelve Error::BuyerStateLocked.
   */
  change_state_buyer_vehicle: ({plate, identity_card, state}: {plate: string, identity_card: string, state: StateBuyer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<BuyerWithState>>>

  /**
   * Construct and simulate a get_vehicle_purchases_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Cantidad de cargas registradas para un vehiculo.
   */
  get_vehicle_purchases_count: ({plate}: {plate: string}, options?: MethodOptions) => Promise<AssembledTransaction<u64>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {admin}: {admin: string},
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy({admin}, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAClFc3RydWN0dXJhIHBhcmEgZWwgY29tcHJhZG9yIGRlIGdhc29saW5hLgAAAAAAAAAAAAAFQnV5ZXIAAAAAAAAGAAAAEElEIGRlbCByZWdpc3Ryby4AAAACaWQAAAAAAAYAAAArTnVtZXJvIGRlIGNhcm5ldCBkZWwgY29tcHJhZG9yLiBFai4gNDU2OTk4NwAAAAANaWRlbnRpdHlfY2FyZAAAAAAAABAAAAAoQXBlbGxpZG9zIGRlbCBjb21wcmFkb3IuIEVqLiBWYWxlbmNpYSBPLgAAAApsYXN0X25hbWVzAAAAAAAQAAAAJE5vbWJyZXMgZGVsIGNvbXByYWRvci4gRWouIEp1YW4gSm9zZQAAAAVuYW1lcwAAAAAAABAAAAAoTnVtZXJvIGRlIHRlbGVmb25vIGNlbHVsYXIuIEVqLiA3MTI2MDY4MAAAAAtwaG9uZW51bWJlcgAAAAAGAAAARURpcmVjY2lvbiBkZSBsYSBwZXJzb25hIHF1ZSByZWdpc3Rybywgbm8gbmVjZXNhcmlhbWVudGUgZXMgZWwgZHVlw7FvLgAAAAAAAAtyZWdpc3Rlcl9ieQAAAAAT",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAAEwAAADVlcnJFeGNlZWRlZE1vbnRobHlMaW1pdDogc2UgZXhjZWRlIGVsIGxpbWl0ZSBtZW5zdWFsLgAAAAAAABRFeGNlZWRlZE1vbnRobHlMaW1pdAAAAAEAAAAqZXJyU3RvbGVuVmVoaWNsZTogZWwgdmVoaWN1bG8gZXN0YSByb2JhZG8uAAAAAAANU3RvbGVuVmVoaWNsZQAAAAAAAAIAAAAtZXJyTm9WYWxpZFZlaGljbGU6IGVsIHZlaGljdWxvIHlhIG5vIGNpcmN1bGEuAAAAAAAADk5vVmFsaWRWZWhpY2xlAAAAAAADAAAAL2Vyck5vdEV4aXN0c0J1eWVyIC8gIk5vIGV4aXN0ZSBlbCBjb21wcmFkb3IhISEiAAAAAA5Ob3RFeGlzdHNCdXllcgAAAAAABAAAABQiRXhpc3RlIGxhIHBsYWNhISEhIgAAAAtQbGF0ZUV4aXN0cwAAAAAFAAAAFyJObyBleGlzdGUgbGEgcGxhY2EhISEiAAAAAA5QbGF0ZU5vdEV4aXN0cwAAAAAABgAAABgiRXhpc3RlIGVsIGNvbXByYWRvciEhISIAAAALQnV5ZXJFeGlzdHMAAAAABwAAACciTm8gZGViZSBzZXIgdmFjaW8gQ2FybmV0IGRlIGlkZW50aWRhZCIAAAAAEUJsYW5rSWRlbnRpdHlDYXJkAAAAAAAACAAAACkiRXhpc3RlIGVsIGNvbXByYWRvciBwYXJhIGVsIHZlaGljdWxvISEhIgAAAAAAABJCdXllclZlaGljbGVFeGlzdHMAAAAAAAkAAAAsIk5vIGV4aXN0ZSBlbCBjb21wcmFkb3IgcGFyYSBlbCB2ZWhpY3VsbyEhISIAAAAVQnV5ZXJWZWhpY2xlTm90RXhpc3RzAAAAAAAACgAAADpDYWRlbmEgZGVtYXNpYWRvIGxhcmdhICh2ZXIgc3RyaW5nX3V0aWxzOjpNQVhfU1RSSU5HX0xFTikuAAAAAAANU3RyaW5nVG9vTG9uZwAAAAAAAAsAAAAdRXN0YWRvIG5vIHBlcm1pdGlkbyAoTm90VXNlKS4AAAAAAAAMSW52YWxpZFN0YXRlAAAADAAAABtFbCB2ZWhpY3VsbyBlc3RhIGJsb3F1ZWFkby4AAAAADlZlaGljbGVCbG9ja2VkAAAAAAANAAAARUVsIGNvbXByYWRvciBubyBlc3RhIGhhYmlsaXRhZG8gKEJsb2NrZWQgLyBOb1ZhbGlkKSBwYXJhIGVsIHZlaGljdWxvLgAAAAAAAA9CdXllck5vdEFsbG93ZWQAAAAADgAAACtBdW4gbm8gc2UgZGVmaW5pbyBlbCBwcmVjaW8gZGUgbGEgZ2Fzb2xpbmEuAAAAAAtQcmljZU5vdFNldAAAAAAPAAAAIEVsIHByZWNpbyBkZWJlIHNlciBtYXlvciBhIGNlcm8uAAAADEludmFsaWRQcmljZQAAABAAAAAkTG9zIGxpdHJvcyBkZWJlbiBzZXIgbWF5b3JlcyBhIGNlcm8uAAAADUludmFsaWRMaXRlcnMAAAAAAAARAAAAS0VsIGNvbXByYWRvciBlc3RhIGVuIE5vVmFsaWQgcGFyYSBlbCB2ZWhpY3VsbyB5IG5vIHB1ZWRlIGNhbWJpYXIgZGUgZXN0YWRvLgAAAAAQQnV5ZXJTdGF0ZUxvY2tlZAAAABIAAAATTm8gZXhpc3RlIGxhIGNhcmdhLgAAAAARUHVyY2hhc2VOb3RFeGlzdHMAAAAAAAAT",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAADgAAAAAAAAAcRGlyZWNjaW9uIGRlbCBhZG1pbmlzdHJhZG9yLgAAAAVBZG1pbgAAAAAAAAAAAAAYQ29udGFkb3IgZGUgY29tcHJhZG9yZXMuAAAADUJ1eWVyc0NvdW50ZXIAAAAAAAAAAAAAFkNvbnRhZG9yIGRlIHZlaGljdWxvcy4AAAAAAA9WZWhpY2xlc0NvdW50ZXIAAAAAAAAAABNDb250YWRvciBkZSBjYXJnYXMuAAAAABBQdXJjaGFzZXNDb3VudGVyAAAAAAAAACtQcmVjaW8gZGUgbGEgZ2Fzb2xpbmEgcG9yIGxpdHJvIChjZW50YXZvcykuAAAAAA1HYXNvbGluZVByaWNlAAAAAAAAAAAAADdMaW1pdGUgbWVuc3VhbCBkZSBsaXRyb3MgcG9yIHZlaGljdWxvICgwID0gc2luIGxpbWl0ZSkuAAAAAAxNb250aGx5TGltaXQAAAABAAAAEHBsYWNhID0+IFZlaGljbGUAAAAHVmVoaWNsZQAAAAABAAAAEAAAAAEAAAALaWQgPT4gQnV5ZXIAAAAABUJ1eWVyAAAAAAAAAQAAAAYAAAABAAAADGNhcm5ldCA9PiBpZAAAAA1CdXllcklkQnlDYXJkAAAAAAAAAQAAABAAAAABAAAAJyhwbGFjYSwgaWQgY29tcHJhZG9yKSA9PiBCdXllcldpdGhTdGF0ZQAAAAAMVmVoaWNsZUJ1eWVyAAAAAgAAABAAAAAGAAAAAQAAAA5pZCA9PiBQdXJjaGFzZQAAAAAACFB1cmNoYXNlAAAAAQAAAAYAAAABAAAAKHBsYWNhID0+IGNhbnRpZGFkIGRlIGNhcmdhcyBkZWwgdmVoaWN1bG8AAAAUVmVoaWNsZVB1cmNoYXNlQ291bnQAAAABAAAAEAAAAAEAAAAhKHBsYWNhLCBpbmRpY2UpID0+IGlkIGRlIGxhIGNhcmdhAAAAAAAAD1ZlaGljbGVQdXJjaGFzZQAAAAACAAAAEAAAAAYAAAABAAAALShwbGFjYSwgQUFBQU1NKSA9PiBsaXRyb3MgY2FyZ2Fkb3MgZW4gZXNlIG1lcwAAAAAAAA1Nb250aGx5TGl0ZXJzAAAAAAAAAgAAABAAAAAE",
        "AAAAAQAAACZFc3RydWN0dXJhIHBhcmEgcmVnaXN0cmFyIGVsIHZlaGljdWxvLgAAAAAAAAAAAAdWZWhpY2xlAAAAAAgAAAAeTWFyY2EgZGVsIHZlaGljdWxvLiBFai4gU3V6dWtpAAAAAAAFYnJhbmQAAAAAAAAQAAAAIENvbG9yIGRlbCB2ZWhpY3Vsby4gRWouIFBsYXRlYWRvAAAABWNvbG9yAAAAAAAAEAAAABtJZGVudGlmaWNhZG9yIGRlbCB2ZWhpY3Vsby4AAAAAAmlkAAAAAAAGAAAAJU1vZGVsbyBkZWwgdmVoaWN1bG8uIEVqLiBHcmFuZCBWaXRhcmEAAAAAAAAFbW9kZWwAAAAAAAAQAAAAH1BsYWNhIGRlbCB2ZWhpY3Vsby4gRWouIDQ4MTZTVEYAAAAABXBsYXRlAAAAAAAAEAAAAEVEaXJlY2Npb24gZGUgbGEgcGVyc29uYSBxdWUgcmVnaXN0cm8sIG5vIG5lY2VzYXJpYW1lbnRlIGVzIGVsIGR1ZcOxby4AAAAAAAALcmVnaXN0ZXJfYnkAAAAAEwAAABRFc3RhZG8gZGVsIHZlaGljdWxvLgAAAAVzdGF0ZQAAAAAAB9AAAAAMU3RhdGVWZWhpY2xlAAAAG0HDsW8gZGVsIHZlaGljdWxvLiBFai4gMjAyMAAAAAAEeWVhcgAAAAQ=",
        "AAAAAQAAACJSZWdpc3RybyBkZSB1bmEgY2FyZ2EgZGUgZ2Fzb2xpbmEuAAAAAAAAAAAACFB1cmNoYXNlAAAACAAAABxJZGVudGlmaWNhZG9yIGRlbCBjb21wcmFkb3IuAAAACGJ1eWVyX2lkAAAABgAAABpJZGVudGlmaWNhZG9yIGRlIGxhIGNhcmdhLgAAAAAAAmlkAAAAAAAGAAAAE0NhbnRpZGFkIGRlIGxpdHJvcy4AAAAABmxpdGVycwAAAAAABAAAABNQbGFjYSBkZWwgdmVoaWN1bG8uAAAAAAVwbGF0ZQAAAAAAABAAAAA4UHJlY2lvIHBhZ2FkbyA9IGxpdHJvcyAqIHByZWNpbyBwb3IgbGl0cm8gKGVuIGNlbnRhdm9zKS4AAAAFcHJpY2UAAAAAAAALAAAAPlByZWNpbyBwb3IgbGl0cm8gdmlnZW50ZSBhbCBtb21lbnRvIGRlIGxhIGNhcmdhIChlbiBjZW50YXZvcykuAAAAAAAPcHJpY2VfcGVyX2xpdGVyAAAAAAsAAAA0RmVjaGEgZGUgdmVudGEgKHRpbWVzdGFtcCBkZWwgbGVkZ2VyLCBzZWd1bmRvcyBVVEMpLgAAAAV0aW1lcwAAAAAAAAYAAAA+TWVzIGRlIGxhIGNhcmdhIGVuIGhvcmEgZGUgQm9saXZpYSwgZm9ybWF0byBBQUFBTU0uIEVqLiAyMDI2MTAAAAAAAAp5ZWFyX21vbnRoAAAAAAAE",
        "AAAAAwAAABVFc3RhZG8gZGVsIGNvbXByYWRvci4AAAAAAAAAAAAAClN0YXRlQnV5ZXIAAAAAAAQAAAAgTm8gc2UgZGViZSB1dGlsaXphciBlc3RlIGVzdGFkby4AAAAGTm90VXNlAAAAAAAAAAAAKUVsIGNvbXByYWRvciBwdWVkZSBjb21wcmFyIHBhcmEgbGEgcGxhY2EuAAAAAAAABVZhbGlkAAAAAAAAAQAAACxFbCBjb21wcmFkb3Igbm8gcHVlZGUgY29tcHJhciBwYXJhIGxhIHBsYWNhLgAAAAdCbG9ja2VkAAAAAAIAAABPRWwgY29tcHJhZG9yIG5vIHBvZHJhIGNvbXByYXIgbWFzIHBhcmEgZWwgdmVoaWN1bG8uIE5vIHB1ZWRlIGNhbWJpYXIgZGUgZXN0YWRvLgAAAAAHTm9WYWxpZAAAAAAD",
        "AAAABQAAACJTZSByZWdpc3RybyB1bmEgY2FyZ2EgZGUgZ2Fzb2xpbmEuAAAAAAAAAAAAC0V2dFB1cmNoYXNlAAAAAAEAAAAMZXZ0X3B1cmNoYXNlAAAABwAAAAAAAAAFcGxhdGUAAAAAAAAQAAAAAQAAAAAAAAACaWQAAAAAAAYAAAAAAAAAAAAAAAhidXllcl9pZAAAAAYAAAAAAAAAAAAAAAZsaXRlcnMAAAAAAAQAAAAAAAAAAAAAAA9wcmljZV9wZXJfbGl0ZXIAAAAACwAAAAAAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAAAAAAABXRpbWVzAAAAAAAABgAAAAAAAAAC",
        "AAAAAwAAABRFc3RhZG8gZGVsIHZlaGljdWxvLgAAAAAAAAAMU3RhdGVWZWhpY2xlAAAABQAAACBObyBzZSBkZWJlIHV0aWxpemFyIGVzdGUgZXN0YWRvLgAAAAZOb3RVc2UAAAAAAAAAAAAdVmVoaWN1bG8gdmFsaWRvIHBhcmEgY29tcHJhci4AAAAAAAAFVmFsaWQAAAAAAAABAAAARVZlaGljdWxvIHlhIG5vIGVzIHZhbGlkbyBwYXJhIGNvbXByYXIsIG5vIHB1ZWRlIHNhbGlyIGRlIGVzdGUgZXN0YWRvLgAAAAAAAAhOb3RWYWxpZAAAAAIAAAAgVmVoaWN1bG8gcm9iYWRvLCBubyBzZSBsZSB2ZW5kZS4AAAAGU3RvbGVuAAAAAAADAAAAI1ZlaGljdWxvIGJsb3F1ZWFkbywgbm8gc2UgbGUgdmVuZGUuAAAAAAdCbG9ja2VkAAAAAAQ=",
        "AAAAAQAAAC5JZCBkZWwgY29tcHJhZG9yIHkgc3UgZXN0YWRvIHBhcmEgdW4gdmVoaWN1bG8uAAAAAAAAAAAADkJ1eWVyV2l0aFN0YXRlAAAAAAACAAAAHElkZW50aWZpY2Fkb3IgZGVsIGNvbXByYWRvci4AAAAIYnV5ZXJfaWQAAAAGAAAAFUVzdGFkbyBkZWwgY29tcHJhZG9yLgAAAAAAAAVzdGF0ZQAAAAAAB9AAAAAKU3RhdGVCdXllcgAA",
        "AAAABQAAABhDYW1iaW8gZWwgYWRtaW5pc3RyYWRvci4AAAAAAAAAD0V2dEFkbWluQ2hhbmdlZAAAAAABAAAAEWV2dF9hZG1pbl9jaGFuZ2VkAAAAAAAAAgAAAAAAAAAIcHJldmlvdXMAAAATAAAAAAAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAAAAAAC",
        "AAAABQAAADBDYW1iaW8gZWwgbGltaXRlIG1lbnN1YWwgZGUgbGl0cm9zIHBvciB2ZWhpY3Vsby4AAAAAAAAAD0V2dE1vbnRobHlMaW1pdAAAAAABAAAAEWV2dF9tb250aGx5X2xpbWl0AAAAAAAAAQAAAAAAAAAGbGl0ZXJzAAAAAAAEAAAAAAAAAAI=",
        "AAAABQAAACBDYW1iaW8gZWwgcHJlY2lvIGRlIGxhIGdhc29saW5hLgAAAAAAAAAQRXZ0R2Fzb2xpbmVQcmljZQAAAAEAAAASZXZ0X2dhc29saW5lX3ByaWNlAAAAAAACAAAAAAAAAAhwcmV2aW91cwAAAAsAAAAAAAAAAAAAAAVwcmljZQAAAAAAAAsAAAAAAAAAAg==",
        "AAAABQAAACxTZSByZWdpc3RybyB1biBjb21wcmFkb3IgKGV2blJlZ2lzdGVyQnV5ZXIpLgAAAAAAAAAQRXZ0UmVnaXN0ZXJCdXllcgAAAAEAAAASZXZ0X3JlZ2lzdGVyX2J1eWVyAAAAAAAGAAAAAAAAAA1pZGVudGl0eV9jYXJkAAAAAAAAEAAAAAEAAAAAAAAAAmlkAAAAAAAGAAAAAAAAAAAAAAALcmVnaXN0ZXJfYnkAAAAAEwAAAAAAAAAAAAAABW5hbWVzAAAAAAAAEAAAAAAAAAAAAAAACmxhc3RfbmFtZXMAAAAAABAAAAAAAAAAAAAAAAtwaG9uZW51bWJlcgAAAAAGAAAAAAAAAAI=",
        "AAAABQAAAC1TZSByZWdpc3RybyB1biB2ZWhpY3VsbyAoZXZ0UmVnaXN0ZXJWZWhpY2xlKS4AAAAAAAAAAAAAEkV2dFJlZ2lzdGVyVmVoaWNsZQAAAAAAAQAAABRldnRfcmVnaXN0ZXJfdmVoaWNsZQAAAAgAAAAAAAAABXBsYXRlAAAAAAAAEAAAAAEAAAAAAAAAAmlkAAAAAAAGAAAAAAAAAAAAAAALcmVnaXN0ZXJfYnkAAAAAEwAAAAAAAAAAAAAABWJyYW5kAAAAAAAAEAAAAAAAAAAAAAAABW1vZGVsAAAAAAAAEAAAAAAAAAAAAAAABHllYXIAAAAEAAAAAAAAAAAAAAAFY29sb3IAAAAAAAAQAAAAAAAAAAAAAAAFc3RhdGUAAAAAAAfQAAAADFN0YXRlVmVoaWNsZQAAAAAAAAAC",
        "AAAAAAAAAChEZXZ1ZWx2ZSBsYSBkaXJlY2Npb24gZGVsIGFkbWluaXN0cmFkb3IuAAAACWdldF9hZG1pbgAAAAAAAAAAAAABAAAAEw==",
        "AAAAAAAAAIpUcmFuc2ZpZXJlIGVsIHJvbCBkZSBhZG1pbmlzdHJhZG9yLiBSZXF1aWVyZSBsYSBmaXJtYSBkZWwgYWRtaW4gYWN0dWFsCnkgbGEgZGVsIG51ZXZvIGFkbWluIChldml0YSB0cmFuc2ZlcmlyIGEgdW5hIGRpcmVjY2lvbiBlcXVpdm9jYWRhKS4AAAAAAAlzZXRfYWRtaW4AAAAAAAABAAAAAAAAAAluZXdfYWRtaW4AAAAAAAATAAAAAA==",
        "AAAAAAAAACtCdXNjYSBhbCBjb21wcmFkb3IgcG9yIGVsIG51bWVybyBkZSBjYXJuZXQuAAAAAApmaW5kX2J1eWVyAAAAAAABAAAAAAAAAA1pZGVudGl0eV9jYXJkAAAAAAAAEAAAAAEAAAPpAAAH0AAAAAVCdXllcgAAAAAAAAM=",
        "AAAAAAAAAClCdXNjYSB1biB2ZWhpY3VsbyBwb3IgZWwgbnVtZXJvIGRlIHBsYWNhLgAAAAAAAAxmaW5kX3ZlaGljbGUAAAABAAAAAAAAAAVwbGF0ZQAAAAAAABAAAAABAAAD6QAAB9AAAAAHVmVoaWNsZQAAAAAD",
        "AAAAAAAAABxPYnRpZW5lIHVuYSBjYXJnYSBwb3Igc3UgaWQuAAAADGdldF9wdXJjaGFzZQAAAAEAAAAAAAAAAmlkAAAAAAAGAAAAAQAAA+kAAAfQAAAACFB1cmNoYXNlAAAAAw==",
        "AAAAAAAAAExDb25zdHJ1Y3Rvcjogc2UgZWplY3V0YSB1bmEgc29sYSB2ZXogYWwgZGVzcGxlZ2FyIHkgZGVmaW5lIGVsIGFkbWluaXN0cmFkb3IuAAAADV9fY29uc3RydWN0b3IAAAAAAAABAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAA",
        "AAAAAAAAAChDb250YWRvciBkZSBjb21wcmFkb3JlcyAoYnV5ZXJzQ291bnRlcikuAAAADmJ1eWVyc19jb3VudGVyAAAAAAAAAAAAAQAAAAY=",
        "AAAAAAAAAE5SZWdpc3RyYSB1biBjb21wcmFkb3IuIGByZWdpc3Rlcl9ieWAgKGVxdWl2YWxlbnRlIGEgYG1zZy5zZW5kZXJgKSBkZWJlIGZpcm1hci4AAAAAAA5yZWdpc3Rlcl9idXllcgAAAAAABQAAAAAAAAALcmVnaXN0ZXJfYnkAAAAAEwAAAAAAAAAFbmFtZXMAAAAAAAAQAAAAAAAAAApsYXN0X25hbWVzAAAAAAAQAAAAAAAAAA1pZGVudGl0eV9jYXJkAAAAAAAAEAAAAAAAAAALcGhvbmVudW1iZXIAAAAABgAAAAEAAAPpAAAAAQAAAAM=",
        "AAAAAAAAAERMaXRyb3MgY2FyZ2Fkb3MgcG9yIGVsIHZlaGljdWxvIGVuIHVuIG1lcyBkYWRvIChBQUFBTU0sIGVqLiAyMDI2MTApLgAAABBnZXRfbW9udGhfbGl0ZXJzAAAAAgAAAAAAAAAFcGxhdGUAAAAAAAAQAAAAAAAAAAp5ZWFyX21vbnRoAAAAAAAEAAAAAQAAAAQ=",
        "AAAAAAAAAE1SZWdpc3RyYSBlbCB2ZWhpY3Vsby4gYHJlZ2lzdGVyX2J5YCAoZXF1aXZhbGVudGUgYSBgbXNnLnNlbmRlcmApIGRlYmUgZmlybWFyLgAAAAAAABByZWdpc3Rlcl92ZWhpY2xlAAAABgAAAAAAAAALcmVnaXN0ZXJfYnkAAAAAEwAAAAAAAAAFcGxhdGUAAAAAAAAQAAAAAAAAAAVicmFuZAAAAAAAABAAAAAAAAAABW1vZGVsAAAAAAAAEAAAAAAAAAAEeWVhcgAAAAQAAAAAAAAABWNvbG9yAAAAAAAAEAAAAAEAAAPpAAAAAQAAAAM=",
        "AAAAAAAAAChDb250YWRvciBkZSB2ZWhpY3Vsb3MgKHZlaGljbGVzQ291bnRlcikuAAAAEHZlaGljbGVzX2NvdW50ZXIAAAAAAAAAAQAAAAY=",
        "AAAAAAAAADdMaW1pdGUgbWVuc3VhbCBkZSBsaXRyb3MgcG9yIHZlaGljdWxvICgwID0gc2luIGxpbWl0ZSkuAAAAABFnZXRfbW9udGhseV9saW1pdAAAAAAAAAAAAAABAAAABA==",
        "AAAAAAAAAB9PYnRpZW5lIGVsIGVzdGFkbyBkZWwgdmVoaWN1bG8uAAAAABFnZXRfc3RhdGVfdmVoaWNsZQAAAAAAAAEAAAAAAAAABXBsYXRlAAAAAAAAEAAAAAEAAAPpAAAH0AAAAAxTdGF0ZVZlaGljbGUAAAAD",
        "AAAAAAAAAB9Db250YWRvciBkZSBjYXJnYXMgZGUgZ2Fzb2xpbmEuAAAAABFwdXJjaGFzZXNfY291bnRlcgAAAAAAAAAAAAABAAAABg==",
        "AAAAAAAAAR1SZWdpc3RyYSB1bmEgY2FyZ2EgZGUgZ2Fzb2xpbmEgcGFyYSB1biB2ZWhpY3Vsby4gU29sbyBhZG1pbi4KClZhbGlkYSBxdWU6IGVsIHZlaGljdWxvIGV4aXN0YSB5IGVzdGUgVmFsaWQ7IGVsIGNvbXByYWRvciBlc3RlIGhhYmlsaXRhZG8KKFZhbGlkKSBwYXJhIGVsIHZlaGljdWxvOyBleGlzdGEgdW4gcHJlY2lvOyB5IG5vIHNlIGV4Y2VkYSBlbCBsaW1pdGUgbWVuc3VhbC4KRWwgcHJlY2lvIHNlIGNhbGN1bGEgY29uIGVsIHByZWNpbyB2aWdlbnRlLiBEZXZ1ZWx2ZSBlbCBpZCBkZSBsYSBjYXJnYS4AAAAAAAARcmVnaXN0ZXJfcHVyY2hhc2UAAAAAAAADAAAAAAAAAAVwbGF0ZQAAAAAAABAAAAAAAAAADWlkZW50aXR5X2NhcmQAAAAAAAAQAAAAAAAAAAZsaXRlcnMAAAAAAAQAAAABAAAD6QAAAAYAAAAD",
        "AAAAAAAAAExEZWZpbmUgZWwgbGltaXRlIGRlIGxpdHJvcyBwb3IgdmVoaWN1bG8gcG9yIG1lcy4gMCA9IHNpbiBsaW1pdGUuIFNvbG8gYWRtaW4uAAAAEXNldF9tb250aGx5X2xpbWl0AAAAAAAAAQAAAAAAAAAGbGl0ZXJzAAAAAAAEAAAAAA==",
        "AAAAAAAAADNQcmVjaW8gdmlnZW50ZSBkZSBsYSBnYXNvbGluYSBwb3IgbGl0cm8gKGNlbnRhdm9zKS4AAAAAEmdldF9nYXNvbGluZV9wcmljZQAAAAAAAAAAAAEAAAPpAAAACwAAAAM=",
        "AAAAAAAAAFZEZWZpbmUgZWwgcHJlY2lvIGRlIGxhIGdhc29saW5hIHBvciBsaXRybywgZW4gY2VudGF2b3MuIEVqLiAzNzQgPSBCcyAzLDc0LiBTb2xvIGFkbWluLgAAAAAAEnNldF9nYXNvbGluZV9wcmljZQAAAAAAAQAAAAAAAAAFcHJpY2UAAAAAAAALAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAGxDYW1iaWEgZWwgZXN0YWRvIGRlIHVuIHZlaGljdWxvLiBTb2xvIGFkbWluLgpTaSBlbCB2ZWhpY3VsbyBlc3RhIGVuIE5vdFZhbGlkIGRldnVlbHZlIEVycm9yOjpOb1ZhbGlkVmVoaWNsZS4AAAAUY2hhbmdlX3N0YXRlX3ZlaGljbGUAAAACAAAAAAAAAAVwbGF0ZQAAAAAAABAAAAAAAAAABXN0YXRlAAAAAAAH0AAAAAxTdGF0ZVZlaGljbGUAAAABAAAD6QAAB9AAAAAHVmVoaWNsZQAAAAAD",
        "AAAAAAAAAChCdXNjYSBlbCBjb21wcmFkb3IgYXNpZ25hZG8gYWwgdmVoaWN1bG8uAAAAFWZpbmRfYnV5ZXJfYnlfdmVoaWNsZQAAAAAAAAIAAAAAAAAABXBsYXRlAAAAAAAAEAAAAAAAAAANaWRlbnRpdHlfY2FyZAAAAAAAABAAAAABAAAD6QAAB9AAAAAFQnV5ZXIAAAAAAAAD",
        "AAAAAAAAAEJMaXN0YSBsYXMgY2FyZ2FzIGRlIHVuIHZlaGljdWxvLCBwYWdpbmFkbyAobWF4aW1vIDUwIHBvciBsbGFtYWRhKS4AAAAAABZsaXN0X3ZlaGljbGVfcHVyY2hhc2VzAAAAAAADAAAAAAAAAAVwbGF0ZQAAAAAAABAAAAAAAAAABXN0YXJ0AAAAAAAABgAAAAAAAAAFbGltaXQAAAAAAAAEAAAAAQAAA+oAAAfQAAAACFB1cmNoYXNl",
        "AAAAAAAAACZFc3RhZG8gZGVsIGNvbXByYWRvciBwYXJhIHVuIHZlaGljdWxvLgAAAAAAF2dldF9zdGF0ZV9idXllcl92ZWhpY2xlAAAAAAIAAAAAAAAABXBsYXRlAAAAAAAAEAAAAAAAAAANaWRlbnRpdHlfY2FyZAAAAAAAABAAAAABAAAD6QAAB9AAAAAKU3RhdGVCdXllcgAAAAAAAw==",
        "AAAAAAAAAENMaXRyb3MgY2FyZ2Fkb3MgcG9yIGVsIHZlaGljdWxvIGVuIGVsIG1lcyBhY3R1YWwgKGhvcmEgZGUgQm9saXZpYSkuAAAAABhnZXRfY3VycmVudF9tb250aF9saXRlcnMAAAABAAAAAAAAAAVwbGF0ZQAAAAAAABAAAAABAAAABA==",
        "AAAAAAAAAEJIYWJpbGl0YSBhIHVuIGNvbXByYWRvciBwYXJhIGNvbXByYXIgcGFyYSB1biB2ZWhpY3Vsby4gU29sbyBhZG1pbi4AAAAAABlyZWdpc3Rlcl9idXllcl90b192ZWhpY2xlAAAAAAAAAgAAAAAAAAAFcGxhdGUAAAAAAAAQAAAAAAAAAA1pZGVudGl0eV9jYXJkAAAAAAAAEAAAAAEAAAPpAAAAAQAAAAM=",
        "AAAAAAAAAIBDYW1iaWEgZWwgZXN0YWRvIGRlIHVuIGNvbXByYWRvciBwYXJhIHVuIHZlaGljdWxvLiBTb2xvIGFkbWluLgpTaSBlbCBjb21wcmFkb3IgZXN0YSBlbiBOb1ZhbGlkIGRldnVlbHZlIEVycm9yOjpCdXllclN0YXRlTG9ja2VkLgAAABpjaGFuZ2Vfc3RhdGVfYnV5ZXJfdmVoaWNsZQAAAAAAAwAAAAAAAAAFcGxhdGUAAAAAAAAQAAAAAAAAAA1pZGVudGl0eV9jYXJkAAAAAAAAEAAAAAAAAAAFc3RhdGUAAAAAAAfQAAAAClN0YXRlQnV5ZXIAAAAAAAEAAAPpAAAH0AAAAA5CdXllcldpdGhTdGF0ZQAAAAAAAw==",
        "AAAAAAAAADBDYW50aWRhZCBkZSBjYXJnYXMgcmVnaXN0cmFkYXMgcGFyYSB1biB2ZWhpY3Vsby4AAAAbZ2V0X3ZlaGljbGVfcHVyY2hhc2VzX2NvdW50AAAAAAEAAAAAAAAABXBsYXRlAAAAAAAAEAAAAAEAAAAG" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_admin: this.txFromJSON<string>,
        set_admin: this.txFromJSON<null>,
        find_buyer: this.txFromJSON<Result<Buyer>>,
        find_vehicle: this.txFromJSON<Result<Vehicle>>,
        get_purchase: this.txFromJSON<Result<Purchase>>,
        buyers_counter: this.txFromJSON<u64>,
        register_buyer: this.txFromJSON<Result<boolean>>,
        get_month_liters: this.txFromJSON<u32>,
        register_vehicle: this.txFromJSON<Result<boolean>>,
        vehicles_counter: this.txFromJSON<u64>,
        get_monthly_limit: this.txFromJSON<u32>,
        get_state_vehicle: this.txFromJSON<Result<StateVehicle>>,
        purchases_counter: this.txFromJSON<u64>,
        register_purchase: this.txFromJSON<Result<u64>>,
        set_monthly_limit: this.txFromJSON<null>,
        get_gasoline_price: this.txFromJSON<Result<i128>>,
        set_gasoline_price: this.txFromJSON<Result<void>>,
        change_state_vehicle: this.txFromJSON<Result<Vehicle>>,
        find_buyer_by_vehicle: this.txFromJSON<Result<Buyer>>,
        list_vehicle_purchases: this.txFromJSON<Array<Purchase>>,
        get_state_buyer_vehicle: this.txFromJSON<Result<StateBuyer>>,
        get_current_month_liters: this.txFromJSON<u32>,
        register_buyer_to_vehicle: this.txFromJSON<Result<boolean>>,
        change_state_buyer_vehicle: this.txFromJSON<Result<BuyerWithState>>,
        get_vehicle_purchases_count: this.txFromJSON<u64>
  }
}