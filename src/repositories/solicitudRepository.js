import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Repositorio del recurso "Solicitud de atencion al cliente" (RF-04).
 * Sigue el mismo patron que entrenamientoRepository.js.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const RUTA_ARCHIVO = join(__dirname, "..", "..", "data", "solicitudes.json");

function asegurarArchivo() {
  const carpeta = dirname(RUTA_ARCHIVO);
  if (!existsSync(carpeta)) mkdirSync(carpeta, { recursive: true });
  if (!existsSync(RUTA_ARCHIVO)) writeFileSync(RUTA_ARCHIVO, "[]", "utf-8");
}
function leerTodas() { asegurarArchivo(); return JSON.parse(readFileSync(RUTA_ARCHIVO, "utf-8")); }
function guardarTodas(solicitudes) { writeFileSync(RUTA_ARCHIVO, JSON.stringify(solicitudes, null, 2), "utf-8"); }

/** Lista todas las solicitudes, de la mas reciente a la mas antigua. */
export function listarSolicitudes() {
  return leerTodas().sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));
}

/** Busca una solicitud por id. */
export function buscarSolicitudPorId(idSolicitud) {
  return leerTodas().find((s) => s.idSolicitud === idSolicitud);
}

/** Crea una nueva solicitud, en estado Pendiente. */
export function crearSolicitud(datos) {
  const solicitudes = leerTodas();
  const siguienteId = solicitudes.reduce((maxId, s) => Math.max(maxId, s.idSolicitud), 0) + 1;

  const nuevaSolicitud = {
    idSolicitud: siguienteId,
    idCliente: Number(datos.idCliente),
    asunto: String(datos.asunto).trim(),
    descripcion: String(datos.descripcion).trim(),
    estado: "Pendiente",
    respuesta: null,
    fechaCreacion: new Date().toISOString(),
    fechaResolucion: null,
  };

  solicitudes.push(nuevaSolicitud);
  guardarTodas(solicitudes);
  return nuevaSolicitud;
}

/** Marca una solicitud como resuelta, con una respuesta. Retorna null si no existia. */
export function resolverSolicitud(idSolicitud, respuesta) {
  const solicitudes = leerTodas();
  const indice = solicitudes.findIndex((s) => s.idSolicitud === idSolicitud);
  if (indice === -1) return null;

  solicitudes[indice] = {
    ...solicitudes[indice],
    estado: "Resuelta",
    respuesta,
    fechaResolucion: new Date().toISOString(),
  };

  guardarTodas(solicitudes);
  return solicitudes[indice];
}