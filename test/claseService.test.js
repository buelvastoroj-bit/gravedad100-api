import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  listarClases,
  obtenerClase,
  programarClase,
  editarClase,
  eliminarClasePorId,
  ErrorDeNegocio,
} from "../src/services/claseService.js";

/**
 * Pruebas unitarias de la capa de servicio de Clases.
 *
 * Nota: estas pruebas usan el mismo archivo de persistencia
 * (data/clases.json) que usa el servidor en desarrollo. Para no dejar
 * datos de prueba mezclados con los datos reales, cada prueba limpia
 * (elimina) la clase que crea al terminar.
 * Ejecutar con: node --test
 */

const datosValidos = {
  nombre: "Clase de prueba unitaria",
  entrenador: "Entrenador de prueba",
  diaSemana: "Viernes",
  horaInicio: "10:00",
  horaFin: "11:00",
  cupoMaximo: 5,
};

describe("claseService", () => {
  let idCreado;

  test("programarClase crea una clase valida con cupoOcupado en 0", () => {
    const clase = programarClase(datosValidos);
    idCreado = clase.idClase;
    assert.equal(clase.nombre, datosValidos.nombre);
    assert.equal(clase.cupoOcupado, 0);
    assert.ok(clase.idClase > 0);
  });

  test("programarClase lanza ErrorDeNegocio 400 con datos invalidos", () => {
    assert.throws(
      () => programarClase({ nombre: "" }),
      (error) => error instanceof ErrorDeNegocio && error.codigoEstado === 400
    );
  });

  test("obtenerClase devuelve la clase creada", () => {
    const clase = obtenerClase(idCreado);
    assert.equal(clase.idClase, idCreado);
  });

  test("obtenerClase lanza ErrorDeNegocio 404 con id inexistente", () => {
    assert.throws(
      () => obtenerClase(999999),
      (error) => error instanceof ErrorDeNegocio && error.codigoEstado === 404
    );
  });

  test("editarClase actualiza los datos de la clase", () => {
    const claseActualizada = editarClase(idCreado, { ...datosValidos, cupoMaximo: 20 });
    assert.equal(claseActualizada.cupoMaximo, 20);
  });

  test("listarClases incluye la clase creada", () => {
    const clases = listarClases();
    assert.ok(clases.some((c) => c.idClase === idCreado));
  });

  test("eliminarClasePorId elimina la clase sin lanzar error", () => {
    assert.doesNotThrow(() => eliminarClasePorId(idCreado));
  });

  test("eliminarClasePorId lanza ErrorDeNegocio 404 si ya fue eliminada", () => {
    assert.throws(
      () => eliminarClasePorId(idCreado),
      (error) => error instanceof ErrorDeNegocio && error.codigoEstado === 404
    );
  });
});
