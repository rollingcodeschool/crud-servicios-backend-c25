import { Router } from "express";
import { login, logout, obtenerPerfil, registrarUsuario, solicitarNuevoCodigo, verificarRegistro } from "../controllers/usuarios.controllers.js";
import { autenticador } from "../middleware/autenticador.js";
const router = Router();

router.route('/registro').post(registrarUsuario)
router.route('/verificar').post(verificarRegistro)
router.route('/reenviar-codigo').post(solicitarNuevoCodigo)
router.route('/login').post(login)
router.route('/logout').post(logout)
//ruta privada
router.route('/perfil').get(autenticador, obtenerPerfil)


export default router