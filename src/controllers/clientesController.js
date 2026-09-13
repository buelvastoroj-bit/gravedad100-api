import { leerCuerpoJSON, enviarJSON } from "../utils/httpUtils.js";
import {
  listarClientes,
  registrarCliente,
  registrarCheckin,
  listarCheckins,
  ErrorDeNegocio,
} from "../services/clienteService.js";

/**
 * Controlador HTTP del recurso "Clientes" (modulo de Recepcion de
 * clientes, RF-01), siguiendo el mismo patron que clasesController.js.
 */

/** GET /api/clientes */
export async function manejarListarClientes(req, res) {
  const clientes = listarClientes();
  enviarJSON(res, 200, { total: clientes.length, clientes });
}

/** POST /api/clientes */
export async function manejarRegistrarCliente(req, res) {
  try {
    const datos = await leerCuerpoJSON(req);
    const cliente = registrarCliente(datos);
    enviarJSON(res, 201, { mensaje: "Cliente registrado correctamente.", cliente });
  } catch (error) {
    manejarError(res, error);
  }
}

/** POST /api/clientes/:id/checkin */
export async function manejarCheckin(req, res, idCliente) {
  try {
    const { checkin, cliente } = registrarCheckin(idCliente);
    enviarJSON(res, 201, {
      mensaje: `Check-in registrado para ${cliente.nombre}.`,
      checkin,
    });
  } catch (error) {
    manejarError(res, error);
  }
}

/** GET /api/checkins */
export async function manejarListarCheckins(req, res) {
  const checkins = listarCheckins();
  enviarJSON(res, 200, { total: checkins.length, checkins });
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