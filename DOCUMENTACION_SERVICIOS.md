# Documentación de servicios — API Gravedad100

**Evidencia:** GA7-220501096-AA5-EV03 — Diseño y desarrollo de servicios web (proyecto)
**Aprendiz:** Jean Carlos Buelvas
**URL base (entorno local):** `http://localhost:3000`

Esta API reúne los servicios web necesarios para el proyecto formativo
Gravedad100, agrupados en dos módulos: **Autenticación** (registro e
inicio de sesión de usuarios, evidencia AA5_EV01) y **Clases y horarios**
(gestión completa de las clases grupales del gimnasio, extendiendo a API
REST lo ya construido en las evidencias AA3_EV01/AA3_EV02 con Spring MVC,
y conectable con el componente frontend en React de la evidencia
AA4_EV03).

---

## Módulo 1: Autenticación

### GET /
Información general de la API y lista de endpoints disponibles.

- **Método:** GET
- **Respuesta (200):** objeto JSON con el nombre del servicio y sus endpoints.

### POST /api/registro
Registra un nuevo usuario.

- **Cuerpo (JSON):** `{ "usuario": "string", "contrasena": "string" }`
- **201 Created:** `{ "mensaje": "Usuario registrado correctamente.", "usuario": "..." }`
- **400 Bad Request:** campos vacíos, o contraseña de menos de 6 caracteres.
- **409 Conflict:** el usuario ya existe.

### POST /api/login
Autentica a un usuario.

- **Cuerpo (JSON):** `{ "usuario": "string", "contrasena": "string" }`
- **200 OK:** `{ "mensaje": "Autenticacion satisfactoria.", "usuario": "..." }`
- **401 Unauthorized:** `{ "mensaje": "Error en la autenticacion." }`
  (usuario inexistente o contraseña incorrecta; se usa el mismo mensaje
  genérico en ambos casos por seguridad).
- **400 Bad Request:** campos vacíos.

Las contraseñas se almacenan con hash `scrypt` + sal aleatoria (nunca en
texto plano), verificadas con comparación de tiempo constante
(`timingSafeEqual`).

---

## Módulo 2: Clases y horarios

Modelo del recurso **Clase**:

| Campo | Tipo | Restricción |
|---|---|---|
| `idClase` | number | Autoincremental, asignado por el servidor |
| `nombre` | string | Obligatorio, máximo 60 caracteres |
| `entrenador` | string | Obligatorio, máximo 100 caracteres |
| `diaSemana` | string | Obligatorio; uno de: Domingo, Lunes, Martes, Miercoles, Jueves, Viernes, Sabado |
| `horaInicio` | string (HH:mm) | Obligatorio |
| `horaFin` | string (HH:mm) | Obligatorio; debe ser posterior a horaInicio |
| `cupoMaximo` | number | Obligatorio, entero mayor que 0 |
| `cupoOcupado` | number | Asignado por el servidor, inicia en 0 |

### GET /api/clases
Lista todas las clases programadas.

- **200 OK:**
```json
{
  "total": 1,
  "clases": [
    { "idClase": 1, "nombre": "Spinning", "entrenador": "Carlos Perez",
      "diaSemana": "Lunes", "horaInicio": "06:00", "horaFin": "07:00",
      "cupoMaximo": 15, "cupoOcupado": 0 }
  ]
}
```

### GET /api/clases/:id
Obtiene una clase por su id.

- **200 OK:** el objeto de la clase.
- **404 Not Found:** `{ "mensaje": "No existe una clase con id {id}." }`

### POST /api/clases
Programa (crea) una nueva clase.

- **Cuerpo (JSON):**
```json
{
  "nombre": "Spinning",
  "entrenador": "Carlos Perez",
  "diaSemana": "Lunes",
  "horaInicio": "06:00",
  "horaFin": "07:00",
  "cupoMaximo": 15
}
```
- **201 Created:** `{ "mensaje": "Clase programada correctamente.", "clase": { ... } }`
- **400 Bad Request:**
```json
{
  "mensaje": "Datos de la clase invalidos.",
  "errores": { "nombre": "El nombre de la clase es obligatorio." }
}
```
(el objeto `errores` incluye un mensaje por cada campo inválido).

### PUT /api/clases/:id
Actualiza una clase existente. El cuerpo tiene el mismo formato que en
POST /api/clases.

- **200 OK:** `{ "mensaje": "Clase actualizada correctamente.", "clase": { ... } }`
- **400 Bad Request:** datos inválidos (mismo formato que en la creación).
- **404 Not Found:** el id no existe.

### DELETE /api/clases/:id
Elimina una clase.

- **200 OK:** `{ "mensaje": "Clase eliminada correctamente." }`
- **404 Not Found:** el id no existe.

---

## Resumen de endpoints

| Método | Ruta | Servicio |
|---|---|---|
| GET | `/` | Información de la API |
| POST | `/api/registro` | Registrar usuario |
| POST | `/api/login` | Iniciar sesión |
| GET | `/api/clases` | Listar clases |
| GET | `/api/clases/:id` | Obtener una clase |
| POST | `/api/clases` | Programar una clase |
| PUT | `/api/clases/:id` | Editar una clase |
| DELETE | `/api/clases/:id` | Eliminar una clase |

## Tecnología y arquitectura

Node.js, usando únicamente módulos nativos (`http`, `crypto`, `fs`, `url`) —
sin frameworks externos. El proyecto sigue una arquitectura en capas,
consistente con el resto del proyecto Gravedad100 (Spring en el backend
original, React en el frontend):

```
server.js                        # Punto de entrada
src/
├── router.js                    # Enrutador HTTP (con soporte de :id)
├── controllers/                 # Capa HTTP (traduce peticion/respuesta)
│   ├── authController.js
│   └── clasesController.js
├── services/                    # Reglas de negocio
│   ├── usuarioService.js
│   └── claseService.js
├── repositories/                # Persistencia (archivos JSON)
│   ├── usuarioRepository.js
│   └── claseRepository.js
└── utils/                       # Utilidades transversales
    ├── hash.js
    ├── httpUtils.js
    └── validacionesClase.js
data/
├── usuarios.json                # Se crea automaticamente
└── clases.json                  # Se crea automaticamente
```

## Cómo ejecutar

```bash
node server.js
```

El servidor queda escuchando en `http://localhost:3000`. No requiere
`npm install` ni conexión a internet.
