import { Router } from "express";
import { registrarUsuario } from "../controllers/usuarios.controllers.js";
const router = Router();

router.route('/registro').post(registrarUsuario)

export default router