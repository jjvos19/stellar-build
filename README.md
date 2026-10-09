# PROYECTO BUY JERRYCAN GASOLINE

*Autor: Juan Jose Valencia O.*

Sistema para validar si un consumidor puede comprar gasolina en bidon.

El Contratos en Soroban debe tener:

* ✅ Variables
* ✅ Funciones
* ✅ contracttype
* ✅ storage
* ✅ Eventos
* ✅ Validaciones
* ✅ Pruebas unitarias
* ✅ Despliegue en *testnet*

## Situacion actual

Las gasolinerías deben vender en bidón un máximo de 120 litros al mes por placa de vehículo.
Para la venta el comprador debe presentar un documento de la ANH con el cual puede comprar gasolina en bidón.
El total de gasolina vendido se toma por placa, no por comprador.

## Problema

No se tiene un control real, otras personas pueden comprar indicando la placa de otra persona.
Para comprar debo llenar formulario cada vez.
En lugares lejanos las gasolinerías pueden vender sin control gasolina en bidón.

## Que se requiere

* Control en la venta de gasolina en bidón.
* Que en el sito se controle el total.
* Si ya tiene el límite permitido, salga una alerta LLEGO AL LIMITE, NO PUEDE COMPRAR.
* Antes de comprar le indique el máximo que puede comprar.
* En caso de compra por parte de un tercero, persona que no tiene el vehículo, este debe estar aprobado en el sistema.

## Alcance

El alcance del proyecto es:

* Registrar el vehiculo y cambiar los estados del vehiculo.
* Registar al comprador y sus estados.
* Registar un comprador por vehiculo.

[Smart Contract](buy-jerrycan-gasoline/README.md)
