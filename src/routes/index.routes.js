import { Router } from "express";
import serviciosRouter from "./servicios.routes.js";
import usuariosRouter from "./usuarios.routes.js";

const router = Router();
//http://localhost:3000/api/servicios
router.use('/servicios', serviciosRouter)
router.use('/usuarios', usuariosRouter)

export default router
