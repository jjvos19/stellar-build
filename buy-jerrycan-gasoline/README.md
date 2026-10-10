# Soroban Project

## Project Structure

This repository uses the recommended structure for a Soroban project:

```text
.
├── contracts
│   └── hello_world
│       ├── src
│       │   ├── lib.rs
│       │   └── test.rs
│       └── Cargo.toml
├── Cargo.toml
└── README.md
```

- New Soroban contracts can be put in `contracts`, each in their own directory. There is already a `hello_world` contract in there to get you started.
- If you initialized this project with any other example contracts via `--with-example`, those contracts will be in the `contracts` directory as well.
- Contracts should have their own `Cargo.toml` files that rely on the top-level `Cargo.toml` workspace for their dependencies.
- Frontend libraries can be added to the top-level directory as well. If you initialized this project with a frontend template via `--frontend-template` you will have those files already included.

## Compila el contrato

Se compila el contrato

```bash
stellar contract build --out-dir ./target

ℹ️ CARGO_BUILD_RUSTFLAGS='--remap-path-prefix=C:/Users/jjvos19/.cargo/registry/src=' SOROBAN_SDK_BUILD_SYSTEM_SUPPORTS_SPEC_SHAKING_V2=1 cargo rustc '--manifest-path=contracts\buy-jerrycan-gasoline\Cargo.toml' --crate-type=cdylib --target=wasm32v1-none --release
⚠️ A new release of Stellar CLI is available: 27.1.0 -> 28.1.0
   Compiling either v1.19.0
   Compiling itertools v0.13.0
   Compiling soroban-env-macros v27.0.1
   Compiling soroban-env-common v27.0.1
   Compiling soroban-env-guest v27.0.1
   Compiling soroban-sdk-macros v27.0.6
   Compiling soroban-sdk v27.0.6
   Compiling buy-jerrycan-gasoline v0.0.0 (D:\Desarrollo\blockchain\stellar\s-elite\stellar-build\buy-jerrycan-gasoline\contracts\buy-jerrycan-gasoline)
    Finished `release` profile [optimized] target(s) in 32.07s
ℹ️ Build Summary:
   Wasm File: ./target\buy_jerrycan_gasoline.wasm (23651 bytes optimized (original size was 27016 bytes))
   Wasm Hash: 30780f60a7e24d349f5066d8edcd57d67597d2fb6322a1bf4627d8bcf6e51120
   Wasm Size: 23651 bytes optimized (original size was 27016 bytes)
   Exported Functions: 26 found
     • __constructor
     • buyers_counter
     • change_state_buyer_vehicle
     • change_state_vehicle
     • find_buyer
     • find_buyer_by_vehicle
     • find_vehicle
     • get_admin
     • get_current_month_liters
     • get_gasoline_price
     • get_month_liters
     • get_monthly_limit
     • get_purchase
     • get_state_buyer_vehicle
     • get_state_vehicle
     • get_vehicle_purchases_count
     • list_vehicle_purchases
     • purchases_counter
     • register_buyer
     • register_buyer_to_vehicle
     • register_purchase
     • register_vehicle
     • set_admin
     • set_gasoline_price
     • set_monthly_limit
     • vehicles_counter
✅ Build Complete
```

## Pruebas del contrato

Se realizan las pruebas al contrato

```bash
cargo test --target-dir ./target
   Compiling proc-macro2 v1.0.107
   Compiling quote v1.0.47
   Compiling unicode-ident v1.0.26
   Compiling version_check v0.9.5
   Compiling cfg-if v1.0.5
   Compiling serde_core v1.0.229
   Compiling zmij v1.0.23
   Compiling serde v1.0.229
   Compiling typenum v1.20.1
   Compiling serde_json v1.0.151
   Compiling itoa v1.0.18
   Compiling memchr v2.8.3
   Compiling generic-array v0.14.9
   Compiling subtle v2.6.1
   Compiling autocfg v1.5.1
   Compiling const-oid v0.9.6
   Compiling getrandom v0.2.17
   Compiling ident_case v1.0.1
   Compiling rand_core v0.6.4
   Compiling strsim v0.11.1
   Compiling semver v1.0.28
   Compiling num-traits v0.2.19
   Compiling cpufeatures v0.2.17
   Compiling syn v2.0.119
   Compiling syn v3.0.6
   Compiling zerocopy v0.8.61
   Compiling schemars v0.8.22
   Compiling dyn-clone v1.0.20
   Compiling paste v1.0.15
   Compiling data-encoding v2.11.1
   Compiling rustc_version v0.4.1
   Compiling num-integer v0.1.47
   Compiling block-buffer v0.10.4
   Compiling crypto-common v0.1.6
   Compiling ethnum v1.5.3
   Compiling digest v0.10.7
   Compiling escape-bytes v0.1.1
   Compiling num-bigint v0.4.8
   Compiling sha2 v0.10.9
   Compiling ff v0.13.1
   Compiling ahash v0.8.12
   Compiling darling_core v0.24.1
   Compiling arrayvec v0.7.8
   Compiling equivalent v1.0.2
   Compiling either v1.19.0
   Compiling base16ct v0.2.0
   Compiling hashbrown v0.17.1
   Compiling itertools v0.13.0
   Compiling ppv-lite86 v0.2.21
   Compiling indexmap v2.14.2
   Compiling group v0.13.0
   Compiling allocator-api2 v0.2.21
   Compiling libm v0.2.16
   Compiling rand_chacha v0.3.1
   Compiling once_cell v1.21.4
   Compiling base64 v0.22.1
   Compiling serde_derive v1.0.229
   Compiling enum-ordinalize-derive v4.4.2
   Compiling rand v0.8.8
   Compiling wasmparser v0.116.1
   Compiling hashbrown v0.15.5
   Compiling hybrid-array v0.4.15
   Compiling zeroize_derive v1.5.0
   Compiling cfg_eval v0.1.2
   Compiling ark-std v0.5.0
   Compiling enum-ordinalize v4.4.2
   Compiling ark-serialize-derive v0.5.0
   Compiling ark-ff-macros v0.5.0
   Compiling zeroize v1.9.1
   Compiling educe v0.6.0
   Compiling ark-ff-asm v0.5.0
   Compiling der v0.7.10
   Compiling thiserror v1.0.69
   Compiling darling_macro v0.24.1
   Compiling crypto-bigint v0.5.5
   Compiling curve25519-dalek-derive v0.1.1
   Compiling darling v0.24.1
   Compiling serde_with_macros v3.24.0
   Compiling sec1 v0.7.3
   Compiling ark-serialize v0.5.0
   Compiling signature v2.2.0
   Compiling hmac v0.12.1
   Compiling derive_arbitrary v1.3.2
   Compiling rfc6979 v0.4.0
   Compiling num-derive v0.4.2
   Compiling thiserror-impl v1.0.69
   Compiling elliptic-curve v0.13.8
   Compiling crate-git-revision v0.0.6
   Compiling hex v0.4.3
   Compiling curve25519-dalek v4.1.3
   Compiling stellar-strkey v0.0.13
   Compiling stellar-xdr v27.0.0
   Compiling ark-ff v0.5.0
   Compiling indexmap-nostd v0.4.0
   Compiling downcast-rs v1.2.1
   Compiling static_assertions v1.1.0
   Compiling wasmparser-nostd v0.100.2
   Compiling soroban-env-common v27.0.1
   Compiling ecdsa v0.16.9
   Compiling arbitrary v1.3.2
   Compiling serde_with v3.24.0
   Compiling wasmi_core v0.13.0
   Compiling block-buffer v0.12.1
   Compiling crypto-common v0.2.2
   Compiling curve25519-dalek v5.0.0
   Compiling prettyplease v0.2.37
   Compiling spin v0.9.9
   Compiling fnv v1.0.7
   Compiling smallvec v1.16.2
   Compiling wasmi_arena v0.4.1
   Compiling soroban-wasmi v0.31.1-soroban.20.0.1
   Compiling darling_core v0.20.11
   Compiling digest v0.11.3
   Compiling ark-poly v0.5.0
   Compiling primeorder v0.13.6
   Compiling ed25519 v2.2.3
   Compiling soroban-env-host v27.0.1
   Compiling ark-ec v0.5.0
   Compiling keccak v0.1.6
   Compiling heapless v0.8.0
   Compiling cpufeatures v0.3.1
   Compiling byteorder v1.5.0
   Compiling hash32 v0.3.1
   Compiling ed25519-dalek v2.2.0
   Compiling sha3 v0.10.9
   Compiling p256 v0.13.2
   Compiling ark-bn254 v0.5.0
   Compiling ark-bls12-381 v0.5.0
   Compiling k256 v0.13.4
   Compiling darling_macro v0.20.11
   Compiling stellar-strkey v0.0.16
   Compiling crate-git-revision v0.0.9
   Compiling soroban-builtin-sdk-macros v27.0.1
   Compiling stable_deref_trait v1.2.1
   Compiling hex-literal v0.4.1
   Compiling dtor-proc-macro v0.0.6
   Compiling soroban-sdk v27.0.6
   Compiling dtor v0.1.1
   Compiling darling v0.20.11
   Compiling macro-string v0.1.4
   Compiling heck v0.5.0
   Compiling ctor-proc-macro v0.0.6
   Compiling bytes-lit v0.0.6
   Compiling visibility v0.1.1
   Compiling ctor v0.5.0
   Compiling soroban-spec v27.0.6
   Compiling soroban-spec-rust v27.0.6
   Compiling soroban-env-macros v27.0.1
   Compiling soroban-sdk-macros v27.0.6
   Compiling soroban-ledger-snapshot v27.0.6
   Compiling buy-jerrycan-gasoline v0.0.0 (D:\Desarrollo\blockchain\stellar\s-elite\stellar-build\buy-jerrycan-gasoline\contracts\buy-jerrycan-gasoline)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 3m 25s
     Running unittests src\lib.rs (target\debug\deps\buy_jerrycan_gasoline-88c2f8ce6259bfb8.exe)

running 17 tests
test test::calculo_de_mes ... ok
test test::constructor_define_admin ... ok
test test::comprador_carnet_recortado_vacio_y_duplicado ... ok
test test::carga_sin_precio ... ok
test test::cambio_de_estado_y_bloqueo_no_valid ... ok
test test::comprador_por_vehiculo ... ok
test test::no_admin_no_puede_cambiar_precio ... ok
test test::carga_rechazada_por_estado_del_vehiculo ... ok
test test::funciones_de_admin_exigen_firma_del_admin ... ok
test test::placa_duplicada_y_placa_inexistente ... ok
test test::transferir_admin ... ok
test test::precio_de_gasolina ... ok
test test::registra_y_busca_vehiculo ... ok
test test::carga_rechazada_por_comprador ... ok
test test::carga_usa_el_precio_vigente ... ok
test test::registra_carga_y_calcula_precio ... ok
test test::limite_mensual_con_hora_de_bolivia ... ok

test result: ok. 17 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.59s
```

## Publicar contrato

Se procede a publicar el contrato, considerar que el contrato incluye un constructor que requiere la wallet del administrador.

```bash
WALLET=$(stellar keys address juanjo)

stellar contract deploy \
  --wasm target/buy_jerrycan_gasoline.wasm \
  --source-account juanjo \
  --network testnet \
  --alias gasoline \
  -- \
  --admin $WALLET
  
  
ℹ️ Uploading contract WASM…
⚠️ A new release of Stellar CLI is available: 27.1.0 -> 28.1.0
ℹ️ Skipping install because wasm already installed
ℹ️ Deploying contract using wasm hash 30780f60a7e24d349f5066d8edcd57d67597d2fb6322a1bf4627d8bcf6e51120
ℹ️ Simulating transaction…
ℹ️ Signing transaction: e504a83a1f886555025ed7f0d414c779bb491cbef071cdfa7146dd55532b9b02
🌎 Sending transaction…
✅ Transaction submitted successfully!
🔗 https://stellar.expert/explorer/testnet/tx/e504a83a1f886555025ed7f0d414c779bb491cbef071cdfa7146dd55532b9b02
🔗 https://lab.stellar.org/r/testnet/contract/CC7XIIG5OXBLTKKN455XNWV4IAR6FD6P2GW3VXJQQO5BVSXAVGXF5LHL
✅ Deployed!
CC7XIIG5OXBLTKKN455XNWV4IAR6FD6P2GW3VXJQQO5BVSXAVGXF5LHL

```

## Registra vehiculo

Para registrar el vehiculo correr:

```bash
stellar contract invoke \
  --id $CONTRATO \
  --source-account juanjo \
  --network testnet \
  -- register_vehicle \
  --register_by $WALLET \
  --plate "P123" \
  --brand "Suzuki" \
  --model "Grand Vitara" \
  --year 2020 \
  --color "NEGRO" 

⚠️ A new release of Stellar CLI is available: 27.1.0 -> 28.1.0
ℹ️ Simulating transaction…
ℹ️ Signing transaction: a49cfbd784bcb5e0ea17521fb9cee06655908ca218085eb1646f906b5710f3f2
🌎 Sending transaction…
✅ Transaction submitted successfully!
🔗 https://stellar.expert/explorer/testnet/tx/a49cfbd784bcb5e0ea17521fb9cee06655908ca218085eb1646f906b5710f3f2
📅 CC7XIIG5OXBLTKKN455XNWV4IAR6FD6P2GW3VXJQQO5BVSXAVGXF5LHL - Success - Event: EvtRegisterVehicle (evt_register_vehicle), plate: "P123", id: 1, register_by: "GCA7QQ6FRH5AN4RCGIUU7WWBFM4RCLFKZK55K7BUCWNHOL4AA6NXTLUH", brand: "Suzuki", model: "Grand Vitara", year: 2020, color: "NEGRO", state: 1
true

```

## Binding del contrato

Para generar los binding de TypeScript del contrato para un frontend en *react*, ejecutar el comando:

```bash
stellar contract bindings typescript \
  --network testnet \
  --contract-id $CONTRATO \
  --output-dir ./target/packages/buy-jerrycan-gasoline \
  --overwrite

ℹ️ Network: Test SDF Network ; September 2015
🌎 Downloading contract spec: CC7XIIG5OXBLTKKN455XNWV4IAR6FD6P2GW3VXJQQO5BVSXAVGXF5LHL
⚠️ A new release of Stellar CLI is available: 27.1.0 -> 28.1.0
ℹ️ Embedding contract address: CC7XIIG5OXBLTKKN455XNWV4IAR6FD6P2GW3VXJQQO5BVSXAVGXF5LHL
✅ Generated!
ℹ️ Run "npm install && npm run build" in "./target/packages/buy-jerrycan-gasoline" to build the JavaScript NPM package.
```

Una vez generado, copiar la carpeta al proyecto de frontend.
