import {
  listarClientes as listarClientesRepo,
  buscarClientePorId,
  buscarClientePorDocumento,
  crearCliente,
  listarCheckins as listarCheckinsRepo,
  crearCheckin,
} from "../repositories/clienteRepository.js";

/**
 * Reglas de negocio del modulo de Recepcion de clientes (RF-01).
 *
 * Sigue el mismo patron que claseService.js y usuarioService.js: aisla
 * la logica de negocio de la capa HTTP (controllers) y de la capa de
 * persistencia (repositories).
 */

const LONGITUD_MAXIMA_NOMBRE = 100;
const LONGITUD_MAXIMA_DOCUMENTO = 20;

export class ErrorDeNegocio extends Error {
  constructor(mensaje, codigoEstado) {
    super(mensaje);
    this.codigoEstado = codigoEstado;
  }
}

/** Lista todos los clientes registrados. */
export function listarClientes() {
  return listarClientesRepo();
}

/**
 * Registra un nuevo cliente en recepcion.
 *
 * Reglas aplicadas:
 * - Nombre y documento son obligatorios.
 * - El nombre no puede superar los 100 caracteres.
 * - El documento no puede superar los 20 caracteres.
 * - El documento debe ser unico (no se permite registrar el mismo dos veces).
 */
export function registrarCliente(datos) {
  const nombre = (datos.nombre ?? "").trim();
  const documento = (datos.documento ?? "").trim();

  if (!nombre) {
    throw new ErrorDeNegocio("El nombre del cliente es obligatorio.", 400);
  }
  if (nombre.length > LONGITUD_MAXIMA_NOMBRE) {
    throw new ErrorDeNegocio(`El nombre no puede superar los ${LONGITUD_MAXIMA_NOMBRE} caracteres.`, 400);
  }
  if (!documento) {
    throw new ErrorDeNegocio("El numero de documento es obligatorio.", 400);
  }
  if (documento.length > LONGITUD_MAXIMA_DOCUMENTO) {
    throw new ErrorDeNegocio(`El documento no puede superar los ${LONGITUD_MAXIMA_DOCUMENTO} caracteres.`, 400);
  }
  if (buscarClientePorDocumento(documento)) {
    throw new ErrorDeNegocio(`Ya existe un cliente registrado con el documento '${documento}'.`, 409);
  }

  return crearCliente({ nombre, documento, telefono: datos.telefono });
}

/**
 * Registra la llegada de un cliente al gimnasio (check-in).
 *
 * Regla aplicada: el cliente debe existir previamente (estar ya
 * registrado en recepcion) antes de poder marcar su llegada.
 */
export function registrarCheckin(idCliente) {
  const cliente = buscarClientePorId(idCliente);
  if (!cliente) {
    throw new ErrorDeNegocio(`No existe un cliente con id ${idCliente}.`, 404);
  }
  const checkin = crearCheckin(idCliente);
  return { checkin, cliente };
}

/** Lista los check-ins registrados, del mas reciente al mas antiguo. */
export function listarCheckins() {
  return listarCheckinsRepo();
}