#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger, MockAuth, MockAuthInvoke},
    Address, Env, IntoVal, String,
};

// 2026-10-15 12:00 UTC
const OCT_15: u64 = 1_792_065_600;
// 2026-11-01 02:00 UTC = 31-oct 22:00 en Bolivia (sigue siendo octubre)
const OCT_31_BO: u64 = 1_793_498_400;
// 2026-11-01 05:00 UTC = 01-nov 01:00 en Bolivia
const NOV_01_BO: u64 = 1_793_509_200;

struct Ctx {
    env: Env,
    client: BuyGasolineJerrycanClient<'static>,
    contract_id: Address,
    admin: Address,
    user: Address,
}

fn setup() -> Ctx {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(OCT_15);
    let admin = Address::generate(&env);
    let contract_id = env.register(BuyGasolineJerrycan, (&admin,));
    let client = BuyGasolineJerrycanClient::new(&env, &contract_id);
    let user = Address::generate(&env);
    Ctx { env, client, contract_id, admin, user }
}

fn s(env: &Env, v: &str) -> String {
    String::from_str(env, v)
}

fn register_suzuki(c: &Ctx) {
    assert!(c.client.register_vehicle(
        &c.user,
        &s(&c.env, "4816STF"),
        &s(&c.env, "Suzuki"),
        &s(&c.env, "Grand Vitara"),
        &2020,
        &s(&c.env, "Plateado"),
    ));
}

fn register_juan(c: &Ctx, card: &str) {
    assert!(c.client.register_buyer(
        &c.user,
        &s(&c.env, "Juan Jose"),
        &s(&c.env, "Valencia O."),
        &s(&c.env, card),
        &71260680,
    ));
}

/// Vehiculo + comprador habilitado + precio 374 (Bs 3,74).
fn ready_to_buy(c: &Ctx) {
    register_suzuki(c);
    register_juan(c, "4569987");
    c.client
        .register_buyer_to_vehicle(&s(&c.env, "4816STF"), &s(&c.env, "4569987"));
    c.client.set_gasoline_price(&374);
}

// ======================= Funcionalidad original =======================

#[test]
fn registra_y_busca_vehiculo() {
    let c = setup();
    register_suzuki(&c);

    let v = c.client.find_vehicle(&s(&c.env, "4816STF"));
    assert_eq!(v.id, 1);
    assert_eq!(v.register_by, c.user);
    assert_eq!(v.state, StateVehicle::Valid);
    assert_eq!(c.client.vehicles_counter(), 1);
}

#[test]
fn placa_duplicada_y_placa_inexistente() {
    let c = setup();
    register_suzuki(&c);
    let r = c.client.try_register_vehicle(
        &c.user,
        &s(&c.env, "4816STF"),
        &s(&c.env, "Toyota"),
        &s(&c.env, "Hilux"),
        &2018,
        &s(&c.env, "Blanco"),
    );
    assert_eq!(r, Err(Ok(Error::PlateExists)));
    assert_eq!(
        c.client.try_find_vehicle(&s(&c.env, "0000XXX")),
        Err(Ok(Error::PlateNotExists))
    );
}

#[test]
fn cambio_de_estado_y_bloqueo_no_valid() {
    let c = setup();
    register_suzuki(&c);
    let plate = s(&c.env, "4816STF");

    assert_eq!(
        c.client.change_state_vehicle(&plate, &StateVehicle::Stolen).state,
        StateVehicle::Stolen
    );
    c.client.change_state_vehicle(&plate, &StateVehicle::NotValid);
    assert_eq!(
        c.client.try_change_state_vehicle(&plate, &StateVehicle::Valid),
        Err(Ok(Error::NoValidVehicle))
    );
}

#[test]
fn comprador_carnet_recortado_vacio_y_duplicado() {
    let c = setup();
    register_juan(&c, "  4569987  ");
    assert_eq!(
        c.client.find_buyer(&s(&c.env, "4569987")).identity_card,
        s(&c.env, "4569987")
    );

    let r = c.client.try_register_buyer(
        &c.user,
        &s(&c.env, "A"),
        &s(&c.env, "B"),
        &s(&c.env, "    "),
        &1,
    );
    assert_eq!(r, Err(Ok(Error::BlankIdentityCard)));

    let r = c.client.try_register_buyer(
        &c.user,
        &s(&c.env, "Otro"),
        &s(&c.env, "Nombre"),
        &s(&c.env, " 4569987"),
        &2,
    );
    assert_eq!(r, Err(Ok(Error::BuyerExists)));
}

#[test]
fn comprador_por_vehiculo() {
    let c = setup();
    register_suzuki(&c);
    register_juan(&c, "4569987");
    let plate = s(&c.env, "4816STF");
    let card = s(&c.env, "4569987");

    assert_eq!(
        c.client.try_find_buyer_by_vehicle(&plate, &card),
        Err(Ok(Error::BuyerVehicleNotExists))
    );
    assert!(c.client.register_buyer_to_vehicle(&plate, &card));
    assert_eq!(
        c.client.try_register_buyer_to_vehicle(&plate, &card),
        Err(Ok(Error::BuyerVehicleExists))
    );
    assert_eq!(
        c.client
            .find_buyer_by_vehicle(&plate, &s(&c.env, " 4569987 "))
            .names,
        s(&c.env, "Juan Jose")
    );
}

// ======================= Administrador =======================

#[test]
fn constructor_define_admin() {
    let c = setup();
    assert_eq!(c.client.get_admin(), c.admin);
}

#[test]
fn funciones_de_admin_exigen_firma_del_admin() {
    let c = setup();
    register_suzuki(&c);

    c.client
        .change_state_vehicle(&s(&c.env, "4816STF"), &StateVehicle::Blocked);
    assert_eq!(c.env.auths()[0].0, c.admin);

    c.client.set_gasoline_price(&374);
    assert_eq!(c.env.auths()[0].0, c.admin);
}

#[test]
fn no_admin_no_puede_cambiar_precio() {
    let c = setup();
    let intruder = Address::generate(&c.env);

    // Solo se simula la firma del intruso, no la del admin.
    c.env.mock_auths(&[MockAuth {
        address: &intruder,
        invoke: &MockAuthInvoke {
            contract: &c.contract_id,
            fn_name: "set_gasoline_price",
            args: (100i128,).into_val(&c.env),
            sub_invokes: &[],
        },
    }]);
    assert!(c.client.try_set_gasoline_price(&100).is_err());
}

#[test]
fn transferir_admin() {
    let c = setup();
    let new_admin = Address::generate(&c.env);
    c.client.set_admin(&new_admin);
    assert_eq!(c.client.get_admin(), new_admin);
}

// ======================= Precio =======================

#[test]
fn precio_de_gasolina() {
    let c = setup();
    assert_eq!(c.client.try_get_gasoline_price(), Err(Ok(Error::PriceNotSet)));
    assert_eq!(c.client.try_set_gasoline_price(&0), Err(Ok(Error::InvalidPrice)));

    c.client.set_gasoline_price(&374);
    assert_eq!(c.client.get_gasoline_price(), 374);
    c.client.set_gasoline_price(&550);
    assert_eq!(c.client.get_gasoline_price(), 550);
}

// ======================= Cargas =======================

#[test]
fn registra_carga_y_calcula_precio() {
    let c = setup();
    ready_to_buy(&c);
    let plate = s(&c.env, "4816STF");

    let id = c.client.register_purchase(&plate, &s(&c.env, "4569987"), &20);
    assert_eq!(id, 1);

    let p = c.client.get_purchase(&id);
    assert_eq!(p.liters, 20);
    assert_eq!(p.price_per_liter, 374);
    assert_eq!(p.price, 7_480); // Bs 74,80
    assert_eq!(p.buyer_id, 1);
    assert_eq!(p.times, OCT_15);
    assert_eq!(p.year_month, 202_610);

    assert_eq!(c.client.purchases_counter(), 1);
    assert_eq!(c.client.get_vehicle_purchases_count(&plate), 1);
    assert_eq!(c.client.get_current_month_liters(&plate), 20);
}

#[test]
fn carga_usa_el_precio_vigente() {
    let c = setup();
    ready_to_buy(&c);
    let plate = s(&c.env, "4816STF");
    let card = s(&c.env, "4569987");

    c.client.register_purchase(&plate, &card, &10);
    c.client.set_gasoline_price(&500);
    c.client.register_purchase(&plate, &card, &10);

    let list = c.client.list_vehicle_purchases(&plate, &0, &10);
    assert_eq!(list.len(), 2);
    assert_eq!(list.get(0).unwrap().price, 3_740);
    assert_eq!(list.get(1).unwrap().price, 5_000);

    let page = c.client.list_vehicle_purchases(&plate, &1, &10);
    assert_eq!(page.len(), 1);
    assert_eq!(page.get(0).unwrap().id, 2);
}

#[test]
fn carga_rechazada_por_estado_del_vehiculo() {
    let c = setup();
    ready_to_buy(&c);
    let plate = s(&c.env, "4816STF");
    let card = s(&c.env, "4569987");

    c.client.change_state_vehicle(&plate, &StateVehicle::Stolen);
    assert_eq!(
        c.client.try_register_purchase(&plate, &card, &10),
        Err(Ok(Error::StolenVehicle))
    );
    c.client.change_state_vehicle(&plate, &StateVehicle::Blocked);
    assert_eq!(
        c.client.try_register_purchase(&plate, &card, &10),
        Err(Ok(Error::VehicleBlocked))
    );
    c.client.change_state_vehicle(&plate, &StateVehicle::NotValid);
    assert_eq!(
        c.client.try_register_purchase(&plate, &card, &10),
        Err(Ok(Error::NoValidVehicle))
    );
}

#[test]
fn carga_rechazada_por_comprador() {
    let c = setup();
    ready_to_buy(&c);
    let plate = s(&c.env, "4816STF");
    let card = s(&c.env, "4569987");

    // Comprador registrado pero no habilitado para el vehiculo
    c.client.register_buyer(
        &c.user,
        &s(&c.env, "Ana"),
        &s(&c.env, "Perez"),
        &s(&c.env, "111"),
        &1,
    );
    assert_eq!(
        c.client.try_register_purchase(&plate, &s(&c.env, "111"), &10),
        Err(Ok(Error::BuyerVehicleNotExists))
    );

    // Comprador bloqueado
    c.client
        .change_state_buyer_vehicle(&plate, &card, &StateBuyer::Blocked);
    assert_eq!(
        c.client.try_register_purchase(&plate, &card, &10),
        Err(Ok(Error::BuyerNotAllowed))
    );

    // NoValid es definitivo
    c.client
        .change_state_buyer_vehicle(&plate, &card, &StateBuyer::NoValid);
    assert_eq!(
        c.client
            .try_change_state_buyer_vehicle(&plate, &card, &StateBuyer::Valid),
        Err(Ok(Error::BuyerStateLocked))
    );

    assert_eq!(
        c.client.try_register_purchase(&plate, &card, &0),
        Err(Ok(Error::InvalidLiters))
    );
}

#[test]
fn carga_sin_precio() {
    let c = setup();
    register_suzuki(&c);
    register_juan(&c, "4569987");
    let plate = s(&c.env, "4816STF");
    let card = s(&c.env, "4569987");
    c.client.register_buyer_to_vehicle(&plate, &card);

    assert_eq!(
        c.client.try_register_purchase(&plate, &card, &10),
        Err(Ok(Error::PriceNotSet))
    );
}

#[test]
fn limite_mensual_con_hora_de_bolivia() {
    let c = setup();
    ready_to_buy(&c);
    let plate = s(&c.env, "4816STF");
    let card = s(&c.env, "4569987");
    c.client.set_monthly_limit(&50);

    c.client.register_purchase(&plate, &card, &30);
    c.client.register_purchase(&plate, &card, &20); // llega justo a 50
    assert_eq!(
        c.client.try_register_purchase(&plate, &card, &1),
        Err(Ok(Error::ExceededMonthlyLimit))
    );

    // 31-oct 22:00 en Bolivia: todavia es octubre
    c.env.ledger().set_timestamp(OCT_31_BO);
    assert_eq!(
        c.client.try_register_purchase(&plate, &card, &1),
        Err(Ok(Error::ExceededMonthlyLimit))
    );

    // 01-nov 01:00 en Bolivia: mes nuevo
    c.env.ledger().set_timestamp(NOV_01_BO);
    c.client.register_purchase(&plate, &card, &50);
    assert_eq!(c.client.get_current_month_liters(&plate), 50);
    assert_eq!(c.client.get_month_liters(&plate, &202_610), 50);
}

#[test]
fn calculo_de_mes() {
    assert_eq!(year_month(OCT_15), 202_610);
    assert_eq!(year_month(OCT_31_BO), 202_610);
    assert_eq!(year_month(NOV_01_BO), 202_611);
    assert_eq!(year_month(1_709_208_000), 202_402); // 29-feb-2024 (bisiesto)
}
