#![no_std]
use soroban_sdk::{Address, Env, String, Vec, contract, contracterror, contractimpl, contracttype, vec};


#[contracttype]
enum DataKey {
    Admin,
    StateBuyer,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum StateVehicle{
    /// No se debe utilizar este estado.
    NotUse,
    /// Vehiculo valida para comprar.
    Valid,
    /// Vehiculo ya no es valida para comprar, no puede salir de este estado
    NotValid,
    /// Vehiculo robado, no se le vende
    Stolen,
    /// Vehiculo bloqueado, no se le vende porque llego al limite
    Blocked
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum StateBuyer {
    /// No se debe utilizar este estado.
    NotUse,
    /// El comprador puede comprar para la placa.
    Valid,
    /// El comprador no puede comprar para la placa
    Blocked,
    /// El comprador no podra comprar mas para el vehiculo. No puede cambiar de estado.
    NoValid
}

#[contracterror]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AllreadyInitialized = 1,
    ExceededMonthlyLimit = 2,
    StolenVehicle = 3,
    NoValidVehicle = 5,
    NotExistsBuyer = 6,
}

#[contract]
pub struct BuyJerrycanGasoline;

#[contractimpl]
impl BuyJerrycanGasoline{
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error>{
        if env.storage().instance().has(&DataKey::Admin){
            return Error(Error::AllreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set&DataKey::StateBuyer, &StateBuyer::Valid);
        ok();
    }
}


mod test;
