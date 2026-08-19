import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validarClase, esValido } from "../src/utils/validacionesClase.js";

/**
 * Pruebas unitarias del modulo de validaciones de Clase.
 * Ejecutar con: node --test
 */

describe("validarClase", () => {
  const datosValidos = {
    nombre: "Spinning",
    entrenador: "Carlos Perez",
    diaSemana: "Lunes",
    horaInicio: "06:00",
    horaFin: "07:00",
    cupoMaximo: 15,
  };

  test("acepta datos completamente validos", () => {
    const errores = validarClase(datosValidos);
    assert.deepEqual(errores, {});
    assert.equal(esValido(errores), true);
  });

  test("rechaza nombre vacio", () => {
    const errores = validarClase({ ...datosValidos, nombre: "" });
    assert.ok(errores.nombre);
  });

  test("rechaza nombre de mas de 60 caracteres", () => {
    const errores = validarClase({ ...datosValidos, nombre: "x".repeat(61) });
    assert.ok(errores.nombre);
  });

  test("rechaza entrenador de mas de 100 caracteres", () => {
    const errores = validarClase({ ...datosValidos, entrenador: "x".repeat(101) });
    assert.ok(errores.entrenador);
  });

  test("rechaza dia de la semana invalido", () => {
    const errores = validarClase({ ...datosValidos, diaSemana: "Funday" });
    assert.ok(errores.diaSemana);
  });

  test("rechaza cupo maximo igual a cero", () => {
    const errores = validarClase({ ...datosValidos, cupoMaximo: 0 });
    assert.ok(errores.cupoMaximo);
  });

  test("rechaza cupo maximo vacio (no confundir 0 con vacio)", () => {
    const errores = validarClase({ ...datosValidos, cupoMaximo: "" });
    assert.equal(errores.cupoMaximo, "El cupo maximo es obligatorio.");
  });

  test("rechaza hora fin anterior o igual a hora inicio", () => {
    const errores = validarClase({ ...datosValidos, horaInicio: "18:00", horaFin: "06:00" });
    assert.ok(errores.horaFin);
  });

  test("acumula varios errores a la vez", () => {
    const errores = validarClase({});
    assert.ok(Object.keys(errores).length >= 5);
    assert.equal(esValido(errores), false);
  });
});
