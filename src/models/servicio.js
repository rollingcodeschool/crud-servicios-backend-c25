import mongoose, { Schema } from "mongoose";

const servicioSchema = new Schema(
  {
    nombreServicio: {
      type: String,
      required: true,
      unique: true,
      minLenght: 5,
      maxLength: 100,
      trim: true,
    },
    precio: {
      type: Number,
      required: true,
      min: 50,
    },
    descripcion: {
      type: String,
      minLenght: 10,
      maxLength: 500,
      requied: true,
    },
    imagen: {
      type: String,
      requied: true,
      validate: {
        validator: (valor) => {
          return /\.(jpg|jpeg|png|webp|avif|svg)$/.test(valor);
        },
      },
    },
    categoria: {
      type: String,
      requied: true,
      enum: ["Desarrollo Web", "Backend & API", "Consultoria"],
    },
  },
  {
    timestamps: true,
  },
);

const Servicio = mongoose.model('servicio', servicioSchema);

export default Servicio;