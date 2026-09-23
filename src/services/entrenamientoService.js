import {
  listarPlanes as listarPlanesRepo,
  crearPlan,
  eliminarPlan as eliminarPlanRepo,
} from "../repositories/entrenamientoRepository.js";
import { buscarClientePorId } from "../repositories/clienteRepository.js";

/**
 * Reglas de negocio del modulo de Entrenamiento personalizado (RF-03).
 * Sigue el mismo patron que clienteService.js y claseService.js.
 */

const NIVELES_VALIDOS = ["Principiante", "Intermedio", "Avanzado"];
const LONGITUD_MAXIMA_OBJETIVO = 200;

export class ErrorDeNegocio extends Error {
  constructor(mensaje, codigoEstado) {
    super(mensaje);
    this.codigoEstado = codigoEstado;
  }
}

/** Lista todos los planes de entrenamiento, con el nombre del cliente ya resuelto. */
export function listarPlanes() {
  return listarPlanesRepo().map((plan) => {
    const cliente = buscarClientePorId(plan.idCliente);
    return { ...plan, nombreCliente: cliente ? cliente.nombre : "(cliente eliminado)" };
  });
}

/**
 * Crea un plan de entrenamiento personalizado para un cliente.
 *
 * Reglas aplicadas:
 * - El cliente indicado debe existir previamente.
 * - El objetivo es obligatorio (maximo 200 caracteres).
 * - El nivel debe ser uno de: Principiante, Intermedio, Avanzado.
 * - La duracion en semanas debe ser un numero mayor a 0.
 */
export function crearPlanEntrenamiento(datos) {
  const idCliente = Number(datos.idCliente);
  const objetivo = (datos.objetivo ?? "").trim();
  const duracionSemanas = Number(datos.duracionSemanas);

  if (!idCliente || Number.isNaN(idCliente)) {
    throw new ErrorDeNegocio("Debe indicar el cliente para el que se crea el plan.", 400);
  }
  if (!buscarClientePorId(idCliente)) {
    throw new ErrorDeNegocio(`No existe un cliente con id ${idCliente}.`, 404);
  }
  if (!objetivo) {
    throw new ErrorDeNegocio("El objetivo del plan es obligatorio.", 400);
  }
  if (objetivo.length > LONGITUD_MAXIMA_OBJETIVO) {
    throw new ErrorDeNegocio(`El objetivo no puede superar los ${LONGITUD_MAXIMA_OBJETIVO} caracteres.`, 400);
  }
  if (!NIVELES_VALIDOS.includes(datos.nivel)) {
    throw new ErrorDeNegocio(`El nivel debe ser uno de: ${NIVELES_VALIDOS.join(", ")}.`, 400);
  }
  if (!duracionSemanas || duracionSemanas <= 0) {
    throw new ErrorDeNegocio("La duracion en semanas debe ser un numero mayor a 0.", 400);
  }

  return crearPlan({ idCliente, objetivo, nivel: datos.nivel, duracionSemanas, observaciones: datos.observaciones });
}

/** Elimina un plan de entrenamiento por id. */
export function eliminarPlanEntrenamiento(idPlan) {
  const seElimino = eliminarPlanRepo(idPlan);
  if (!seElimino) {
    throw new ErrorDeNegocio(`No existe un plan con id ${idPlan}.`, 404);
  }
}