import { Router } from "express";
import {
  borrarServicio,
  crearServicio,
  editarServicio,
  listarServicios,
  prueba,
  servicioBuscado,
} from "../controllers/servicios.controllers.js";
import {reglasServicio, validarID} from "../middleware/validarServicio.js";
import { autenticador, esAdmin } from "../middleware/autenticador.js";

const router = Router();

//http://localhost:3000/api/servicios/
//http://localhost:3000/api/servicios/234234dfgdf
// get, post, put/patch, delete
// router.route("/test").get(prueba);
router.route("/").post([autenticador, esAdmin, reglasServicio],crearServicio).get(listarServicios);
router
  .route("/:id")
  .get(validarID, servicioBuscado)
  .delete([autenticador, esAdmin, validarID], borrarServicio)
  .put([autenticador, esAdmin,validarID, reglasServicio], editarServicio);

export default router;
