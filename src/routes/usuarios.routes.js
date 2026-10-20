import { Router } from "express";
import { login, registrarUsuario, solicitarNuevoCodigo, verificarRegistro } from "../controllers/usuarios.controllers.js";
const router = Router();

router.route('/registro').post(registrarUsuario)
router.route('/verificar').post(verificarRegistro)
router.route('/reenviar-codigo').post(solicitarNuevoCodigo)
router.route('/login').post(login)


export default router