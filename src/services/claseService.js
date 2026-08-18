import { validarClase, esValido } from "../utils/validacionesClase.js";
import {
  listarClases as listarClasesRepo,
  buscarPorId,
  crearClase as crearClaseRepo,
  actualizarClase as actualizarClaseRepo,
  eliminarClase as eliminarClaseRepo,
} from "../repositories/claseRepository.js";

/**
 * Reglas de negocio del recurso "Clase grupal" (equivalente a ClaseServicio
 * en el backend Spring del modulo Clases y horarios).
 */

export class ErrorDeNegocio extends Error {
  constructor(mensaje, codigoEstado, detalles) {
    super(mensaje);
    this.codigoEstado = codigoEstado;
    this.detalles = detalles;
  }
}

export function listarClases() {
  return listarClasesRepo();
}

export function obtenerClase(idClase) {
  const clase = buscarPorId(idClase);
  if (!clase) {
    throw new ErrorDeNegocio(`No existe una clase con id ${idClase}.`, 404);
  }
  return clase;
}

export function programarClase(datos) {
  const errores = validarClase(datos);
  if (!esValido(errores)) {
    throw new ErrorDeNegocio("Datos de la clase invalidos.", 400, errores);
  }
  return crearClaseRepo(datos);
}

export function editarClase(idClase, datos) {
  const errores = validarClase(datos);
  if (!esValido(errores)) {
    throw new ErrorDeNegocio("Datos de la clase invalidos.", 400, errores);
  }
  const claseActualizada = actualizarClaseRepo(idClase, datos);
  if (!claseActualizada) {
    throw new ErrorDeNegocio(`No existe una clase con id ${idClase}.`, 404);
  }
  return claseActualizada;
}

export function eliminarClasePorId(idClase) {
  const seElimino = eliminarClaseRepo(idClase);
  if (!seElimino) {
    throw new ErrorDeNegocio(`No existe una clase con id ${idClase}.`, 404);
  }
}
