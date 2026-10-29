import mongoose, { Schema } from "mongoose";

const categoriaSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
      minLength: 2,
      maxLength: 100,
      trim: true,
    },
    descripcion: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 250,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Categoria = mongoose.model("Categoria", categoriaSchema);

export default Categoria;
