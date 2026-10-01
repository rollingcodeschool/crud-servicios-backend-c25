import { body } from "express-validator";
import resultadoValidacion from "./resultadoValidacion.js";

const reglasServicio = [
  body("nombreServicio")
    .isString()
    .withMessage("El nombre del servicio debe ser un string")
    .isLength({
      min: 5,
      max: 100,
    })
    .withMessage(
      "El nombre del servicio debe contener entre 5 y 100 caracteres.",
    )
    .notEmpty()
    .withMessage("El nombre del servicio es un dato obligatorio"),
  body("precio")
    .notEmpty()
    .withMessage("El precio es un dato obligatorio")
    .isNumeric()
    .withMessage("El precio debe ser en formato numérico")
    .isFloat({
      min: 50,
    })
    .withMessage("El precio debe ser como mínimo desde $50"),
  body("categoria")
    .notEmpty()
    .withMessage("La categoría es un dato obligatorio")
    .isString()
    .withMessage("La categoría debe ser un string")
    .isIn(["Desarrollo Web", "Backend & API", "Consultoria"])
    .withMessage(
      'La categoría debe ser una de las siguientes opciones: "Desarrollo Web", "Backend & API", "Consultoria"',
    ),
  resultadoValidacion,
];

export default reglasServicio;
