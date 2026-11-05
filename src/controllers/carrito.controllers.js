import { isValidObjectId } from "mongoose";
import Carrito from "../models/carrito.js";
import Servicio from "../models/servicio.js";

const buscarOCrearCarrito = async (usuarioId) => {
  let carrito = await Carrito.findOne({ usuario: usuarioId });
  if (!carrito) {
    carrito = new Carrito({ usuario: usuarioId, items: [] });
    await carrito.save();
  }
  return carrito;
};

export const obtenerCarrito = async (req, res) => {
  try {
    const carrito = await buscarOCrearCarrito(req.user.id);
    await carrito.populate("items.servicio", "nombreServicio precio imagen");
    res.status(200).json(carrito);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al intentar obtener el carrito" });
  }
};

export const vaciarCarrito = async (req, res) => {
  try {
    const carrito = await buscarOCrearCarrito(req.user.id);
    carrito.items = [];
    await carrito.save();
    res.status(200).json({ mensaje: "El carrito fue vaciado correctamente" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al intentar vaciar el carrito" });
  }
};

export const agregarAlCarrito = async (req, res) => {
  try {
    const { servicioId, cantidad = 1 } = req.body;

    if (!servicioId || !isValidObjectId(servicioId)) {
      return res
        .status(400)
        .json({ mensaje: "El servicio enviado no es valido" });
    }

    const cantidadNormalizada = Number(cantidad);
    if (!Number.isInteger(cantidadNormalizada) || cantidadNormalizada < 1) {
      return res.status(400).json({
        mensaje: "La cantidad debe ser un numero entero mayor o igual a 1",
      });
    }

    const servicio = await Servicio.findById(servicioId);
    if (!servicio) {
      return res.status(404).json({ mensaje: "Servicio no encontrado" });
    }

    const carrito = await buscarOCrearCarrito(req.user.id);
    const item = carrito.items.find((item) =>
      item.servicio.equals(servicioId),
    );

    if (item) {
      item.cantidad += cantidadNormalizada;
    } else {
      carrito.items.push({
        servicio: servicioId,
        cantidad: cantidadNormalizada,
      });
    }

    await carrito.save();
    await carrito.populate("items.servicio", "nombreServicio precio imagen");
    res.status(200).json(carrito);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Ocurrio un error al intentar agregar un servicio al carrito",
    });
  }
};
