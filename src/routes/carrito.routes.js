import { Router } from "express";
import {
  agregarAlCarrito,
  obtenerCarrito,
} from "../controllers/carrito.controllers.js";
import { autenticador } from "../middleware/autenticador.js";

const router = Router();

router
  .route("/")
  .get(autenticador, obtenerCarrito)
  .post(autenticador, agregarAlCarrito);

export default router;
