import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Utilidad de hashing de contrasenas usando scrypt (modulo nativo "crypto"
 * de Node.js). Las contrasenas NUNCA se almacenan en texto plano: se
 * guarda unicamente el hash junto con la sal (salt) usada para generarlo.
 */

const LONGITUD_CLAVE = 64;

/**
 * Genera el hash de una contrasena con una sal aleatoria nueva.
 *
 * @param {string} contrasena - Contrasena en texto plano.
 * @returns {{ hash: string, sal: string }} El hash y la sal en hexadecimal,
 *          listos para guardar en el repositorio de usuarios.
 */
export function hashearContrasena(contrasena) {
  const sal = randomBytes(16).toString("hex");
  const hash = scryptSync(contrasena, sal, LONGITUD_CLAVE).toString("hex");
  return { hash, sal };
}

/**
 * Verifica si una contrasena en texto plano coincide con un hash guardado.
 *
 * Se usa timingSafeEqual para comparar los buffers, evitando que un
 * atacante pueda deducir informacion midiendo el tiempo de respuesta
 * (ataque de temporizacion).
 *
 * @param {string} contrasena - Contrasena en texto plano a verificar.
 * @param {string} hashGuardado - Hash almacenado en el repositorio.
 * @param {string} sal - Sal usada originalmente para generar el hash.
 * @returns {boolean} true si la contrasena coincide.
 */
export function verificarContrasena(contrasena, hashGuardado, sal) {
  const hashCalculado = scryptSync(contrasena, sal, LONGITUD_CLAVE);
  const bufferGuardado = Buffer.from(hashGuardado, "hex");

  // Los buffers deben tener la misma longitud antes de comparar,
  // timingSafeEqual lanza un error si difieren en tamano.
  if (hashCalculado.length !== bufferGuardado.length) {
    return false;
  }

  return timingSafeEqual(hashCalculado, bufferGuardado);
}
