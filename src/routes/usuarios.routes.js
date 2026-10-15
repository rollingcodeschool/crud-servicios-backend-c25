import { Router } from "express";
import { registrarUsuario, verificarRegistro } from "../controllers/usuarios.controllers.js";
const router = Router();

router.route('/registro').post(registrarUsuario)
router.route('/verificar').post(verificarRegistro)

export default router