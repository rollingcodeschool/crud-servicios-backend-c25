import { param } from "express-validator";
import resultadoValidacion from "./resultadoValidacion.js";

export const validarServicioId = [
  param("servicioId")
    .isMongoId()
    .withMessage("El id del servicio no tiene el formato esperado"),
  resultadoValidacion,
];
