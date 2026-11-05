import { Router } from "express";
import {
  agregarAlCarrito,
  eliminarDelCarrito,
  obtenerCarrito,
  vaciarCarrito,
} from "../controllers/carrito.controllers.js";
import { autenticador } from "../middleware/autenticador.js";
import { validarServicioId } from "../middleware/validarCarrito.js";

const router = Router();

router
  .route("/")
  .get(autenticador, obtenerCarrito)
  .post(autenticador, agregarAlCarrito)
  .delete(autenticador, vaciarCarrito);

router
  .route("/:servicioId")
  .delete([autenticador, validarServicioId], eliminarDelCarrito);

export default router;
