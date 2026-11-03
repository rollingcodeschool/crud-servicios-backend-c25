import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema({
  servicio: {
    type: Schema.Types.ObjectId,
    ref: "servicio",
    required: true,
  },
  cantidad: {
    type: Number,
    default: 1,
    min: 1,
  },
});

const carritoSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      unique: true,
    },
    items: [itemSchema],
  },
  {
    timestamps: true,
  },
);

const Carrito = mongoose.model("Carrito", carritoSchema);

export default Carrito;
