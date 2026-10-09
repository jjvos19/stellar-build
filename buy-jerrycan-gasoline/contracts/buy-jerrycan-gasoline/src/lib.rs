#![no_std]
//! Port a Soroban (Stellar) del contrato BuyGasolineJerrycan.sol.
//!
//! Incluye:
//! - Rol de administrador (definido al desplegar con el constructor).
//! - Precio de la gasolina por litro.
//! - Registro de cargas de gasolina con limite mensual por vehiculo.

mod string_utils;

#[cfg(test)]
mod test;

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, log, Address, Env, String,
    Vec,
};
use string_utils::{length, trim};

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const DAY_IN_LEDGERS: u32 = 17_280; // ~5 s por ledger
const TTL_THRESHOLD: u32 = 7 * DAY_IN_LEDGERS;
const TTL_EXTEND_TO: u32 = 30 * DAY_IN_LEDGERS;

/// Desfase horario usado para decidir a que mes pertenece una carga.
/// Bolivia: UTC-4 (sin horario de verano).
const TIMEZONE_OFFSET_SECS: i64 = -4 * 3_600;

/// Maximo de compras devueltas por `list_vehicle_purchases`.
const MAX_PAGE: u32 = 50;

// ---------------------------------------------------------------------------
// Enums de estado
// ---------------------------------------------------------------------------

/// Estado del comprador.
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum StateBuyer {
    /// No se debe utilizar este estado.
    NotUse = 0,
    /// El comprador puede comprar para la placa.
    Valid = 1,
    /// El comprador no puede comprar para la placa.
    Blocked = 2,
    /// El comprador no podra comprar mas para el vehiculo. No puede cambiar de estado.
    NoValid = 3,
}

/// Estado del vehiculo.
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum StateVehicle {
    /// No se debe utilizar este estado.
    NotUse = 0,
    /// Vehiculo valido para comprar.
    Valid = 1,
    /// Vehiculo ya no es valido para comprar, no puede salir de este estado.
    NotValid = 2,
    /// Vehiculo robado, no se le vende.
    Stolen = 3,
    /// Vehiculo bloqueado, no se le vende.
    Blocked = 4,
}

// ---------------------------------------------------------------------------
// Estructuras
// ---------------------------------------------------------------------------

/// Estructura para registrar el vehiculo.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Vehicle {
    /// Identificador del vehiculo.
    pub id: u64,
    /// Direccion de la persona que registro, no necesariamente es el dueño.
    pub register_by: Address,
    /// Placa del vehiculo. Ej. 4816STF
    pub plate: String,
    /// Marca del vehiculo. Ej. Suzuki
    pub brand: String,
    /// Modelo del vehiculo. Ej. Grand Vitara
    pub model: String,
    /// Año del vehiculo. Ej. 2020
    pub year: u32,
    /// Color del vehiculo. Ej. Plateado
    pub color: String,
    /// Estado del vehiculo.
    pub state: StateVehicle,
}

/// Estructura para el comprador de gasolina.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Buyer {
    /// ID del registro.
    pub id: u64,
    /// Direccion de la persona que registro, no necesariamente es el dueño.
    pub register_by: Address,
    /// Nombres del comprador. Ej. Juan Jose
    pub names: String,
    /// Apellidos del comprador. Ej. Valencia O.
    pub last_names: String,
    /// Numero de carnet del comprador. Ej. 4569987
    pub identity_card: String,
    /// Numero de telefono celular. Ej. 71260680
    pub phonenumber: u64,
}

/// Id del comprador y su estado para un vehiculo.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BuyerWithState {
    /// Identificador del comprador.
    pub buyer_id: u64,
    /// Estado del comprador.
    pub state: StateBuyer,
}

/// Registro de una carga de gasolina.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Purchase {
    /// Identificador de la carga.
    pub id: u64,
    /// Placa del vehiculo.
    pub plate: String,
    /// Identificador del comprador.
    pub buyer_id: u64,
    /// Fecha de venta (timestamp del ledger, segundos UTC).
    pub times: u64,
    /// Mes de la carga en hora de Bolivia, formato AAAAMM. Ej. 202610
    pub year_month: u32,
    /// Cantidad de litros.
    pub liters: u32,
    /// Precio por litro vigente al momento de la carga (en centavos).
    pub price_per_liter: i128,
    /// Precio pagado = litros * precio por litro (en centavos).
    pub price: i128,
}

// ---------------------------------------------------------------------------
// Claves de almacenamiento
// ---------------------------------------------------------------------------
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    // --- instance ---
    /// Direccion del administrador.
    Admin,
    /// Contador de compradores.
    BuyersCounter,
    /// Contador de vehiculos.
    VehiclesCounter,
    /// Contador de cargas.
    PurchasesCounter,
    /// Precio de la gasolina por litro (centavos).
    GasolinePrice,
    /// Limite mensual de litros por vehiculo (0 = sin limite).
    MonthlyLimit,
    // --- persistent ---
    /// placa => Vehicle
    Vehicle(String),
    /// id => Buyer
    Buyer(u64),
    /// carnet => id
    BuyerIdByCard(String),
    /// (placa, id comprador) => BuyerWithState
    VehicleBuyer(String, u64),
    /// id => Purchase
    Purchase(u64),
    /// placa => cantidad de cargas del vehiculo
    VehiclePurchaseCount(String),
    /// (placa, indice) => id de la carga
    VehiclePurchase(String, u64),
    /// (placa, AAAAMM) => litros cargados en ese mes
    MonthlyLiters(String, u32),
}

// ---------------------------------------------------------------------------
// Errores
// ---------------------------------------------------------------------------
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// errExceededMonthlyLimit: se excede el limite mensual.
    ExceededMonthlyLimit = 1,
    /// errStolenVehicle: el vehiculo esta robado.
    StolenVehicle = 2,
    /// errNoValidVehicle: el vehiculo ya no circula.
    NoValidVehicle = 3,
    /// errNotExistsBuyer / "No existe el comprador!!!"
    NotExistsBuyer = 4,
    /// "Existe la placa!!!"
    PlateExists = 5,
    /// "No existe la placa!!!"
    PlateNotExists = 6,
    /// "Existe el comprador!!!"
    BuyerExists = 7,
    /// "No debe ser vacio Carnet de identidad"
    BlankIdentityCard = 8,
    /// "Existe el comprador para el vehiculo!!!"
    BuyerVehicleExists = 9,
    /// "No existe el comprador para el vehiculo!!!"
    BuyerVehicleNotExists = 10,
    /// Cadena demasiado larga (ver string_utils::MAX_STRING_LEN).
    StringTooLong = 11,
    /// Estado no permitido (NotUse).
    InvalidState = 12,
    /// El vehiculo esta bloqueado.
    VehicleBlocked = 13,
    /// El comprador no esta habilitado (Blocked / NoValid) para el vehiculo.
    BuyerNotAllowed = 14,
    /// Aun no se definio el precio de la gasolina.
    PriceNotSet = 15,
    /// El precio debe ser mayor a cero.
    InvalidPrice = 16,
    /// Los litros deben ser mayores a cero.
    InvalidLiters = 17,
    /// El comprador esta en NoValid para el vehiculo y no puede cambiar de estado.
    BuyerStateLocked = 18,
    /// No existe la carga.
    PurchaseNotExists = 19,
}

// ---------------------------------------------------------------------------
// Eventos
// ---------------------------------------------------------------------------

/// Se registro un vehiculo (evtRegisterVehicle).
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EvtRegisterVehicle {
    #[topic]
    pub plate: String,
    pub id: u64,
    pub register_by: Address,
    pub brand: String,
    pub model: String,
    pub year: u32,
    pub color: String,
    pub state: StateVehicle,
}

/// Se registro un comprador (evnRegisterBuyer).
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EvtRegisterBuyer {
    #[topic]
    pub identity_card: String,
    pub id: u64,
    pub register_by: Address,
    pub names: String,
    pub last_names: String,
    pub phonenumber: u64,
}

/// Cambio el administrador.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EvtAdminChanged {
    pub previous: Address,
    pub new_admin: Address,
}

/// Cambio el precio de la gasolina.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EvtGasolinePrice {
    pub previous: i128,
    pub price: i128,
}

/// Cambio el limite mensual de litros por vehiculo.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EvtMonthlyLimit {
    pub liters: u32,
}

/// Se registro una carga de gasolina.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EvtPurchase {
    #[topic]
    pub plate: String,
    pub id: u64,
    pub buyer_id: u64,
    pub liters: u32,
    pub price_per_liter: i128,
    pub price: i128,
    pub times: u64,
}

// ---------------------------------------------------------------------------
// Funciones internas
// ---------------------------------------------------------------------------

fn bump_persistent(env: &Env, key: &DataKey) {
    env.storage()
        .persistent()
        .extend_ttl(key, TTL_THRESHOLD, TTL_EXTEND_TO);
}

fn bump_instance(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(TTL_THRESHOLD, TTL_EXTEND_TO);
}

fn set_persistent<V: soroban_sdk::IntoVal<Env, soroban_sdk::Val>>(
    env: &Env,
    key: &DataKey,
    value: &V,
) {
    env.storage().persistent().set(key, value);
    bump_persistent(env, key);
}

fn read_admin(env: &Env) -> Address {
    // Siempre existe: se define en el constructor.
    env.storage().instance().get(&DataKey::Admin).unwrap()
}

/// onlyAdmin: exige la firma del administrador.
fn require_admin(env: &Env) -> Address {
    let admin = read_admin(env);
    admin.require_auth();
    bump_instance(env);
    admin
}

/// `++counter`: incrementa y devuelve el nuevo valor.
fn next_id(env: &Env, key: DataKey) -> u64 {
    let id: u64 = env.storage().instance().get(&key).unwrap_or(0) + 1;
    env.storage().instance().set(&key, &id);
    bump_instance(env);
    id
}

/// existsPlate: verifica que exista la placa y devuelve el vehiculo.
fn exists_plate(env: &Env, plate: &String) -> Result<Vehicle, Error> {
    let vehicle: Option<Vehicle> = env
        .storage()
        .persistent()
        .get(&DataKey::Vehicle(plate.clone()));
    log!(env, "Vehiculo existe: {}", vehicle.is_some());
    vehicle.ok_or(Error::PlateNotExists)
}

/// notExistsPlate: verifica que no exista la placa.
fn not_exists_plate(env: &Env, plate: &String) -> Result<(), Error> {
    let exists = env
        .storage()
        .persistent()
        .has(&DataKey::Vehicle(plate.clone()));
    log!(env, "Vehiculo existe: {}", exists);
    if exists {
        return Err(Error::PlateExists);
    }
    Ok(())
}

/// notBlank: el carnet no debe ser vacio ni solo espacios. Devuelve el carnet recortado.
fn not_blank(env: &Env, identity_card: &String) -> Result<String, Error> {
    let fixed = trim(env, identity_card)?;
    if length(&fixed) == 0 {
        return Err(Error::BlankIdentityCard);
    }
    Ok(fixed)
}

/// identityCardBuyers[carnet] (0 si no existe).
fn buyer_id_by_card(env: &Env, identity_card: &String) -> u64 {
    env.storage()
        .persistent()
        .get(&DataKey::BuyerIdByCard(identity_card.clone()))
        .unwrap_or(0)
}

/// Busca la relacion comprador-vehiculo a partir del carnet (se recorta).
fn read_buyer_vehicle(
    env: &Env,
    plate: &String,
    identity_card: &String,
) -> Result<BuyerWithState, Error> {
    let card = trim(env, identity_card)?;
    let id = buyer_id_by_card(env, &card);
    env.storage()
        .persistent()
        .get(&DataKey::VehicleBuyer(plate.clone(), id))
        .ok_or(Error::BuyerVehicleNotExists)
}

/// Convierte un timestamp UTC (segundos) al mes AAAAMM en la zona horaria
/// configurada (algoritmo civil_from_days de Howard Hinnant).
pub(crate) fn year_month(timestamp: u64) -> u32 {
    let ts = timestamp as i64 + TIMEZONE_OFFSET_SECS;
    let days = ts.div_euclid(86_400);
    let z = days + 719_468;
    let era = z.div_euclid(146_097);
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1_460 + doe / 36_524 - doe / 146_096) / 365;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let month = if mp < 10 { mp + 3 } else { mp - 9 };
    let year = yoe + era * 400 + if month <= 2 { 1 } else { 0 };
    (year as u32) * 100 + month as u32
}

fn read_month_liters(env: &Env, plate: &String, ym: u32) -> u32 {
    env.storage()
        .persistent()
        .get(&DataKey::MonthlyLiters(plate.clone(), ym))
        .unwrap_or(0)
}

// ---------------------------------------------------------------------------
// Contrato
// ---------------------------------------------------------------------------

#[contract]
pub struct BuyGasolineJerrycan;

#[contractimpl]
impl BuyGasolineJerrycan {
    /// Constructor: se ejecuta una sola vez al desplegar y define el administrador.
    pub fn __constructor(env: Env, admin: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
        bump_instance(&env);
    }

    // ======================= Administracion =======================

    /// Devuelve la direccion del administrador.
    pub fn get_admin(env: Env) -> Address {
        read_admin(&env)
    }

    /// Transfiere el rol de administrador. Requiere la firma del admin actual
    /// y la del nuevo admin (evita transferir a una direccion equivocada).
    pub fn set_admin(env: Env, new_admin: Address) {
        let previous = require_admin(&env);
        new_admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &new_admin);
        EvtAdminChanged {
            previous,
            new_admin,
        }
        .publish(&env);
    }

    /// Define el precio de la gasolina por litro, en centavos. Ej. 374 = Bs 3,74. Solo admin.
    pub fn set_gasoline_price(env: Env, price: i128) -> Result<(), Error> {
        require_admin(&env);
        if price <= 0 {
            return Err(Error::InvalidPrice);
        }
        let previous: i128 = env
            .storage()
            .instance()
            .get(&DataKey::GasolinePrice)
            .unwrap_or(0);
        env.storage().instance().set(&DataKey::GasolinePrice, &price);
        EvtGasolinePrice { previous, price }.publish(&env);
        Ok(())
    }

    /// Precio vigente de la gasolina por litro (centavos).
    pub fn get_gasoline_price(env: Env) -> Result<i128, Error> {
        env.storage()
            .instance()
            .get(&DataKey::GasolinePrice)
            .ok_or(Error::PriceNotSet)
    }

    /// Define el limite de litros por vehiculo por mes. 0 = sin limite. Solo admin.
    pub fn set_monthly_limit(env: Env, liters: u32) {
        require_admin(&env);
        env.storage().instance().set(&DataKey::MonthlyLimit, &liters);
        EvtMonthlyLimit { liters }.publish(&env);
    }

    /// Limite mensual de litros por vehiculo (0 = sin limite).
    pub fn get_monthly_limit(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::MonthlyLimit)
            .unwrap_or(0)
    }

    // ======================= Contadores =======================

    /// Contador de compradores (buyersCounter).
    pub fn buyers_counter(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::BuyersCounter)
            .unwrap_or(0)
    }

    /// Contador de vehiculos (vehiclesCounter).
    pub fn vehicles_counter(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::VehiclesCounter)
            .unwrap_or(0)
    }

    /// Contador de cargas de gasolina.
    pub fn purchases_counter(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::PurchasesCounter)
            .unwrap_or(0)
    }

    // ======================= Vehiculos =======================

    /// Registra el vehiculo. `register_by` (equivalente a `msg.sender`) debe firmar.
    pub fn register_vehicle(
        env: Env,
        register_by: Address,
        plate: String,
        brand: String,
        model: String,
        year: u32,
        color: String,
    ) -> Result<bool, Error> {
        register_by.require_auth();
        not_exists_plate(&env, &plate)?;

        let id = next_id(&env, DataKey::VehiclesCounter);
        let vehicle = Vehicle {
            id,
            register_by: register_by.clone(),
            plate: plate.clone(),
            brand: brand.clone(),
            model: model.clone(),
            year,
            color: color.clone(),
            state: StateVehicle::Valid,
        };

        let key = DataKey::Vehicle(plate.clone());
        set_persistent(&env, &key, &vehicle);

        EvtRegisterVehicle {
            plate,
            id,
            register_by,
            brand,
            model,
            year,
            color,
            state: StateVehicle::Valid,
        }
        .publish(&env);

        Ok(env.storage().persistent().has(&key))
    }

    /// Busca un vehiculo por el numero de placa.
    pub fn find_vehicle(env: Env, plate: String) -> Result<Vehicle, Error> {
        exists_plate(&env, &plate)
    }

    /// Obtiene el estado del vehiculo.
    pub fn get_state_vehicle(env: Env, plate: String) -> Result<StateVehicle, Error> {
        Ok(exists_plate(&env, &plate)?.state)
    }

    /// Cambia el estado de un vehiculo. Solo admin.
    /// Si el vehiculo esta en NotValid devuelve Error::NoValidVehicle.
    pub fn change_state_vehicle(
        env: Env,
        plate: String,
        state: StateVehicle,
    ) -> Result<Vehicle, Error> {
        require_admin(&env);
        let mut vehicle = exists_plate(&env, &plate)?;
        if vehicle.state == StateVehicle::NotValid {
            log!(&env, "Vehiculo no valido: {}", plate);
            return Err(Error::NoValidVehicle);
        }
        if state == StateVehicle::NotUse {
            return Err(Error::InvalidState);
        }
        vehicle.state = state;
        set_persistent(&env, &DataKey::Vehicle(plate), &vehicle);
        Ok(vehicle)
    }

    // ======================= Compradores =======================

    /// Registra un comprador. `register_by` (equivalente a `msg.sender`) debe firmar.
    pub fn register_buyer(
        env: Env,
        register_by: Address,
        names: String,
        last_names: String,
        identity_card: String,
        phonenumber: u64,
    ) -> Result<bool, Error> {
        register_by.require_auth();
        let card = not_blank(&env, &identity_card)?;
        if buyer_id_by_card(&env, &card) != 0 {
            return Err(Error::BuyerExists);
        }

        let id = next_id(&env, DataKey::BuyersCounter);
        let buyer = Buyer {
            id,
            register_by: register_by.clone(),
            names: names.clone(),
            last_names: last_names.clone(),
            identity_card: card.clone(),
            phonenumber,
        };

        let buyer_key = DataKey::Buyer(id);
        set_persistent(&env, &DataKey::BuyerIdByCard(card.clone()), &id);
        set_persistent(&env, &buyer_key, &buyer);

        EvtRegisterBuyer {
            identity_card: card,
            id,
            register_by,
            names,
            last_names,
            phonenumber,
        }
        .publish(&env);

        Ok(env.storage().persistent().has(&buyer_key))
    }

    /// Busca al comprador por el numero de carnet.
    pub fn find_buyer(env: Env, identity_card: String) -> Result<Buyer, Error> {
        let card = not_blank(&env, &identity_card)?;
        let id = buyer_id_by_card(&env, &card);
        if id == 0 {
            return Err(Error::NotExistsBuyer);
        }
        env.storage()
            .persistent()
            .get(&DataKey::Buyer(id))
            .ok_or(Error::NotExistsBuyer)
    }

    /// Habilita a un comprador para comprar para un vehiculo. Solo admin.
    pub fn register_buyer_to_vehicle(
        env: Env,
        plate: String,
        identity_card: String,
    ) -> Result<bool, Error> {
        require_admin(&env);
        exists_plate(&env, &plate)?;
        let card = trim(&env, &identity_card)?;
        let id = buyer_id_by_card(&env, &card);
        if id == 0 {
            return Err(Error::NotExistsBuyer);
        }

        let key = DataKey::VehicleBuyer(plate, id);
        if env.storage().persistent().has(&key) {
            return Err(Error::BuyerVehicleExists);
        }
        let buyer_state = BuyerWithState {
            buyer_id: id,
            state: StateBuyer::Valid,
        };
        set_persistent(&env, &key, &buyer_state);
        Ok(env.storage().persistent().has(&key))
    }

    /// Cambia el estado de un comprador para un vehiculo. Solo admin.
    /// Si el comprador esta en NoValid devuelve Error::BuyerStateLocked.
    pub fn change_state_buyer_vehicle(
        env: Env,
        plate: String,
        identity_card: String,
        state: StateBuyer,
    ) -> Result<BuyerWithState, Error> {
        require_admin(&env);
        let mut buyer_state = read_buyer_vehicle(&env, &plate, &identity_card)?;
        if buyer_state.state == StateBuyer::NoValid {
            return Err(Error::BuyerStateLocked);
        }
        if state == StateBuyer::NotUse {
            return Err(Error::InvalidState);
        }
        buyer_state.state = state;
        set_persistent(
            &env,
            &DataKey::VehicleBuyer(plate, buyer_state.buyer_id),
            &buyer_state,
        );
        Ok(buyer_state)
    }

    /// Estado del comprador para un vehiculo.
    pub fn get_state_buyer_vehicle(
        env: Env,
        plate: String,
        identity_card: String,
    ) -> Result<StateBuyer, Error> {
        Ok(read_buyer_vehicle(&env, &plate, &identity_card)?.state)
    }

    /// Busca el comprador asignado al vehiculo.
    pub fn find_buyer_by_vehicle(
        env: Env,
        plate: String,
        identity_card: String,
    ) -> Result<Buyer, Error> {
        let buyer_state = read_buyer_vehicle(&env, &plate, &identity_card)?;
        env.storage()
            .persistent()
            .get(&DataKey::Buyer(buyer_state.buyer_id))
            .ok_or(Error::NotExistsBuyer)
    }

    // ======================= Cargas de gasolina =======================

    /// Registra una carga de gasolina para un vehiculo. Solo admin.
    ///
    /// Valida que: el vehiculo exista y este Valid; el comprador este habilitado
    /// (Valid) para el vehiculo; exista un precio; y no se exceda el limite mensual.
    /// El precio se calcula con el precio vigente. Devuelve el id de la carga.
    pub fn register_purchase(
        env: Env,
        plate: String,
        identity_card: String,
        liters: u32,
    ) -> Result<u64, Error> {
        require_admin(&env);
        if liters == 0 {
            return Err(Error::InvalidLiters);
        }

        // Vehiculo
        let vehicle = exists_plate(&env, &plate)?;
        match vehicle.state {
            StateVehicle::Valid => {}
            StateVehicle::Stolen => return Err(Error::StolenVehicle),
            StateVehicle::Blocked => return Err(Error::VehicleBlocked),
            StateVehicle::NotValid | StateVehicle::NotUse => {
                return Err(Error::NoValidVehicle)
            }
        }

        // Comprador habilitado para el vehiculo
        let buyer_state = read_buyer_vehicle(&env, &plate, &identity_card)?;
        if buyer_state.state != StateBuyer::Valid {
            return Err(Error::BuyerNotAllowed);
        }

        // Precio
        let price_per_liter = Self::get_gasoline_price(env.clone())?;
        let price = price_per_liter * liters as i128;

        // Limite mensual
        let times = env.ledger().timestamp();
        let ym = year_month(times);
        let used = read_month_liters(&env, &plate, ym);
        let total_month = used + liters;
        let limit = Self::get_monthly_limit(env.clone());
        if limit != 0 && total_month > limit {
            log!(&env, "Limite mensual: usado {} + {} > {}", used, liters, limit);
            return Err(Error::ExceededMonthlyLimit);
        }

        // Guardar
        let id = next_id(&env, DataKey::PurchasesCounter);
        let purchase = Purchase {
            id,
            plate: plate.clone(),
            buyer_id: buyer_state.buyer_id,
            times,
            year_month: ym,
            liters,
            price_per_liter,
            price,
        };
        set_persistent(&env, &DataKey::Purchase(id), &purchase);
        set_persistent(&env, &DataKey::MonthlyLiters(plate.clone(), ym), &total_month);

        let count_key = DataKey::VehiclePurchaseCount(plate.clone());
        let index: u64 = env.storage().persistent().get(&count_key).unwrap_or(0);
        set_persistent(&env, &DataKey::VehiclePurchase(plate.clone(), index), &id);
        set_persistent(&env, &count_key, &(index + 1));

        EvtPurchase {
            plate,
            id,
            buyer_id: buyer_state.buyer_id,
            liters,
            price_per_liter,
            price,
            times,
        }
        .publish(&env);

        Ok(id)
    }

    /// Obtiene una carga por su id.
    pub fn get_purchase(env: Env, id: u64) -> Result<Purchase, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Purchase(id))
            .ok_or(Error::PurchaseNotExists)
    }

    /// Cantidad de cargas registradas para un vehiculo.
    pub fn get_vehicle_purchases_count(env: Env, plate: String) -> u64 {
        env.storage()
            .persistent()
            .get(&DataKey::VehiclePurchaseCount(plate))
            .unwrap_or(0)
    }

    /// Lista las cargas de un vehiculo, paginado (maximo 50 por llamada).
    pub fn list_vehicle_purchases(env: Env, plate: String, start: u64, limit: u32) -> Vec<Purchase> {
        let mut result = Vec::new(&env);
        let count = Self::get_vehicle_purchases_count(env.clone(), plate.clone());
        let end = count.min(start.saturating_add(limit.min(MAX_PAGE) as u64));
        let mut i = start;
        while i < end {
            let id: Option<u64> = env
                .storage()
                .persistent()
                .get(&DataKey::VehiclePurchase(plate.clone(), i));
            if let Some(id) = id {
                if let Some(p) = env.storage().persistent().get(&DataKey::Purchase(id)) {
                    result.push_back(p);
                }
            }
            i += 1;
        }
        result
    }

    /// Litros cargados por el vehiculo en el mes actual (hora de Bolivia).
    pub fn get_current_month_liters(env: Env, plate: String) -> u32 {
        let ym = year_month(env.ledger().timestamp());
        read_month_liters(&env, &plate, ym)
    }

    /// Litros cargados por el vehiculo en un mes dado (AAAAMM, ej. 202610).
    pub fn get_month_liters(env: Env, plate: String, year_month: u32) -> u32 {
        read_month_liters(&env, &plate, year_month)
    }
}
