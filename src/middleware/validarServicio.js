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
  body("descripcion")
    .notEmpty()
    .withMessage("La descripción es un campo obligatorio")
    .isString()
    .withMessage("La descripción debe ser un string")
    .isLength({
      min: 10,
      max: 500,
    })
    .withMessage("La descripción debe contener entre 10 y 500 caracteres"),
  body("imagen")
    .notEmpty()
    .withMessage("La imagen es un dato obligatorio")
    .isString()
    .withMessage("La imagen debe ser un string")
    .matches(/^https:\/\/.+\.(jpg|jpeg|png|webp|avif|svg)$/)
    .withMessage(
      "La imagen debe ser un url valida, ademas de terminar en una de las siguientes extensiones: jpg|jpeg|png|webp|avif|svg",
    ),
  resultadoValidacion,
];

export default reglasServicio;
