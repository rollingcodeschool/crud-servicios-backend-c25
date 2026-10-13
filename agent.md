# Guía de desarrollo — Backend CRUD Servicios

Guía de contexto y reglas para el desarrollo de este backend. Toda persona o agente que trabaje en este proyecto debe seguirla.

---

## 1. Visión general del stack

| Aspecto | Valor |
|---|---|
| Lenguaje | **JavaScript (ESM)** — `"type": "module"`, solo `import`/`export`, nunca `require` |
| Framework | **Express `^5.2.1`** (Express 5, no 4) |
| ODM | **Mongoose `^9.9.5`** → MongoDB Atlas |
| Validación | **express-validator `^7.3.2`** |
| Middlewares | `cors`, `morgan` |
| Gestor de paquetes | **Solo pnpm** (obligatorio; está forzado en `devEngines`) |
| TypeScript | **No se usa** — proyecto JS puro, no agregar `tsconfig.json` ni TS |

Comandos:

```bash
pnpm dev    # node --env-file .env --watch index  (desarrollo, carga .env + watch)
pnpm start  # node index                          (producción, NO carga .env)
```

Servidor en `http://localhost:3000` (o `process.env.PORT`).

---

## 2. Estructura del proyecto

```
index.js                       # Punto de entrada: crea Server, monta router en '/api', listen()
package.json
.env                           # MONGO_URI, PORT (NUNCA commitear)
public/
  index.html                   # Página estática servida en GET /
src/
  server/
    config.js                  # clase Server (app Express, middlewares globales, listen)
  database/
    db.js                      # conexión a MongoDB Atlas (se ejecuta al importarlo)
  routes/
    index.routes.js            # router raíz agregador (monta routers por recurso en '/')
    servicios.routes.js        # rutas del recurso servicios
  controllers/
    servicios.controllers.js   # lógica de los endpoints (named exports)
  middleware/
    validarServicio.js         # arrays de reglas de express-validator
    resultadoValidacion.js     # middleware que corta con 400 si hay errores de validación
  models/
    servicio.js                # schema + modelo Mongoose
```

---

## 3. Flujo de una petición

```
index.js
  → new Server()                    (src/server/config.js)
      middlewares globales: cors, morgan, express.json, express.static
  → server.app.use('/api', router)   (src/routes/index.routes.js)
      → router.use('/servicios', serviciosRouter)   (src/routes/servicios.routes.js)
          → middlewares de validación (arrays)
          → controller             (src/controllers/*.controllers.js)
          → modelo Mongoose        (src/models/*.js)
          → MongoDB Atlas          (src/database/db.js)
```

Regla: **no se salta ninguna capa**. El controller habla directo con Mongoose (no existe capa de servicios); no inventar una salvo que se pida explícitamente.

---

## 4. Convenciones de código

- **Todo en español**: nombres de funciones, variables, mensajes de error y comentarios.
- **Nomenclatura**:
  - camelCase para funciones/variables (`crearServicio`, `listarServicios`)
  - PascalCase para clases y modelos (`Server`, `Servicio`)
  - Rutas en minúscula plural (`/servicios`)
- **Suffix de archivos**:
  - Rutas: `*.routes.js`
  - Controllers: `*.controllers.js`
  - Models: singular (`servicio.js`)
  - Middlewares: nombre descriptivo en singular (`validarServicio.js`)
- **Exports**:
  - Controllers: **named exports** → `export const crearServicio = async (req, res) => {...}`
  - Rutas, Server, modelo y helpers: **default export** → `export default router;`
- **Formato**: 2 espacios de indentación, comillas dobles, punto y coma final.
- Controllers siempre `async/await` con `try/catch`; **nunca** devolver el objeto `error` al cliente.

---

## 5. Endpoints de referencia

| Método | Ruta | Middlewares | Controller | Éxito |
|---|---|---|---|---|
| POST | `/api/servicios` | `reglasServicio` | `crearServicio` | 201 |
| GET | `/api/servicios` | — | `listarServicios` | 200 (paginado) |
| GET | `/api/servicios/:id` | `validarID` | `servicioBuscado` | 200 |
| PUT | `/api/servicios/:id` | `[validarID, reglasServicio]` | `editarServicio` | 200 |
| DELETE | `/api/servicios/:id` | `validarID` | `borrarServicio` | 200 |
| GET | `/` | — | estático (`public/index.html`) | 200 |

Query params del listado (`GET /api/servicios`):

- `termino` — búsqueda case-insensitive con `$regex` sobre `nombreServicio`
- `pagina` — default `1`
- `limite` — default `10`

Estilo de rutas (usar `router.route(...)`):

```js
router.route("/").post(reglasServicio, crearServicio).get(listarServicios);
router
  .route("/:id")
  .get(validarID, servicioBuscado)
  .delete(validarID, borrarServicio)
  .put([validarID, reglasServicio], editarServicio);
```

---

## 6. Reglas de validación

- Librería: **express-validator** (`body`, `param`, `validationResult`).
- Las reglas viven en `src/middleware/validarServicio.js` exportadas como **arrays**:
  - `reglasServicio` — para el body (POST y PUT)
  - `validarID` — para `param("id")` con `.isMongoId()`
- Todo array de validación **debe terminar** con `resultadoValidacion` (de `src/middleware/resultadoValidacion.js`), que responde `400` si hay errores o llama `next()`.
- Los mensajes (`withMessage`) siempre **en español**.
- Ejemplo de registro de una ruta con validación:

```js
router.route("/:id").put([validarID, reglasServicio], editarServicio);
```

---

## 7. Formato de respuestas

Patrones a mantener de forma consistente:

- **Éxito con mensaje**: `res.status(201|200).json({ mensaje: "Servicio creado correctamente" })`
- **Éxito con recurso**: `res.status(200).json(servicio)` (documento crudo)
- **Listado paginado**:

```json
{
  "servicios": [],
  "cantidadServicios": 0,
  "paginaActual": 1,
  "totalPaginas": 0
}
```

- **404**: `{ "mensaje": "Servicio no encontrado" }`
- **500**: `console.error(error)` + `{ "mensaje": "Ocurrio un error al intentar ..." }` (mensaje distinto por operación; nunca exponer el error interno)
- **400 de validación**: devuelve `errors.array()` de express-validator (excepción conocida al patrón `{ mensaje }`).

---

## 8. Variables de entorno y configuración

Archivo `.env` en la raíz (está en `.gitignore`):

| Variable | Uso |
|---|---|
| `MONGO_URI` | `src/database/db.js` → `mongoose.connect(process.env.MONGO_URI)` |
| `PORT` | `src/server/config.js` → `process.env.PORT \|\| 3000` (por defecto 3000) |

- La carga del `.env` la hace el **flag `--env-file .env`** del script `dev` (no hay dotenv).
- ⚠️ `pnpm start` **no** carga `.env`: en producción exportar las variables por otro medio.
- **Nunca commitear `.env`** ni pegar la URI de Atlas en el código.

---

## 9. Reglas para el agente / desarrollador

### Al agregar un nuevo recurso (checklist)

1. **Model**: crear `src/models/<recurso>.js` con schema Mongoose + `mongoose.model(...)`.
2. **Validación**: agregar arrays de reglas en `src/middleware/validar<Recurso>.js` terminados con `resultadoValidacion`.
3. **Controller**: crear `src/controllers/<recurso>.controllers.js` con named exports `async (req, res)` + `try/catch`.
4. **Rutas**: crear `src/routes/<recurso>.routes.js` con `router.route(...)` y `export default router`.
5. **Montar**: registrar el router en `src/routes/index.routes.js` con `router.use('/<recurso>', ...)` — el prefijo global `/api` ya lo agrega `index.js`.
6. **Verificar**: probar el endpoint con `pnpm dev` y comprobar códigos de estado (201/200/400/404/500).

### Reglas generales

- **No romper patrones existentes**: formato de respuesta, nomenclatura en español, suffix de archivos y estructura en capas.
- **No inventar dependencias**: antes de usar una librería, verificar que ya exista en el proyecto o pedir confirmación para instalarla con `pnpm add`.
- **Gestor de paquetes**: solo `pnpm` (nada de npm/yarn; no modificar `package.json` para quitar `devEngines`).
- **Commits**: mensaje en español, descriptivo e imperativo (ej: *"agregamos paginación en el controlador listarServicios"*).
- **Branches**: convención `feat/NN-nombre` por iteración (ej: `feat/06-crud-usuarios`).
- **No commitear** `.env`, `node_modules/` ni `.vscode/`.
- **Seguridad**: nunca exponer el objeto `error` de Mongoose/Express al cliente ni registrar credenciales.
- **Idioma**: todo el código, mensajes al usuario y documentación en español.
