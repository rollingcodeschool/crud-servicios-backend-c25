import { Router } from "express";
import {
  crearOrdenPago,
  recibirWebhook,
} from "../controllers/orden.controllers.js";
import { autenticador } from "../middleware/autenticador.js";

const router = Router();

// POST /api/ordenes/webhook
// Ruta publica: la invocan los servidores de Mercado Pago, por eso NO lleva
// el middleware de autenticacion.
router.post("/webhook", recibirWebhook);

// POST /api/ordenes
// Ruta privada: crea la orden local y la Order en Mercado Pago.
router.route("/").post(autenticador, crearOrdenPago);

export default router;
