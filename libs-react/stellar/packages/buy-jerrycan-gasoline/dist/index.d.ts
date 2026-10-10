import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions, Result } from "@stellar/stellar-sdk/contract";
import type { u32, u64, i128 } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CC7XIIG5OXBLTKKN455XNWV4IAR6FD6P2GW3VXJQQO5BVSXAVGXF5LHL";
    };
};
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
export declare const Errors: {
    /**
     * errExceededMonthlyLimit: se excede el limite mensual.
     */
    1: {
        message: string;
    };
    /**
     * errStolenVehicle: el vehiculo esta robado.
     */
    2: {
        message: string;
    };
    /**
     * errNoValidVehicle: el vehiculo ya no circula.
     */
    3: {
        message: string;
    };
    /**
     * errNotExistsBuyer / "No existe el comprador!!!"
     */
    4: {
        message: string;
    };
    /**
     * "Existe la placa!!!"
     */
    5: {
        message: string;
    };
    /**
     * "No existe la placa!!!"
     */
    6: {
        message: string;
    };
    /**
     * "Existe el comprador!!!"
     */
    7: {
        message: string;
    };
    /**
     * "No debe ser vacio Carnet de identidad"
     */
    8: {
        message: string;
    };
    /**
     * "Existe el comprador para el vehiculo!!!"
     */
    9: {
        message: string;
    };
    /**
     * "No existe el comprador para el vehiculo!!!"
     */
    10: {
        message: string;
    };
    /**
     * Cadena demasiado larga (ver string_utils::MAX_STRING_LEN).
     */
    11: {
        message: string;
    };
    /**
     * Estado no permitido (NotUse).
     */
    12: {
        message: string;
    };
    /**
     * El vehiculo esta bloqueado.
     */
    13: {
        message: string;
    };
    /**
     * El comprador no esta habilitado (Blocked / NoValid) para el vehiculo.
     */
    14: {
        message: string;
    };
    /**
     * Aun no se definio el precio de la gasolina.
     */
    15: {
        message: string;
    };
    /**
     * El precio debe ser mayor a cero.
     */
    16: {
        message: string;
    };
    /**
     * Los litros deben ser mayores a cero.
     */
    17: {
        message: string;
    };
    /**
     * El comprador esta en NoValid para el vehiculo y no puede cambiar de estado.
     */
    18: {
        message: string;
    };
    /**
     * No existe la carga.
     */
    19: {
        message: string;
    };
};
export type DataKey = {
    tag: "Admin";
    values: void;
} | {
    tag: "BuyersCounter";
    values: void;
} | {
    tag: "VehiclesCounter";
    values: void;
} | {
    tag: "PurchasesCounter";
    values: void;
} | {
    tag: "GasolinePrice";
    values: void;
} | {
    tag: "MonthlyLimit";
    values: void;
} | {
    tag: "Vehicle";
    values: readonly [string];
} | {
    tag: "Buyer";
    values: readonly [u64];
} | {
    tag: "BuyerIdByCard";
    values: readonly [string];
} | {
    tag: "VehicleBuyer";
    values: readonly [string, u64];
} | {
    tag: "Purchase";
    values: readonly [u64];
} | {
    tag: "VehiclePurchaseCount";
    values: readonly [string];
} | {
    tag: "VehiclePurchase";
    values: readonly [string, u64];
} | {
    tag: "MonthlyLiters";
    values: readonly [string, u32];
};
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
export declare enum StateBuyer {
    NotUse = 0,
    Valid = 1,
    Blocked = 2,
    NoValid = 3
}
/**
 * Estado del vehiculo.
 */
export declare enum StateVehicle {
    NotUse = 0,
    Valid = 1,
    NotValid = 2,
    Stolen = 3,
    Blocked = 4
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
    get_admin: (options?: MethodOptions) => Promise<AssembledTransaction<string>>;
    /**
     * Construct and simulate a set_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Transfiere el rol de administrador. Requiere la firma del admin actual
     * y la del nuevo admin (evita transferir a una direccion equivocada).
     */
    set_admin: ({ new_admin }: {
        new_admin: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a find_buyer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Busca al comprador por el numero de carnet.
     */
    find_buyer: ({ identity_card }: {
        identity_card: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Buyer>>>;
    /**
     * Construct and simulate a find_vehicle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Busca un vehiculo por el numero de placa.
     */
    find_vehicle: ({ plate }: {
        plate: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Vehicle>>>;
    /**
     * Construct and simulate a get_purchase transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Obtiene una carga por su id.
     */
    get_purchase: ({ id }: {
        id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Purchase>>>;
    /**
     * Construct and simulate a buyers_counter transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Contador de compradores (buyersCounter).
     */
    buyers_counter: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>;
    /**
     * Construct and simulate a register_buyer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Registra un comprador. `register_by` (equivalente a `msg.sender`) debe firmar.
     */
    register_buyer: ({ register_by, names, last_names, identity_card, phonenumber }: {
        register_by: string;
        names: string;
        last_names: string;
        identity_card: string;
        phonenumber: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<boolean>>>;
    /**
     * Construct and simulate a get_month_liters transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Litros cargados por el vehiculo en un mes dado (AAAAMM, ej. 202610).
     */
    get_month_liters: ({ plate, year_month }: {
        plate: string;
        year_month: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a register_vehicle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Registra el vehiculo. `register_by` (equivalente a `msg.sender`) debe firmar.
     */
    register_vehicle: ({ register_by, plate, brand, model, year, color }: {
        register_by: string;
        plate: string;
        brand: string;
        model: string;
        year: u32;
        color: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<boolean>>>;
    /**
     * Construct and simulate a vehicles_counter transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Contador de vehiculos (vehiclesCounter).
     */
    vehicles_counter: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>;
    /**
     * Construct and simulate a get_monthly_limit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Limite mensual de litros por vehiculo (0 = sin limite).
     */
    get_monthly_limit: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a get_state_vehicle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Obtiene el estado del vehiculo.
     */
    get_state_vehicle: ({ plate }: {
        plate: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<StateVehicle>>>;
    /**
     * Construct and simulate a purchases_counter transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Contador de cargas de gasolina.
     */
    purchases_counter: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>;
    /**
     * Construct and simulate a register_purchase transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Registra una carga de gasolina para un vehiculo. Solo admin.
     *
     * Valida que: el vehiculo exista y este Valid; el comprador este habilitado
     * (Valid) para el vehiculo; exista un precio; y no se exceda el limite mensual.
     * El precio se calcula con el precio vigente. Devuelve el id de la carga.
     */
    register_purchase: ({ plate, identity_card, liters }: {
        plate: string;
        identity_card: string;
        liters: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<u64>>>;
    /**
     * Construct and simulate a set_monthly_limit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Define el limite de litros por vehiculo por mes. 0 = sin limite. Solo admin.
     */
    set_monthly_limit: ({ liters }: {
        liters: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a get_gasoline_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Precio vigente de la gasolina por litro (centavos).
     */
    get_gasoline_price: (options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>;
    /**
     * Construct and simulate a set_gasoline_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Define el precio de la gasolina por litro, en centavos. Ej. 374 = Bs 3,74. Solo admin.
     */
    set_gasoline_price: ({ price }: {
        price: i128;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a change_state_vehicle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Cambia el estado de un vehiculo. Solo admin.
     * Si el vehiculo esta en NotValid devuelve Error::NoValidVehicle.
     */
    change_state_vehicle: ({ plate, state }: {
        plate: string;
        state: StateVehicle;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Vehicle>>>;
    /**
     * Construct and simulate a find_buyer_by_vehicle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Busca el comprador asignado al vehiculo.
     */
    find_buyer_by_vehicle: ({ plate, identity_card }: {
        plate: string;
        identity_card: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<Buyer>>>;
    /**
     * Construct and simulate a list_vehicle_purchases transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Lista las cargas de un vehiculo, paginado (maximo 50 por llamada).
     */
    list_vehicle_purchases: ({ plate, start, limit }: {
        plate: string;
        start: u64;
        limit: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Array<Purchase>>>;
    /**
     * Construct and simulate a get_state_buyer_vehicle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Estado del comprador para un vehiculo.
     */
    get_state_buyer_vehicle: ({ plate, identity_card }: {
        plate: string;
        identity_card: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<StateBuyer>>>;
    /**
     * Construct and simulate a get_current_month_liters transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Litros cargados por el vehiculo en el mes actual (hora de Bolivia).
     */
    get_current_month_liters: ({ plate }: {
        plate: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a register_buyer_to_vehicle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Habilita a un comprador para comprar para un vehiculo. Solo admin.
     */
    register_buyer_to_vehicle: ({ plate, identity_card }: {
        plate: string;
        identity_card: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<boolean>>>;
    /**
     * Construct and simulate a change_state_buyer_vehicle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Cambia el estado de un comprador para un vehiculo. Solo admin.
     * Si el comprador esta en NoValid devuelve Error::BuyerStateLocked.
     */
    change_state_buyer_vehicle: ({ plate, identity_card, state }: {
        plate: string;
        identity_card: string;
        state: StateBuyer;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Result<BuyerWithState>>>;
    /**
     * Construct and simulate a get_vehicle_purchases_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Cantidad de cargas registradas para un vehiculo.
     */
    get_vehicle_purchases_count: ({ plate }: {
        plate: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<u64>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
    /** Constructor/Initialization Args for the contract's `__constructor` method */
    { admin }: {
        admin: string;
    }, 
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        get_admin: (json: string) => AssembledTransaction<string>;
        set_admin: (json: string) => AssembledTransaction<null>;
        find_buyer: (json: string) => AssembledTransaction<Result<Buyer, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        find_vehicle: (json: string) => AssembledTransaction<Result<Vehicle, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_purchase: (json: string) => AssembledTransaction<Result<Purchase, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        buyers_counter: (json: string) => AssembledTransaction<bigint>;
        register_buyer: (json: string) => AssembledTransaction<Result<boolean, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_month_liters: (json: string) => AssembledTransaction<number>;
        register_vehicle: (json: string) => AssembledTransaction<Result<boolean, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        vehicles_counter: (json: string) => AssembledTransaction<bigint>;
        get_monthly_limit: (json: string) => AssembledTransaction<number>;
        get_state_vehicle: (json: string) => AssembledTransaction<Result<StateVehicle, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        purchases_counter: (json: string) => AssembledTransaction<bigint>;
        register_purchase: (json: string) => AssembledTransaction<Result<bigint, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        set_monthly_limit: (json: string) => AssembledTransaction<null>;
        get_gasoline_price: (json: string) => AssembledTransaction<Result<bigint, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        set_gasoline_price: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        change_state_vehicle: (json: string) => AssembledTransaction<Result<Vehicle, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        find_buyer_by_vehicle: (json: string) => AssembledTransaction<Result<Buyer, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        list_vehicle_purchases: (json: string) => AssembledTransaction<Purchase[]>;
        get_state_buyer_vehicle: (json: string) => AssembledTransaction<Result<StateBuyer, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_current_month_liters: (json: string) => AssembledTransaction<number>;
        register_buyer_to_vehicle: (json: string) => AssembledTransaction<Result<boolean, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        change_state_buyer_vehicle: (json: string) => AssembledTransaction<Result<BuyerWithState, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_vehicle_purchases_count: (json: string) => AssembledTransaction<bigint>;
    };
}
