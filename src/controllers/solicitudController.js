import { leerCuerpoJSON, enviarJSON } from "../utils/httpUtils.js";
import {
  listarSolicitudes,
  registrarSolicitud,
  resolverSolicitud,
  ErrorDeNegocio,
} from "../services/solicitudService.js";

/** Controlador HTTP del recurso "Solicitudes de atencion" (RF-04). */

/** GET /api/solicitudes */
export async function manejarListarSolicitudes(req, res) {
  const solicitudes = listarSolicitudes();
  enviarJSON(res, 200, { total: solicitudes.length, solicitudes });
}

/** POST /api/solicitudes */
export async function manejarRegistrarSolicitud(req, res) {
  try {
    const datos = await leerCuerpoJSON(req);
    const solicitud = registrarSolicitud(datos);
    enviarJSON(res, 201, { mensaje: "Solicitud registrada correctamente.", solicitud });
  } catch (error) {
    manejarError(res, error);
  }
}

/** PUT /api/solicitudes/:id/resolver */
export async function manejarResolverSolicitud(req, res, idSolicitud) {
  try {
    const datos = await leerCuerpoJSON(req);
    const solicitud = resolverSolicitud(idSolicitud, datos.respuesta);
    enviarJSON(res, 200, { mensaje: "Solicitud marcada como resuelta.", solicitud });
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