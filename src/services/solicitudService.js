import {
  listarSolicitudes as listarSolicitudesRepo,
  crearSolicitud,
  resolverSolicitud as resolverSolicitudRepo,
} from "../repositories/solicitudRepository.js";
import { buscarClientePorId } from "../repositories/clienteRepository.js";

const LONGITUD_MAXIMA_ASUNTO = 100;
const LONGITUD_MAXIMA_DESCRIPCION = 500;
const LONGITUD_MAXIMA_RESPUESTA = 500;

export class ErrorDeNegocio extends Error {
  constructor(mensaje, codigoEstado) {
    super(mensaje);
    this.codigoEstado = codigoEstado;
  }
}

/** Lista todas las solicitudes, con el nombre del cliente ya resuelto. */
export function listarSolicitudes() {
  return listarSolicitudesRepo().map((solicitud) => {
    const cliente = buscarClientePorId(solicitud.idCliente);
    return { ...solicitud, nombreCliente: cliente ? cliente.nombre : "(cliente eliminado)" };
  });
}

/**
 * Registra una nueva solicitud de atencion.
 * Reglas: el cliente debe existir; asunto y descripcion son obligatorios.
 */
export function registrarSolicitud(datos) {
  const idCliente = Number(datos.idCliente);
  const asunto = (datos.asunto ?? "").trim();
  const descripcion = (datos.descripcion ?? "").trim();

  if (!idCliente || Number.isNaN(idCliente)) {
    throw new ErrorDeNegocio("Debe indicar el cliente que realiza la solicitud.", 400);
  }
  if (!buscarClientePorId(idCliente)) {
    throw new ErrorDeNegocio(`No existe un cliente con id ${idCliente}.`, 404);
  }
  if (!asunto) {
    throw new ErrorDeNegocio("El asunto de la solicitud es obligatorio.", 400);
  }
  if (asunto.length > LONGITUD_MAXIMA_ASUNTO) {
    throw new ErrorDeNegocio(`El asunto no puede superar los ${LONGITUD_MAXIMA_ASUNTO} caracteres.`, 400);
  }
  if (!descripcion) {
    throw new ErrorDeNegocio("La descripcion de la solicitud es obligatoria.", 400);
  }
  if (descripcion.length > LONGITUD_MAXIMA_DESCRIPCION) {
    throw new ErrorDeNegocio(`La descripcion no puede superar los ${LONGITUD_MAXIMA_DESCRIPCION} caracteres.`, 400);
  }

  return crearSolicitud({ idCliente, asunto, descripcion });
}

/**
 * Marca una solicitud como resuelta.
 * Reglas: la solicitud debe existir; la respuesta es obligatoria.
 */
export function resolverSolicitud(idSolicitud, respuesta) {
  const respuestaLimpia = (respuesta ?? "").trim();

  if (!respuestaLimpia) {
    throw new ErrorDeNegocio("La respuesta es obligatoria para marcar la solicitud como resuelta.", 400);
  }
  if (respuestaLimpia.length > LONGITUD_MAXIMA_RESPUESTA) {
    throw new ErrorDeNegocio(`La respuesta no puede superar los ${LONGITUD_MAXIMA_RESPUESTA} caracteres.`, 400);
  }

  const solicitud = resolverSolicitudRepo(idSolicitud, respuestaLimpia);
  if (!solicitud) {
    throw new ErrorDeNegocio(`No existe una solicitud con id ${idSolicitud}.`, 404);
  }
  return solicitud;
}