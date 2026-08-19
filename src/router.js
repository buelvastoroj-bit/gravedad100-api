import { enviarJSON, responderPreflight } from "./utils/httpUtils.js";
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
 * Implementado sobre el modulo nativo "http", con soporte manual para
 * segmentos de ruta dinamicos (:id), sin depender de un framework externo.
 */

/**
 * Intenta hacer match de una ruta como /api/clases/123 contra el patron
 * /api/clases/:id, extrayendo el id como numero.
 *
 * @param {string} pathname - Ej: "/api/clases/5"
 * @param {string} prefijo  - Ej: "/api/clases/"
 * @returns {number|null} El id extraido, o null si no coincide con el patron
 *                         (por ejemplo, no es un numero valido).
 */
function extraerIdDeRuta(pathname, prefijo) {
  if (!pathname.startsWith(prefijo)) return null;
  const resto = pathname.slice(prefijo.length);
  if (!/^\d+$/.test(resto)) return null;
  return Number(resto);
}

export async function enrutar(req, res) {
  const { method } = req;
  const { pathname } = new URL(req.url, "http://localhost");

  // ---- CORS preflight (el navegador lo envia antes de POST/PUT/DELETE) ----
  if (method === "OPTIONS") {
    responderPreflight(res);
    return;
  }

  // ---- Informacion general ----
  if (method === "GET" && pathname === "/") {
    enviarJSON(res, 200, {
      servicio: "API Gravedad100 - Autenticacion y Clases y horarios",
      evidencia: "GA7-220501096-AA5-EV03",
      endpoints: [
        { metodo: "POST", ruta: "/api/registro" },
        { metodo: "POST", ruta: "/api/login" },
        { metodo: "GET", ruta: "/api/clases" },
        { metodo: "GET", ruta: "/api/clases/:id" },
        { metodo: "POST", ruta: "/api/clases" },
        { metodo: "PUT", ruta: "/api/clases/:id" },
        { metodo: "DELETE", ruta: "/api/clases/:id" },
      ],
    });
    return;
  }

  // ---- Autenticacion ----
  if (method === "POST" && pathname === "/api/registro") {
    await manejarRegistro(req, res);
    return;
  }
  if (method === "POST" && pathname === "/api/login") {
    await manejarLogin(req, res);
    return;
  }

  // ---- Clases: colección ----
  if (method === "GET" && pathname === "/api/clases") {
    await manejarListar(req, res);
    return;
  }
  if (method === "POST" && pathname === "/api/clases") {
    await manejarCrear(req, res);
    return;
  }

  // ---- Clases: recurso individual (/api/clases/:id) ----
  const idClase = extraerIdDeRuta(pathname, "/api/clases/");
  if (idClase !== null) {
    if (method === "GET") {
      await manejarObtener(req, res, idClase);
      return;
    }
    if (method === "PUT") {
      await manejarActualizar(req, res, idClase);
      return;
    }
    if (method === "DELETE") {
      await manejarEliminar(req, res, idClase);
      return;
    }
  }

  enviarJSON(res, 404, { mensaje: `Ruta no encontrada: ${method} ${pathname}` });
}
