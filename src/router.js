import { enviarJSON, responderPreflight } from "./utils/httpUtils.js";
import { verificarToken } from "./utils/tokenUtils.js";
import { manejarRegistro, manejarLogin } from "./controllers/authController.js";
import {
  manejarListar,
  manejarObtener,
  manejarCrear,
  manejarActualizar,
  manejarEliminar,
} from "./controllers/clasesController.js";

/**
 * Enrutador de la API REST del proyecto Gravedad100.
 *
 * Agrupa dos familias de endpoints:
 * - /api/registro, /api/login       -> autenticacion de usuarios (AA5_EV01)
 * - /api/clases, /api/clases/:id    -> gestion de clases y horarios (AA5_EV03)
 *
 * A partir de esta version, las operaciones que MODIFICAN datos de clases
 * (crear, editar, eliminar) requieren un token valido en la cabecera
 * "Authorization: Bearer <token>", obtenido previamente en /api/login.
 * Las consultas (GET) permanecen abiertas.
 */

function extraerIdDeRuta(pathname, prefijo) {
  if (!pathname.startsWith(prefijo)) return null;
  const resto = pathname.slice(prefijo.length);
  if (!/^\d+$/.test(resto)) return null;
  return Number(resto);
}

/**
 * Extrae y valida el token de la cabecera Authorization. Si es invalido
 * o falta, responde 401 y retorna false; si es valido, retorna true.
 */
function exigirToken(req, res) {
  const cabecera = req.headers["authorization"] || "";
  const token = cabecera.startsWith("Bearer ") ? cabecera.slice(7) : null;
  try {
    verificarToken(token);
    return true;
  } catch (error) {
    enviarJSON(res, 401, { mensaje: error.message });
    return false;
  }
}

export async function enrutar(req, res) {
  const { method } = req;
  const { pathname } = new URL(req.url, "http://localhost");

  if (method === "OPTIONS") {
    responderPreflight(res);
    return;
  }

  if (method === "GET" && pathname === "/") {
    enviarJSON(res, 200, {
      servicio: "API Gravedad100 - Autenticacion y Clases y horarios",
      evidencia: "GA7-220501096-AA5-EV03",
      endpoints: [
        { metodo: "POST", ruta: "/api/registro" },
        { metodo: "POST", ruta: "/api/login" },
        { metodo: "GET", ruta: "/api/clases" },
        { metodo: "GET", ruta: "/api/clases/:id" },
        { metodo: "POST", ruta: "/api/clases (requiere token)" },
        { metodo: "PUT", ruta: "/api/clases/:id (requiere token)" },
        { metodo: "DELETE", ruta: "/api/clases/:id (requiere token)" },
      ],
    });
    return;
  }

  if (method === "POST" && pathname === "/api/registro") {
    await manejarRegistro(req, res);
    return;
  }
  if (method === "POST" && pathname === "/api/login") {
    await manejarLogin(req, res);
    return;
  }

  if (method === "GET" && pathname === "/api/clases") {
    await manejarListar(req, res);
    return;
  }
  if (method === "POST" && pathname === "/api/clases") {
    if (!exigirToken(req, res)) return;
    await manejarCrear(req, res);
    return;
  }

  const idClase = extraerIdDeRuta(pathname, "/api/clases/");
  if (idClase !== null) {
    if (method === "GET") {
      await manejarObtener(req, res, idClase);
      return;
    }
    if (method === "PUT") {
      if (!exigirToken(req, res)) return;
      await manejarActualizar(req, res, idClase);
      return;
    }
    if (method === "DELETE") {
      if (!exigirToken(req, res)) return;
      await manejarEliminar(req, res, idClase);
      return;
    }
  }

  enviarJSON(res, 404, { mensaje: `Ruta no encontrada: ${method} ${pathname}` });
}