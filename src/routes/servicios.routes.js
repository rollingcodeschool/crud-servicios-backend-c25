import { Router } from "express";
import {
  borrarServicio,
  crearServicio,
  editarServicio,
  listarServicios,
  prueba,
  servicioBuscado,
} from "../controllers/servicios.controllers.js";
import reglasServicio from "../middleware/validarServicio.js";

const router = Router();

//http://localhost:3000/api/servicios/
//http://localhost:3000/api/servicios/234234dfgdf
// get, post, put/patch, delete
// router.route("/test").get(prueba);
router.route("/").post(reglasServicio,crearServicio).get(listarServicios);
router
  .route("/:id")
  .get(servicioBuscado)
  .delete(borrarServicio)
  .put(reglasServicio, editarServicio);

export default router;
