import { createHmac } from "node:crypto";

/**
 * Utilidad para generar y verificar tokens de sesion firmados, usando el
 * modulo nativo "crypto" de Node.js (sin dependencias externas como
 * jsonwebtoken), manteniendo la misma filosofia del resto de la API.
 *
 * El token no es secreto en si mismo (viaja como texto), pero su firma
 * garantiza que no pudo haber sido fabricado ni modificado sin conocer
 * la clave secreta del servidor (TOKEN_SECRET).
 */

const DURACION_MS = 2 * 60 * 60 * 1000; // 2 horas

const SECRETO = process.env.TOKEN_SECRET;
if (!SECRETO) {
  console.warn(
    "ADVERTENCIA: TOKEN_SECRET no esta definida. Se usa una clave temporal " +
    "SOLO para desarrollo local; configura una real antes de producción."
  );
}
const secretoEfectivo = SECRETO || "clave-temporal-de-desarrollo-cambiar";

/** Genera un token firmado para el usuario ya autenticado. */
export function generarToken(usuario) {
  const expiracion = Date.now() + DURACION_MS;
  const payload = `${Buffer.from(usuario).toString("base64")}.${expiracion}`;
  const firma = createHmac("sha256", secretoEfectivo).update(payload).digest("hex");
  return `${payload}.${firma}`;
}

/**
 * Verifica un token recibido en una peticion. Retorna el nombre de
 * usuario si es valido, o lanza un Error describiendo el motivo si no.
 */
export function verificarToken(token) {
  if (!token) throw new Error("Token no proporcionado.");

  const partes = token.split(".");
  if (partes.length !== 3) throw new Error("Token con formato invalido.");

  const [usuarioBase64, expiracionStr, firma] = partes;
  const payload = `${usuarioBase64}.${expiracionStr}`;
  const firmaEsperada = createHmac("sha256", secretoEfectivo).update(payload).digest("hex");

  if (firma !== firmaEsperada) {
    throw new Error("Token invalido.");
  }
  if (Date.now() > Number(expiracionStr)) {
    throw new Error("Token expirado, inicia sesion de nuevo.");
  }
  return Buffer.from(usuarioBase64, "base64").toString("utf-8");
}