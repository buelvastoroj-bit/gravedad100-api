/**
 * Validaciones del recurso "Clase grupal" para la API REST.
 *
 * Replica las mismas reglas de negocio ya definidas y probadas en el
 * backend Spring MVC (evidencias AA3_EV01/AA3_EV02) y en el componente
 * frontend React (evidencia AA4_EV03), para que las tres capas del
 * proyecto (Spring, React, y esta API) sean consistentes entre si.
 */

export const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
export const LONGITUD_MAXIMA_NOMBRE = 60;
export const LONGITUD_MAXIMA_ENTRENADOR = 100;

/**
 * Valida los datos de una clase antes de crearla o actualizarla.
 * @param {Object} datos
 * @returns {Object} Mapa de errores por campo. Vacio si los datos son validos.
 */
export function validarClase(datos) {
  const errores = {};

  if (!datos.nombre || !String(datos.nombre).trim()) {
    errores.nombre = "El nombre de la clase es obligatorio.";
  } else if (String(datos.nombre).trim().length > LONGITUD_MAXIMA_NOMBRE) {
    errores.nombre = `El nombre no puede superar los ${LONGITUD_MAXIMA_NOMBRE} caracteres.`;
  }

  if (!datos.entrenador || !String(datos.entrenador).trim()) {
    errores.entrenador = "El entrenador es obligatorio.";
  } else if (String(datos.entrenador).trim().length > LONGITUD_MAXIMA_ENTRENADOR) {
    errores.entrenador = `El entrenador no puede superar los ${LONGITUD_MAXIMA_ENTRENADOR} caracteres.`;
  }

  if (!datos.diaSemana || !DIAS_SEMANA.includes(datos.diaSemana)) {
    errores.diaSemana = `El dia de la semana debe ser uno de: ${DIAS_SEMANA.join(", ")}.`;
  }

  if (!datos.horaInicio) {
    errores.horaInicio = "La hora de inicio es obligatoria.";
  }
  if (!datos.horaFin) {
    errores.horaFin = "La hora de fin es obligatoria.";
  }
  if (datos.horaInicio && datos.horaFin && datos.horaFin <= datos.horaInicio) {
    errores.horaFin = "La hora de fin debe ser posterior a la hora de inicio.";
  }

  const cupoVacio = datos.cupoMaximo === "" || datos.cupoMaximo === undefined || datos.cupoMaximo === null;
  const cupo = Number(datos.cupoMaximo);
  if (cupoVacio || Number.isNaN(cupo)) {
    errores.cupoMaximo = "El cupo maximo es obligatorio.";
  } else if (cupo < 1) {
    errores.cupoMaximo = "El cupo maximo debe ser mayor que cero.";
  }

  return errores;
}

export function esValido(errores) {
  return Object.keys(errores).length === 0;
}
