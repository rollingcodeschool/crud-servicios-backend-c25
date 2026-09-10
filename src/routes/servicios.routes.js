import { Router } from "express";
import { prueba } from "../controllers/servicios.controllers.js";

const router = Router()

//http://localhost:3000/api/servicios/test

router.route('/test').get(prueba)

export default router