import { leerCuerpoJSON, enviarJSON } from "../utils/httpUtils.js";
import {
  listarClases,
  obtenerClase,
  programarClase,
  editarClase,
  eliminarClasePorId,
  ErrorDeNegocio,
} from "../services/claseService.js";

/**
 * Controlador HTTP del recurso "Clases" (equivalente a ClaseController en
 * el backend Spring), expuesto ahora como una API REST en JSON en lugar
 * de vistas JSP, para que pueda ser consumida por el componente frontend
 * en React (evidencia AA4_EV03) u otros clientes.
 */

/** GET /api/clases */
export async function manejarListar(req, res) {
  const clases = listarClases();
  enviarJSON(res, 200, { total: clases.length, clases });
}

/** GET /api/clases/:id */
export async function manejarObtener(req, res, idClase) {
  try {
    const clase = obtenerClase(idClase);
    enviarJSON(res, 200, clase);
  } catch (error) {
    manejarError(res, error);
  }
}

/** POST /api/clases */
export async function manejarCrear(req, res) {
  try {
    const datos = await leerCuerpoJSON(req);
    const clase = programarClase(datos);
    enviarJSON(res, 201, { mensaje: "Clase programada correctamente.", clase });
  } catch (error) {
    manejarError(res, error);
  }
}

/** PUT /api/clases/:id */
export async function manejarActualizar(req, res, idClase) {
  try {
    const datos = await leerCuerpoJSON(req);
    const clase = editarClase(idClase, datos);
    enviarJSON(res, 200, { mensaje: "Clase actualizada correctamente.", clase });
  } catch (error) {
    manejarError(res, error);
  }
}

/** DELETE /api/clases/:id */
export async function manejarEliminar(req, res, idClase) {
  try {
    eliminarClasePorId(idClase);
    enviarJSON(res, 200, { mensaje: "Clase eliminada correctamente." });
  } catch (error) {
    manejarError(res, error);
  }
}

function manejarError(res, error) {
  if (error instanceof ErrorDeNegocio) {
    enviarJSON(res, error.codigoEstado, { mensaje: error.message, errores: error.detalles });
    return;
  }
  if (error.message?.includes("JSON")) {
    enviarJSON(res, 400, { mensaje: error.message });
    return;
  }
  console.error("Error inesperado:", error);
  enviarJSON(res, 500, { mensaje: "Error interno del servidor." });
}
