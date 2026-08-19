/**
 * Utilidades genericas para trabajar con peticiones y respuestas HTTP
 * usando unicamente el modulo nativo "http" de Node.js (sin frameworks
 * externos como Express), tal como se planteo el alcance de esta
 * evidencia: un servicio web simple, sin dependencias adicionales que
 * instalar.
 */

/**
 * Lee y parsea el cuerpo de una peticion HTTP como JSON.
 *
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<Object>} El cuerpo de la peticion ya parseado.
 *                             Si esta vacio o no es JSON valido, retorna {}.
 */
export function leerCuerpoJSON(req) {
  return new Promise((resolve, reject) => {
    let datosCrudos = "";

    req.on("data", (fragmento) => {
      datosCrudos += fragmento;
      // Proteccion basica contra cuerpos excesivamente grandes.
      if (datosCrudos.length > 1_000_000) {
        req.destroy();
        reject(new Error("Cuerpo de la peticion demasiado grande."));
      }
    });

    req.on("end", () => {
      if (!datosCrudos) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(datosCrudos));
      } catch (error) {
        reject(new Error("El cuerpo de la peticion no es un JSON valido."));
      }
    });

    req.on("error", reject);
  });
}

/**
 * Envia una respuesta HTTP en formato JSON con el codigo de estado indicado.
 * Incluye cabeceras CORS para que la API pueda ser consumida desde el
 * componente frontend en React (que corre en un origen distinto,
 * http://localhost:5173, durante el desarrollo).
 *
 * @param {import('http').ServerResponse} res
 * @param {number} codigoEstado - Codigo HTTP (200, 400, 401, 404, etc.)
 * @param {Object} cuerpo - Objeto que se serializa como JSON en la respuesta.
 */
export function enviarJSON(res, codigoEstado, cuerpo) {
  const texto = JSON.stringify(cuerpo, null, 2);
  res.writeHead(codigoEstado, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(texto),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(texto);
}

/**
 * Responde a una peticion OPTIONS (preflight de CORS) que el navegador
 * envia automaticamente antes de un POST/PUT/DELETE con cuerpo JSON.
 * @param {import('http').ServerResponse} res
 */
export function responderPreflight(res) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end();
}
