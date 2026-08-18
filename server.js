import { createServer } from "node:http";
import { enrutar } from "./src/router.js";

/**
 * Punto de entrada de la API REST del proyecto Gravedad100
 * (evidencia GA7-220501096-AA5-EV03).
 *
 * Reune los servicios de autenticacion (registro/login, AA5_EV01) y de
 * gestion de Clases y horarios (CRUD, AA5_EV03), implementados con el
 * modulo nativo "http" de Node.js, sin dependencias externas.
 */

const PUERTO = process.env.PUERTO || 3000;

const servidor = createServer((req, res) => {
  enrutar(req, res).catch((error) => {
    console.error("Error no controlado:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ mensaje: "Error interno del servidor." }));
  });
});

servidor.listen(PUERTO, () => {
  console.log("=========================================================");
  console.log(" API Gravedad100 - Autenticacion y Clases y horarios");
  console.log(` Escuchando en el puerto ${PUERTO}`);
  console.log(` URL base: http://localhost:${PUERTO}`);
  console.log("=========================================================");
});
