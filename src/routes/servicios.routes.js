import { Router } from "express";
import {
    borrarServicio,
  crearServicio,
  listarServicios,
  prueba,
  servicioBuscado,
} from "../controllers/servicios.controllers.js";

const router = Router();

//http://localhost:3000/api/servicios/
//http://localhost:3000/api/servicios/234234dfgdf
// get, post, put/patch, delete
// router.route("/test").get(prueba);
router.route("/").post(crearServicio).get(listarServicios);
router.route('/:id').get(servicioBuscado).delete(borrarServicio)

export default router;
