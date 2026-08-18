import { leerCuerpoJSON, enviarJSON } from "../utils/httpUtils.js";
import { registrarUsuario, iniciarSesion, ErrorDeNegocio } from "../services/usuarioService.js";

/**
 * Controlador HTTP para las operaciones de registro e inicio de sesion.
 * Equivalente, en este servicio, a ClaseController del modulo de Clases
 * y horarios: traduce peticiones/respuestas HTTP hacia y desde la capa
 * de servicio, sin contener logica de negocio propia.
 */

/**
 * POST /api/registro
 * Registra un nuevo usuario a partir de { usuario, contrasena } en el
 * cuerpo de la peticion.
 */
export async function manejarRegistro(req, res) {
  try {
    const datos = await leerCuerpoJSON(req);
    const usuarioCreado = registrarUsuario(datos);
    enviarJSON(res, 201, {
      mensaje: "Usuario registrado correctamente.",
      usuario: usuarioCreado.usuario,
    });
  } catch (error) {
    manejarError(res, error);
  }
}

/**
 * POST /api/login
 * Autentica a un usuario a partir de { usuario, contrasena } en el
 * cuerpo de la peticion.
 *
 * Responde con "Autenticacion satisfactoria" si las credenciales son
 * correctas, o "Error en la autenticacion" en caso contrario, tal como
 * especifica el enunciado del caso.
 */
export async function manejarLogin(req, res) {
  try {
    const datos = await leerCuerpoJSON(req);
    const usuarioAutenticado = iniciarSesion(datos);
    enviarJSON(res, 200, {
      mensaje: "Autenticacion satisfactoria.",
      usuario: usuarioAutenticado.usuario,
    });
  } catch (error) {
    manejarError(res, error);
  }
}

/**
 * Traduce los errores de negocio y de formato de peticion a respuestas
 * HTTP apropiadas, evitando exponer detalles internos del servidor.
 */
function manejarError(res, error) {
  if (error instanceof ErrorDeNegocio) {
    // El mensaje "Error en la autenticacion." llega aqui cuando falla el login.
    enviarJSON(res, error.codigoEstado, { mensaje: error.message });
    return;
  }

  // Cuerpo de la peticion mal formado (JSON invalido, etc.)
  if (error.message?.includes("JSON")) {
    enviarJSON(res, 400, { mensaje: error.message });
    return;
  }

  console.error("Error inesperado:", error);
  enviarJSON(res, 500, { mensaje: "Error interno del servidor." });
}
