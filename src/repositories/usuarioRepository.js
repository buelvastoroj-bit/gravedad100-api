import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Repositorio de usuarios.
 *
 * Persiste los usuarios registrados en un archivo JSON local
 * (data/usuarios.json). Cumple el mismo rol que una capa de repositorio
 * sobre una base de datos (como ClaseRepositorioJdbc en el modulo de
 * Clases y horarios), pero usando almacenamiento en archivo para mantener
 * este servicio sin dependencias externas, tal como pide el alcance de
 * la evidencia.
 *
 * @typedef {Object} UsuarioAlmacenado
 * @property {string} usuario   - Nombre de usuario (unico).
 * @property {string} hash      - Hash de la contrasena (nunca texto plano).
 * @property {string} sal       - Sal usada para generar el hash.
 * @property {string} creadoEn  - Fecha ISO de creacion del usuario.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const RUTA_ARCHIVO = join(__dirname, "..", "..", "data", "usuarios.json");

/** Garantiza que el archivo de datos exista antes de leer o escribir. */
function asegurarArchivo() {
  const carpeta = dirname(RUTA_ARCHIVO);
  if (!existsSync(carpeta)) {
    mkdirSync(carpeta, { recursive: true });
  }
  if (!existsSync(RUTA_ARCHIVO)) {
    writeFileSync(RUTA_ARCHIVO, "[]", "utf-8");
  }
}

/** Lee todos los usuarios almacenados. @returns {UsuarioAlmacenado[]} */
function leerTodos() {
  asegurarArchivo();
  const contenido = readFileSync(RUTA_ARCHIVO, "utf-8");
  return JSON.parse(contenido);
}

/** Sobrescribe el archivo con la lista completa de usuarios. */
function guardarTodos(usuarios) {
  writeFileSync(RUTA_ARCHIVO, JSON.stringify(usuarios, null, 2), "utf-8");
}

/**
 * Busca un usuario por su nombre de usuario.
 * @param {string} usuario
 * @returns {UsuarioAlmacenado|undefined}
 */
export function buscarPorUsuario(usuario) {
  return leerTodos().find((u) => u.usuario === usuario);
}

/**
 * Guarda un nuevo usuario en el repositorio.
 * @param {UsuarioAlmacenado} nuevoUsuario
 */
export function guardarUsuario(nuevoUsuario) {
  const usuarios = leerTodos();
  usuarios.push(nuevoUsuario);
  guardarTodos(usuarios);
}
