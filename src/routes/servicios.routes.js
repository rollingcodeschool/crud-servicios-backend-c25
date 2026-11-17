import { Router } from "express";
import {
  borrarServicio,
  crearServicio,
  editarServicio,
  listarServicios,
  prueba,
  servicioBuscado,
} from "../controllers/servicios.controllers.js";
import { reglasServicio, validarID } from "../middleware/validarServicio.js";
import { autenticador, esAdmin } from "../middleware/autenticador.js";
import {
  manejarErroresMulter,
  subirImagen,
} from "../middleware/multer.js";

const router = Router();

//http://localhost:3000/api/servicios/
//http://localhost:3000/api/servicios/234234dfgdf
// get, post, put/patch, delete
// router.route("/test").get(prueba);
router
  .route("/")
  // subirImagen procesa el archivo multipart y manejarErroresMulter responde los errores de Multer.
  // Van antes de reglasServicio porque express-validator necesita leer req.body ya parseado.
  .post(
    [autenticador, esAdmin, subirImagen, manejarErroresMulter, reglasServicio],
    crearServicio,
  ) // ruta privada del admin
  .get(listarServicios);
router
  .route("/:id")
  .get(validarID, servicioBuscado)
  .delete([autenticador, esAdmin, validarID], borrarServicio)   //ruta privada del admin
  .put(
    [
      autenticador,
      esAdmin,
      validarID,
      subirImagen,
      manejarErroresMulter,
      reglasServicio,
    ],
    editarServicio,
  );   //ruta privada del admin

export default router;
