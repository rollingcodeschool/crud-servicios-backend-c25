import { Router } from "express";
import {
  borrarCategoria,
  categoriaBuscada,
  crearCategoria,
  editarCategoria,
  listarCategorias,
} from "../controllers/categorias.controllers.js";
import { reglasCategoria } from "../middleware/validarCategoria.js";
import { validarID } from "../middleware/validarServicio.js";
import { autenticador, esAdmin } from "../middleware/autenticador.js";

const router = Router();

//http://localhost:3000/api/categorias/
//http://localhost:3000/api/categorias/234234dfgdf
// get, post, put/patch, delete
router
  .route("/")
  .post([autenticador, esAdmin, reglasCategoria], crearCategoria) // ruta privada del admin
  .get(listarCategorias);
router
  .route("/:id")
  .get(validarID, categoriaBuscada)
  .delete([autenticador, esAdmin, validarID], borrarCategoria) // ruta privada del admin
  .put([autenticador, esAdmin, validarID, reglasCategoria], editarCategoria); // ruta privada del admin

export default router;
