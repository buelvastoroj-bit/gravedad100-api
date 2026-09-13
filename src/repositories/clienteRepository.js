import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Repositorio del recurso "Cliente" y de sus check-ins (registro de
 * llegada al gimnasio).
 *
 * Sigue el mismo patron que claseRepository.js: persistencia en archivo
 * JSON, sin dependencias externas.
 *
 * @typedef {Object} Cliente
 * @property {number} idCliente
 * @property {string} nombre
 * @property {string} documento
 * @property {string} telefono
 * @property {string} fechaRegistro
 *
 * @typedef {Object} Checkin
 * @property {number} idCheckin
 * @property {number} idCliente
 * @property {string} fechaHora
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const RUTA_CLIENTES = join(__dirname, "..", "..", "data", "clientes.json");
const RUTA_CHECKINS = join(__dirname, "..", "..", "data", "checkins.json");

function asegurarArchivo(ruta) {
  const carpeta = dirname(ruta);
  if (!existsSync(carpeta)) mkdirSync(carpeta, { recursive: true });
  if (!existsSync(ruta)) writeFileSync(ruta, "[]", "utf-8");
}

function leerJSON(ruta) {
  asegurarArchivo(ruta);
  return JSON.parse(readFileSync(ruta, "utf-8"));
}

function guardarJSON(ruta, datos) {
  writeFileSync(ruta, JSON.stringify(datos, null, 2), "utf-8");
}

/** Lista todos los clientes. @returns {Cliente[]} */
export function listarClientes() {
  return leerJSON(RUTA_CLIENTES);
}

/** Busca un cliente por id. @returns {Cliente|undefined} */
export function buscarClientePorId(idCliente) {
  return leerJSON(RUTA_CLIENTES).find((c) => c.idCliente === idCliente);
}

/** Busca un cliente por numero de documento. @returns {Cliente|undefined} */
export function buscarClientePorDocumento(documento) {
  return leerJSON(RUTA_CLIENTES).find((c) => c.documento === documento);
}

/** Crea un nuevo cliente, asignandole un id autoincremental. @returns {Cliente} */
export function crearCliente(datos) {
  const clientes = leerJSON(RUTA_CLIENTES);
  const siguienteId = clientes.reduce((maxId, c) => Math.max(maxId, c.idCliente), 0) + 1;

  const nuevoCliente = {
    idCliente: siguienteId,
    nombre: String(datos.nombre).trim(),
    documento: String(datos.documento).trim(),
    telefono: datos.telefono ? String(datos.telefono).trim() : "",
    fechaRegistro: new Date().toISOString(),
  };

  clientes.push(nuevoCliente);
  guardarJSON(RUTA_CLIENTES, clientes);
  return nuevoCliente;
}

/** Lista todos los check-ins, del mas reciente al mas antiguo. @returns {Checkin[]} */
export function listarCheckins() {
  return leerJSON(RUTA_CHECKINS).sort((a, b) => b.fechaHora.localeCompare(a.fechaHora));
}

/** Registra un check-in nuevo para un cliente. @returns {Checkin} */
export function crearCheckin(idCliente) {
  const checkins = leerJSON(RUTA_CHECKINS);
  const siguienteId = checkins.reduce((maxId, c) => Math.max(maxId, c.idCheckin), 0) + 1;

  const nuevoCheckin = {
    idCheckin: siguienteId,
    idCliente,
    fechaHora: new Date().toISOString(),
  };

  checkins.push(nuevoCheckin);
  guardarJSON(RUTA_CHECKINS, checkins);
  return nuevoCheckin;
}