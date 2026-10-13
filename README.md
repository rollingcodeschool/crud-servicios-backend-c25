# Backend crud-servicios

API REST con CRUD de servicios de programación, construida con Express y MongoDB (Mongoose). Incluye validaciones de datos con express-validator, búsqueda y paginación en el listado de servicios.

## Dependencias

- [express](https://expressjs.com/) - framework del servidor
- [mongoose](https://mongoosejs.com/) - ODM para la conexión con MongoDB
- [cors](https://www.npmjs.com/package/cors) - permite peticiones desde otros dominios
- [morgan](https://www.npmjs.com/package/morgan) - loguea las peticiones HTTP en la consola
- [express-validator](https://express-validator.github.io/docs/) - validación de los datos del body y los params

## Pasos para clonar el proyecto

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/rollingcodeschool/crud-servicios-backend-c25.git
   cd crud-servicios-backend-c25
   ```

2. Instalar las dependencias (requiere [pnpm](https://pnpm.io/)):

   ```bash
   pnpm install
   ```

3. Crear el archivo `.env` a partir del `.env.example` y configurar la conexión a MongoDB:

   ```bash
   cp .env.example .env
   ```

   | Variable    | Descripción                  | Ejemplo                                        |
   | ----------- | ---------------------------- | ---------------------------------------------- |
   | `PORT`      | Puerto del servidor          | `3000`                                         |
   | `MONGO_URI` | Cadena de conexión a MongoDB | `mongodb://localhost:27017/crudServicios`      |

4. Iniciar el servidor en modo desarrollo:

   ```bash
   pnpm dev
   ```

   o en modo producción:

   ```bash
   pnpm start
   ```

El servidor queda disponible en `http://localhost:3000` y las rutas de la API se sirven bajo `/api/servicios`.

## Endpoints

[Consulta la documentación aquí](https://documenter.getpostman.com/view/4704071/2sBYHPygXC?utm_source=postman-web-app#8f518d0b-90e5-44f0-8cf5-0617619dd185)
