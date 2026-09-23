import { leerCuerpoJSON, enviarJSON } from "../utils/httpUtils.js";
import {
  listarPlanes,
  crearPlanEntrenamiento,
  eliminarPlanEntrenamiento,
  ErrorDeNegocio,
} from "../services/entrenamientoService.js";

/** Controlador HTTP del recurso "Planes de entrenamiento" (RF-03). */

/** GET /api/planes-entrenamiento */
export async function manejarListarPlanes(req, res) {
  const planes = listarPlanes();
  enviarJSON(res, 200, { total: planes.length, planes });
}

/** POST /api/planes-entrenamiento */
export async function manejarCrearPlan(req, res) {
  try {
    const datos = await leerCuerpoJSON(req);
    const plan = crearPlanEntrenamiento(datos);
    enviarJSON(res, 201, { mensaje: "Plan de entrenamiento creado correctamente.", plan });
  } catch (error) {
    manejarError(res, error);
  }
}

/** DELETE /api/planes-entrenamiento/:id */
export async function manejarEliminarPlan(req, res, idPlan) {
  try {
    eliminarPlanEntrenamiento(idPlan);
    enviarJSON(res, 200, { mensaje: "Plan de entrenamiento eliminado correctamente." });
  } catch (error) {
    manejarError(res, error);
  }
}

function manejarError(res, error) {
  if (error instanceof ErrorDeNegocio) {
    enviarJSON(res, error.codigoEstado, { mensaje: error.message });
    return;
  }
  if (error.message?.includes("JSON")) {
    enviarJSON(res, 400, { mensaje: error.message });
    return;
  }
  console.error("Error inesperado:", error);
  enviarJSON(res, 500, { mensaje: "Error interno del servidor." });
}