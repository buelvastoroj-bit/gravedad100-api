import { enviarJSON, responderPreflight } from "./utils/httpUtils.js";
import { verificarToken } from "./utils/tokenUtils.js";
import { manejarRegistro, manejarLogin } from "./controllers/authController.js";
import { registroAbierto } from "./services/usuarioService.js";
import {
  manejarListar,
  manejarObtener,
  manejarCrear,
  manejarActualizar,
  manejarEliminar,
} from "./controllers/clasesController.js";
import {
  manejarListarClientes,
  manejarRegistrarCliente,
  manejarCheckin,
  manejarListarCheckins,
} from "./controllers/clientesController.js";
import {
  manejarListarPlanes,
  manejarCrearPlan,
  manejarEliminarPlan,
} from "./controllers/entrenamientoController.js";
import {
  manejarListarSolicitudes,
  manejarRegistrarSolicitud,
  manejarResolverSolicitud,
} from "./controllers/solicitudController.js";

/**
 * Enrutador de la API REST del proyecto Gravedad100.
 *
 * Familias de endpoints:
 * - /api/registro, /api/login              -> autenticacion (AA5_EV01)
 * - /api/clases, /api/clases/:id           -> Clases y horarios (AA5_EV03)
 * - /api/clientes, /api/clientes/:id/checkin, /api/checkins
 *                                            -> Recepcion de clientes (RF-01)
 * - /api/planes-entrenamiento              -> Entrenamiento personalizado (RF-03)
 * - /api/solicitudes                       -> Atencion al cliente (RF-04)
 *
 * Las operaciones que MODIFICAN datos requieren un token valido en la
 * cabecera "Authorization: Bearer <token>", obtenido en /api/login.
 *
 * El registro de usuarios solo es publico mientras no exista ningun
 * usuario (para crear la primera cuenta). Despues exige token.
 */

const ENDPOINTS = [
  { metodo: "POST", ruta: "/api/registro (publico solo si no hay usuarios; despues requiere token)" },
  { metodo: "GET", ruta: "/api/registro/estado" },
  { metodo: "POST", ruta: "/api/login" },
  { metodo: "GET", ruta: "/api/clases" },
  { metodo: "GET", ruta: "/api/clases/:id" },
  { metodo: "POST", ruta: "/api/clases (requiere token)" },
  { metodo: "PUT", ruta: "/api/clases/:id (requiere token)" },
  { metodo: "DELETE", ruta: "/api/clases/:id (requiere token)" },
  { metodo: "GET", ruta: "/api/clientes" },
  { metodo: "POST", ruta: "/api/clientes (requiere token)" },
  { metodo: "POST", ruta: "/api/clientes/:id/checkin (requiere token)" },
  { metodo: "GET", ruta: "/api/checkins" },
  { metodo: "GET", ruta: "/api/planes-entrenamiento" },
  { metodo: "POST", ruta: "/api/planes-entrenamiento (requiere token)" },
  { metodo: "DELETE", ruta: "/api/planes-entrenamiento/:id (requiere token)" },
  { metodo: "GET", ruta: "/api/solicitudes" },
  { metodo: "POST", ruta: "/api/solicitudes (requiere token)" },
  { metodo: "PUT", ruta: "/api/solicitudes/:id/resolver (requiere token)" },
];

/** Extrae un id numerico al final de una ruta (ej: /api/clases/5 -> 5). */
function extraerIdDeRuta(pathname, prefijo) {
  if (!pathname.startsWith(prefijo)) return null;
  const resto = pathname.slice(prefijo.length);
  if (!/^\d+$/.test(resto)) return null;
  return Number(resto);
}

/** Saca el token de la cabecera "Authorization: Bearer <token>". */
function obtenerTokenDeCabecera(req) {
  const cabecera = req.headers["authorization"] || "";
  return cabecera.startsWith("Bearer ") ? cabecera.slice(7) : null;
}

function exigirToken(req, res) {
  try {
    verificarToken(obtenerTokenDeCabecera(req));
    return true;
  } catch (error) {
    enviarJSON(res, 401, { mensaje: error.message });
    return false;
  }
}

/** Indica si la peticion trae un token valido, sin responder nada. */
function tieneTokenValido(req) {
  try {
    verificarToken(obtenerTokenDeCabecera(req));
    return true;
  } catch {
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
      servicio:
        "API Gravedad100 - Autenticacion, Clases y horarios, Recepcion de clientes, Entrenamiento personalizado, Atencion al cliente",
      endpoints: ENDPOINTS,
    });
    return;
  }

  // ---- Autenticacion ----
  if (method === "GET" && pathname === "/api/registro/estado") {
    enviarJSON(res, 200, { registroAbierto: registroAbierto() });
    return;
  }
  if (method === "POST" && pathname === "/api/registro") {
    // Con usuarios existentes, solo alguien con sesion iniciada puede crear cuentas
    if (!registroAbierto() && !tieneTokenValido(req)) {
      enviarJSON(res, 403, {
        mensaje: "El registro esta cerrado. Pide a un administrador que te cree una cuenta.",
      });
      return;
    }
    await manejarRegistro(req, res);
    return;
  }
  if (method === "POST" && pathname === "/api/login") {
    await manejarLogin(req, res);
    return;
  }

  // ---- Clases: coleccion ----
  if (method === "GET" && pathname === "/api/clases") {
    await manejarListar(req, res);
    return;
  }
  if (method === "POST" && pathname === "/api/clases") {
    if (!exigirToken(req, res)) return;
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

  // ---- Clientes: coleccion ----
  if (method === "GET" && pathname === "/api/clientes") {
    await manejarListarClientes(req, res);
    return;
  }
  if (method === "POST" && pathname === "/api/clientes") {
    if (!exigirToken(req, res)) return;
    await manejarRegistrarCliente(req, res);
    return;
  }

  // ---- Clientes: check-in (/api/clientes/:id/checkin) ----
  const matchCheckin = pathname.match(/^\/api\/clientes\/(\d+)\/checkin$/);
  if (matchCheckin && method === "POST") {
    if (!exigirToken(req, res)) return;
    await manejarCheckin(req, res, Number(matchCheckin[1]));
    return;
  }

  // ---- Check-ins: coleccion ----
  if (method === "GET" && pathname === "/api/checkins") {
    await manejarListarCheckins(req, res);
    return;
  }

  // ---- Planes de entrenamiento: coleccion ----
  if (method === "GET" && pathname === "/api/planes-entrenamiento") {
    await manejarListarPlanes(req, res);
    return;
  }
  if (method === "POST" && pathname === "/api/planes-entrenamiento") {
    if (!exigirToken(req, res)) return;
    await manejarCrearPlan(req, res);
    return;
  }

  // ---- Planes de entrenamiento: recurso individual ----
  const matchPlan = pathname.match(/^\/api\/planes-entrenamiento\/(\d+)$/);
  if (matchPlan && method === "DELETE") {
    if (!exigirToken(req, res)) return;
    await manejarEliminarPlan(req, res, Number(matchPlan[1]));
    return;
  }

  // ---- Solicitudes de atencion: coleccion ----
  if (method === "GET" && pathname === "/api/solicitudes") {
    await manejarListarSolicitudes(req, res);
    return;
  }
  if (method === "POST" && pathname === "/api/solicitudes") {
    if (!exigirToken(req, res)) return;
    await manejarRegistrarSolicitud(req, res);
    return;
  }

  // ---- Solicitudes: resolver ----
  const matchResolver = pathname.match(/^\/api\/solicitudes\/(\d+)\/resolver$/);
  if (matchResolver && method === "PUT") {
    if (!exigirToken(req, res)) return;
    await manejarResolverSolicitud(req, res, Number(matchResolver[1]));
    return;
  }

  enviarJSON(res, 404, { mensaje: `Ruta no encontrada: ${method} ${pathname}` });
}
