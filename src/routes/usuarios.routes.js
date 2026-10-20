import { Router } from "express";
import { registrarUsuario, solicitarNuevoCodigo, verificarRegistro } from "../controllers/usuarios.controllers.js";
const router = Router();

router.route('/registro').post(registrarUsuario)
router.route('/verificar').post(verificarRegistro)
router.route('/reenviar-codigo').post(solicitarNuevoCodigo)


export default router