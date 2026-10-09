//! Port de la libreria StringUtils.sol.
//!
//! `soroban_sdk::String` vive en el host y no expone sus bytes directamente,
//! por eso se copia a un buffer fijo en la pila para poder recortarlo.

use soroban_sdk::{Env, String};

use crate::Error;

/// Longitud maxima (en bytes) de una cadena que se puede recortar.
pub const MAX_STRING_LEN: usize = 256;

/// Quita los espacios (0x20) existentes a los lados de una cadena.
/// @param str Cadena a limpiar.
/// @return Devuelve la cadena sin espacios laterales.
pub fn trim(env: &Env, str: &String) -> Result<String, Error> {
    let len = str.len() as usize;
    if len == 0 {
        return Ok(String::from_str(env, ""));
    }
    if len > MAX_STRING_LEN {
        return Err(Error::StringTooLong);
    }

    let mut buf = [0u8; MAX_STRING_LEN];
    str.copy_into_slice(&mut buf[..len]);

    let mut start = 0usize;
    let mut end = len;

    // Primer caracter que no es espacio
    while start < end && buf[start] == b' ' {
        start += 1;
    }
    // Ultimo caracter que no es espacio
    while end > start && buf[end - 1] == b' ' {
        end -= 1;
    }

    Ok(String::from_bytes(env, &buf[start..end]))
}

/// Obtiene la longitud (en bytes) de una cadena.
pub fn length(str: &String) -> u32 {
    str.len()
}
