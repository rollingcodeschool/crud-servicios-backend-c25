import { Router } from "express";
import serviciosRouter from "./servicios.routes.js";

const router = Router();
//http://localhost:3000/api/servicios
router.use('/servicios', serviciosRouter)

export default router
