import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Repositorio del recurso "Plan de entrenamiento personalizado" (RF-03).
 *
 * Sigue el mismo patron que clienteRepository.js y claseRepository.js:
 * persistencia en archivo JSON, sin dependencias externas.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const RUTA_ARCHIVO = join(__dirname, "..", "..", "data", "planesEntrenamiento.json");

function asegurarArchivo() {
  const carpeta = dirname(RUTA_ARCHIVO);
  if (!existsSync(carpeta)) mkdirSync(carpeta, { recursive: true });
  if (!existsSync(RUTA_ARCHIVO)) writeFileSync(RUTA_ARCHIVO, "[]", "utf-8");
}
function leerTodos() { asegurarArchivo(); return JSON.parse(readFileSync(RUTA_ARCHIVO, "utf-8")); }
function guardarTodos(planes) { writeFileSync(RUTA_ARCHIVO, JSON.stringify(planes, null, 2), "utf-8"); }

/** Lista todos los planes de entrenamiento. */
export function listarPlanes() {
  return leerTodos();
}

/** Busca un plan por id. */
export function buscarPlanPorId(idPlan) {
  return leerTodos().find((p) => p.idPlan === idPlan);
}

/** Lista los planes de un cliente especifico. */
export function listarPlanesDeCliente(idCliente) {
  return leerTodos().filter((p) => p.idCliente === idCliente);
}

/** Crea un nuevo plan de entrenamiento, asignandole un id autoincremental. */
export function crearPlan(datos) {
  const planes = leerTodos();
  const siguienteId = planes.reduce((maxId, p) => Math.max(maxId, p.idPlan), 0) + 1;

  const nuevoPlan = {
    idPlan: siguienteId,
    idCliente: Number(datos.idCliente),
    objetivo: String(datos.objetivo).trim(),
    nivel: datos.nivel,
    duracionSemanas: Number(datos.duracionSemanas),
    observaciones: datos.observaciones ? String(datos.observaciones).trim() : "",
    fechaCreacion: new Date().toISOString(),
  };

  planes.push(nuevoPlan);
  guardarTodos(planes);
  return nuevoPlan;
}

/** Elimina un plan por id. */
export function eliminarPlan(idPlan) {
  const planes = leerTodos();
  const nuevosPlanes = planes.filter((p) => p.idPlan !== idPlan);
  const seElimino = nuevosPlanes.length !== planes.length;
  if (seElimino) guardarTodos(nuevosPlanes);
  return seElimino;
}