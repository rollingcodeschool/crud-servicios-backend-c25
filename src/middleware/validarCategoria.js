import { body } from "express-validator";
import resultadoValidacion from "./resultadoValidacion.js";
import Categoria from "../models/categoria.js";

export const reglasCategoria = [
  body("nombre")
    .isString()
    .withMessage("El nombre de la categoría debe ser un string")
    .isLength({
      min: 2,
      max: 100,
    })
    .withMessage("El nombre de la categoría debe contener entre 2 y 100 caracteres.")
    .notEmpty()
    .withMessage("El nombre de la categoría es un dato obligatorio")
    .custom(async (valor, { req }) => {
      const categoriaExistente = await Categoria.findOne({ nombre: valor });
      if (!categoriaExistente) {
        return true;
      }
      // verificamos si estamos editando la misma categoría
      if (req.params?.id && categoriaExistente._id.toString() === req.params.id) {
        return true;
      }
      throw new Error("La categoría ya existe en la base de datos");
    }),
  body("descripcion")
    .notEmpty()
    .withMessage("La descripción es un campo obligatorio")
    .isString()
    .withMessage("La descripción debe ser un string")
    .isLength({
      min: 10,
      max: 250,
    })
    .withMessage("La descripción debe contener entre 10 y 250 caracteres"),
  resultadoValidacion,
];
