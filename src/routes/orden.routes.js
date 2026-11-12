import { Router } from "express";
import { crearOrdenPago } from "../controllers/orden.controllers.js";
import { autenticador } from "../middleware/autenticador.js";

const router = Router();

// POST /api/ordenes
// Ruta privada: crea la orden local y la Order en Mercado Pago.
router.route("/").post(autenticador, crearOrdenPago);

export default router;
