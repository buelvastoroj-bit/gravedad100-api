import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Repositorio del recurso "Clase grupal".
 *
 * Cumple el mismo rol que ClaseRepositorioJdbc en el backend Spring, pero
 * usando persistencia en archivo JSON para que esta API se ejecute sin
 * dependencias externas (ni base de datos, ni paquetes de npm).
 *
 * @typedef {Object} Clase
 * @property {number} idClase
 * @property {string} nombre
 * @property {string} entrenador
 * @property {string} diaSemana
 * @property {string} horaInicio
 * @property {string} horaFin
 * @property {number} cupoMaximo
 * @property {number} cupoOcupado
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const RUTA_ARCHIVO = join(__dirname, "..", "..", "data", "clases.json");

function asegurarArchivo() {
  const carpeta = dirname(RUTA_ARCHIVO);
  if (!existsSync(carpeta)) mkdirSync(carpeta, { recursive: true });
  if (!existsSync(RUTA_ARCHIVO)) writeFileSync(RUTA_ARCHIVO, "[]", "utf-8");
}

function leerTodas() {
  asegurarArchivo();
  return JSON.parse(readFileSync(RUTA_ARCHIVO, "utf-8"));
}

function guardarTodas(clases) {
  writeFileSync(RUTA_ARCHIVO, JSON.stringify(clases, null, 2), "utf-8");
}

/** Lista todas las clases. @returns {Clase[]} */
export function listarClases() {
  return leerTodas();
}

/** Busca una clase por id. @returns {Clase|undefined} */
export function buscarPorId(idClase) {
  return leerTodas().find((c) => c.idClase === idClase);
}

/**
 * Crea una nueva clase, asignandole un id autoincremental.
 * @param {Object} datos
 * @returns {Clase} La clase creada.
 */
export function crearClase(datos) {
  const clases = leerTodas();
  const siguienteId = clases.reduce((maxId, c) => Math.max(maxId, c.idClase), 0) + 1;

  const nuevaClase = {
    idClase: siguienteId,
    nombre: String(datos.nombre).trim(),
    entrenador: String(datos.entrenador).trim(),
    diaSemana: datos.diaSemana,
    horaInicio: datos.horaInicio,
    horaFin: datos.horaFin,
    cupoMaximo: Number(datos.cupoMaximo),
    cupoOcupado: 0,
  };

  clases.push(nuevaClase);
  guardarTodas(clases);
  return nuevaClase;
}

/**
 * Actualiza una clase existente.
 * @returns {Clase|null} La clase actualizada, o null si no existia.
 */
export function actualizarClase(idClase, datos) {
  const clases = leerTodas();
  const indice = clases.findIndex((c) => c.idClase === idClase);
  if (indice === -1) return null;

  clases[indice] = {
    ...clases[indice],
    nombre: String(datos.nombre).trim(),
    entrenador: String(datos.entrenador).trim(),
    diaSemana: datos.diaSemana,
    horaInicio: datos.horaInicio,
    horaFin: datos.horaFin,
    cupoMaximo: Number(datos.cupoMaximo),
  };

  guardarTodas(clases);
  return clases[indice];
}

/** Elimina una clase por id. @returns {boolean} true si existia y se elimino. */
export function eliminarClase(idClase) {
  const clases = leerTodas();
  const nuevasClases = clases.filter((c) => c.idClase !== idClase);
  const seElimino = nuevasClases.length !== clases.length;
  if (seElimino) guardarTodas(nuevasClases);
  return seElimino;
}
