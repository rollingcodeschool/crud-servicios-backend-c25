import { randomUUID } from "node:crypto";
import { MercadoPagoConfig, Order } from "mercadopago";
import Carrito from "../models/carrito.js";
import Orden from "../models/orden.js";

// ============================================================================
// IMPORTANTE: en este flujo conviven DOS "ordenes" diferentes.
//
// 1) ORDEN LOCAL (modelo Orden de MongoDB):
//    - Vive en nuestra base de datos.
//    - Su identificador es "_id".
//    - Guarda un snapshot de los items y el montoTotal al momento de la
//      compra, y maneja su propio estado ("pendiente", "aprobado", etc.).
//
// 2) ORDER DE MERCADO PAGO (Orders API):
//    - Vive en los servidores de Mercado Pago.
//    - Su identificador es "id" (formato ORD...).
//    - Tiene su propio ciclo de vida (created, processed, failed, etc.) y
//      devuelve "checkout_url", la URL a la que redirigimos al comprador.
//
// El puente entre ambas es:
//    - "external_reference": guarda el _id de la orden local dentro de MP.
//    - "orderIdMP": guarda el id de MP dentro de la orden local.
// ============================================================================

export const crearOrdenPago = async (req, res) => {
  try {
    // 1- Buscamos el carrito del usuario autenticado y populamos el servicio
    // con los datos que necesitamos para armar la compra.
    const carrito = await Carrito.findOne({ usuario: req.user.id }).populate(
      "items.servicio",
      "nombreServicio precio imagen",
    );

    // 2- Validamos que el carrito exista y tenga al menos un item.
    if (!carrito || carrito.items.length === 0) {
      return res.status(400).json({ mensaje: "El carrito esta vacio" });
    }

    // Si un servicio fue eliminado, el populate devuelve null y no podemos
    // calcular el total. En ese caso pedimos que se limpie el carrito.
    const servicioInexistente = carrito.items.some((item) => !item.servicio);
    if (servicioInexistente) {
      return res.status(400).json({
        mensaje: "El carrito contiene servicios que ya no existen",
      });
    }

    // 3- Calculamos el monto total con el precio actual del servicio.
    // Nunca confiamos en precios enviados desde el cliente.
    const montoTotal = carrito.items.reduce(
      (acumulado, item) => acumulado + item.servicio.precio * item.cantidad,
      0,
    );

    // 4- Creamos la ORDEN LOCAL en MongoDB con estado "pendiente".
    // Guardamos un snapshot de los datos del servicio para que la orden no
    // cambie si luego se edita o elimina el servicio original.
    const ordenLocal = await Orden.create({
      usuario: req.user.id,
      items: carrito.items.map(({ servicio, cantidad }) => ({
        servicio: servicio._id,
        nombreServicio: servicio.nombreServicio,
        precioUnitario: servicio.precio,
        cantidad,
        imagen: servicio.imagen,
      })),
      montoTotal,
      estado: "pendiente",
    });

    // 5- Configuramos el cliente oficial del SDK con el Access Token.
    // El token es privado y solo debe usarse en el backend.
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });
    const orderMP = new Order(client);

    // 6- Armamos el body de la ORDER DE MERCADO PAGO (Orders API).
    // - total_amount debe ser igual a la suma de unit_price * quantity.
    // - external_reference vincula la Order de MP con la orden local.
    // - config.online define las URLs de retorno usando CLIENT_URL.
    const body = {
      type: "online",
      processing_mode: "manual",
      total_amount: montoTotal.toFixed(2),
      external_reference: ordenLocal._id.toString(),
      currency: "ARS",
      items: carrito.items.map(({ servicio, cantidad }) => ({
        external_code: servicio._id.toString(),
        title: servicio.nombreServicio,
        unit_price: servicio.precio.toFixed(2),
        quantity: cantidad,
        picture_url: servicio.imagen,
      })),
      config: {
        online: {
          success_url: `${process.env.CLIENT_URL}/pago/exitoso`,
          failure_url: `${process.env.CLIENT_URL}/pago/fallido`,
          pending_url: `${process.env.CLIENT_URL}/pago/pendiente`,
          auto_return: "approved",
        },
      },
    };

    // 7- Creamos la Order en Mercado Pago.
    // idempotencyKey evita duplicar la Order si se reintenta la peticion.
    const respuestaMP = await orderMP.create({
      body,
      requestOptions: { idempotencyKey: randomUUID() },
    });

    // 8- Guardamos el id de la Order de MP en la orden local.
    ordenLocal.orderIdMP = respuestaMP.id;
    await ordenLocal.save();

    // 9- Respondemos con la respuesta de Mercado Pago, que incluye
    // "checkout_url" para redirigir al comprador al checkout.
    res.status(200).json(respuestaMP);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Ocurrio un error al intentar crear la orden de pago",
    });
  }
};
