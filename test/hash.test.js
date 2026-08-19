import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { hashearContrasena, verificarContrasena } from "../src/utils/hash.js";

/**
 * Pruebas unitarias del modulo de hashing de contrasenas.
 * Ejecutar con: node --test
 */

describe("hashearContrasena / verificarContrasena", () => {
  test("una contrasena correcta verifica exitosamente contra su propio hash", () => {
    const { hash, sal } = hashearContrasena("clave123");
    assert.equal(verificarContrasena("clave123", hash, sal), true);
  });

  test("una contrasena incorrecta no verifica", () => {
    const { hash, sal } = hashearContrasena("clave123");
    assert.equal(verificarContrasena("otraClave", hash, sal), false);
  });

  test("dos hashes de la misma contrasena son distintos (sal aleatoria)", () => {
    const primero = hashearContrasena("clave123");
    const segundo = hashearContrasena("clave123");
    assert.notEqual(primero.hash, segundo.hash);
    assert.notEqual(primero.sal, segundo.sal);
  });

  test("la contrasena nunca se guarda en texto plano", () => {
    const { hash } = hashearContrasena("clave123");
    assert.ok(!hash.includes("clave123"));
  });
});
