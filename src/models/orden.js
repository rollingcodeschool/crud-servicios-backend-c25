import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema(
  {
    servicio: {
      type: Schema.Types.ObjectId,
      ref: "servicio",
      required: true,
    },
    nombreServicio: {
      type: String,
      required: true,
      trim: true,
    },
    precioUnitario: {
      type: Number,
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1,
    },
    imagen: {
      type: String,
    },
  },
  {
    _id: false,
  },
);

const ordenSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    items: [itemSchema],
    montoTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    estado: {
      type: String,
      enum: ["pendiente", "aprobado", "rechazado", "cancelado"],
      default: "pendiente",
    },
    orderIdMP: {
      type: String,
    },
    paymentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Orden = mongoose.model("Orden", ordenSchema);

export default Orden;
