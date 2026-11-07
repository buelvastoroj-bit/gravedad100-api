import { hashearContrasena, verificarContrasena } from "../utils/hash.js";
import { buscarPorUsuario, guardarUsuario, contarUsuarios } from "../repositories/usuarioRepository.js";

/**
 * Reglas de negocio del registro e inicio de sesion de usuarios.
 * Equivalente, en este servicio, a la capa "service" del modulo de
 * Clases y horarios (ClaseServicio): aisla la logica de negocio de la
 * capa HTTP (controllers) y de la capa de persistencia (repositories).
 */

const LONGITUD_MINIMA_CONTRASENA = 6;

/** Error de negocio con un codigo HTTP asociado, para que el controlador
 * sepa que estado devolver sin conocer los detalles de la regla violada. */
export class ErrorDeNegocio extends Error {
  constructor(mensaje, codigoEstado) {
    super(mensaje);
    this.codigoEstado = codigoEstado;
  }
}

/**
 * Indica si cualquier persona puede registrarse sin iniciar sesion.
 *
 * Regla: el registro publico solo esta abierto mientras no exista ningun
 * usuario, para que se pueda crear la primera cuenta (el administrador).
 * Despues, solo un usuario con sesion iniciada puede crear cuentas nuevas.
 *
 * @returns {boolean}
 */
export function registroAbierto() {
  return contarUsuarios() === 0;
}

/**
 * Registra un nuevo usuario.
 *
 * Reglas aplicadas:
 * - Usuario y contrasena son obligatorios.
 * - La contrasena debe tener al menos 6 caracteres.
 * - El nombre de usuario debe ser unico.
 *
 * @param {{usuario: string, contrasena: string}} datos
 * @returns {{usuario: string, creadoEn: string}} Datos publicos del usuario creado.
 * @throws {ErrorDeNegocio} Si alguna regla de negocio no se cumple.
 */
export function registrarUsuario(datos) {
  const usuario = (datos.usuario ?? "").trim();
  const contrasena = datos.contrasena ?? "";

  if (!usuario || !contrasena) {
    throw new ErrorDeNegocio("El usuario y la contrasena son obligatorios.", 400);
  }

  if (contrasena.length < LONGITUD_MINIMA_CONTRASENA) {
    throw new ErrorDeNegocio(
      `La contrasena debe tener al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres.`,
      400
    );
  }

  if (buscarPorUsuario(usuario)) {
    throw new ErrorDeNegocio(`El usuario '${usuario}' ya existe.`, 409);
  }

  const { hash, sal } = hashearContrasena(contrasena);
  const creadoEn = new Date().toISOString();

  guardarUsuario({ usuario, hash, sal, creadoEn });

  return { usuario, creadoEn };
}

/**
 * Autentica a un usuario verificando su usuario y contrasena.
 *
 * @param {{usuario: string, contrasena: string}} datos
 * @returns {{usuario: string}} Datos publicos del usuario autenticado.
 * @throws {ErrorDeNegocio} Si el usuario no existe o la contrasena no coincide
 *         (se usa el mismo mensaje generico en ambos casos, para no revelar
 *         si el usuario existe o no y asi evitar enumeracion de usuarios).
 */
export function iniciarSesion(datos) {
  const usuario = (datos.usuario ?? "").trim();
  const contrasena = datos.contrasena ?? "";

  if (!usuario || !contrasena) {
    throw new ErrorDeNegocio("El usuario y la contrasena son obligatorios.", 400);
  }

  const usuarioAlmacenado = buscarPorUsuario(usuario);

  const credencialesValidas =
    usuarioAlmacenado &&
    verificarContrasena(contrasena, usuarioAlmacenado.hash, usuarioAlmacenado.sal);

  if (!credencialesValidas) {
    throw new ErrorDeNegocio("Error en la autenticacion.", 401);
  }

  return { usuario: usuarioAlmacenado.usuario };
}
