# API Gravedad100 — Autenticación y Clases y horarios

**Evidencia:** GA7-220501096-AA5-EV03 — Diseño y desarrollo de servicios web (proyecto)
**Aprendiz:** Jean Carlos Buelvas
**Programa:** Análisis y Desarrollo de Software — SENA

## Descripción

API REST que agrupa los servicios web necesarios para el proyecto
formativo Gravedad100 (sistema de gestión de gimnasio):

1. **Autenticación** — registro e inicio de sesión de usuarios (evidencia AA5_EV01).
2. **Clases y horarios** — gestión CRUD completa de las clases grupales
   del gimnasio, extendiendo a API REST la lógica ya construida y probada
   en Spring MVC (AA3_EV01/AA3_EV02) y conectable con el componente
   frontend en React (AA4_EV03).

Ver **DOCUMENTACION_SERVICIOS.md** para el detalle completo de cada
endpoint (método, ruta, cuerpo esperado, respuestas y códigos de estado).

## Tecnología

Node.js, usando únicamente módulos nativos (sin frameworks externos como
Express). Se ejecuta directamente con `node server.js`, sin necesidad de
`npm install`.

## Cómo ejecutar

Requiere [Node.js](https://nodejs.org/) 18 o superior.

```bash
node server.js
```

El servidor queda escuchando en `http://localhost:3000`.

## Probar con curl

```bash
# Registro e inicio de sesión
curl -X POST http://localhost:3000/api/registro -H "Content-Type: application/json" -d "{\"usuario\":\"jbuelvas\",\"contrasena\":\"clave123\"}"
curl -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d "{\"usuario\":\"jbuelvas\",\"contrasena\":\"clave123\"}"

# Clases y horarios
curl http://localhost:3000/api/clases
curl -X POST http://localhost:3000/api/clases -H "Content-Type: application/json" -d "{\"nombre\":\"Spinning\",\"entrenador\":\"Carlos Perez\",\"diaSemana\":\"Lunes\",\"horaInicio\":\"06:00\",\"horaFin\":\"07:00\",\"cupoMaximo\":15}"
curl http://localhost:3000/api/clases/1
curl -X PUT http://localhost:3000/api/clases/1 -H "Content-Type: application/json" -d "{\"nombre\":\"Spinning avanzado\",\"entrenador\":\"Carlos Perez\",\"diaSemana\":\"Lunes\",\"horaInicio\":\"06:00\",\"horaFin\":\"07:00\",\"cupoMaximo\":20}"
curl -X DELETE http://localhost:3000/api/clases/1
```

También se puede probar con Postman, tal como se hizo en la evidencia
AA5_EV02.

## Relación con el resto del proyecto Gravedad100

| Evidencia | Aporte |
|---|---|
| AA3_EV01 / AA3_EV02 | Backend original del módulo Clases y horarios (Spring MVC + JDBC + JSP), con las reglas de negocio que esta API replica. |
| AA4_EV03 | Componente frontend en React del módulo Clases y horarios (por ahora con datos de ejemplo en memoria). |
| AA5_EV01 / AA5_EV02 | Servicio de autenticación (registro/login), probado con Postman. |
| **AA5_EV03 (este proyecto)** | API REST unificada, lista para que el componente React consuma datos reales en lugar de datos de ejemplo, como siguiente paso natural del proyecto. |

## Control de versiones

El proyecto se versionó con Git, con un historial de commits organizado
por capa (utilidades, repositorios, servicios, controladores, enrutador),
siguiendo la misma convención usada en el resto del proyecto Gravedad100.
