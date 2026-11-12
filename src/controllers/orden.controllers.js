import { randomUUID } from "node:crypto";
import { isValidObjectId } from "mongoose";
import {
  InvalidWebhookSignatureError,
  MercadoPagoConfig,
  Order,
  WebhookSignatureValidator,
} from "mercadopago";
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

// ============================================================================
// WEBHOOK DE MERCADO PAGO (Orders API)
// ============================================================================

// Detecta si el evento pertenece a una Order. Cubre el topico "order" y sus
// acciones (order.created, order.updated, order.processed, etc.).
const esEventoDeOrden = (tipoEvento) =>
  typeof tipoEvento === "string" &&
  tipoEvento.toLowerCase().startsWith("order");

// Traduce el estado de la Order de Mercado Pago a nuestro enum local
// ("pendiente" | "aprobado" | "rechazado" | "cancelado").
const obtenerEstadoLocal = (ordenMP) => {
  const pagos = ordenMP?.transactions?.payments ?? [];

  // 1- La Order ya fue procesada: el pago fue acreditado.
  if (ordenMP?.status === "processed") {
    return {
      estado: "aprobado",
      pago: pagos.find(
        (pago) =>
          pago.status === "approved" ||
          pago.status === "processed" ||
          pago.status_detail === "accredited",
      ),
    };
  }

  // 2- La Order fallo: el pago fue rechazado.
  if (ordenMP?.status === "failed") {
    return {
      estado: "rechazado",
      pago: pagos.find(
        (pago) => pago.status === "rejected" || pago.status === "failed",
      ),
    };
  }

  // 3- La Order fue cancelada o vencio.
  if (ordenMP?.status === "canceled") {
    return { estado: "cancelado", pago: pagos[0] };
  }

  // 4- Respaldo: si la Order sigue en un estado intermedio
  // (created, processing, action_required) miramos las transacciones internas.
  const pagoAprobado = pagos.find(
    (pago) =>
      pago.status === "approved" ||
      pago.status === "processed" ||
      pago.status_detail === "accredited",
  );
  if (pagoAprobado) return { estado: "aprobado", pago: pagoAprobado };

  const pagoRechazado = pagos.find(
    (pago) => pago.status === "rejected" || pago.status === "failed",
  );
  if (pagoRechazado) return { estado: "rechazado", pago: pagoRechazado };

  const pagoCancelado = pagos.find(
    (pago) => pago.status === "canceled" || pago.status === "cancelled",
  );
  if (pagoCancelado) return { estado: "cancelado", pago: pagoCancelado };

  // Sin resolucion final: no hay nada que actualizar todavia.
  return { estado: null, pago: null };
};

// POST /api/ordenes/webhook
// Ruta publica que recibe las notificaciones de Mercado Pago.
export const recibirWebhook = async (req, res) => {
  try {
    // 1- Identificador del recurso notificado. MP lo envia en el body
    // (data.id) y tambien como query param (data.id), segun el caso.
    const idEvento =
      req.body?.data?.id ?? req.query?.["data.id"] ?? req.query?.id;

    // 2- Tipo de evento. Puede venir como "type" (order), como "action"
    // (order.updated) o como "topic"/"type" en la query string.
    const tipoEvento =
      req.body?.type ??
      req.body?.action ??
      req.query?.topic ??
      req.query?.type;

    // 3- VALIDACION DE ORIGEN: comprobamos que la notificacion venga
    // realmente de Mercado Pago usando el secreto configurado en el panel.
    const firmaSecreta = process.env.MP_WEBHOOK_SECRET;

    // Si falta el secreto es un error de configuracion del servidor:
    // fallamos cerrado (no procesamos nada) y devolvemos 500.
    if (!firmaSecreta) {
      console.error(
        "Webhook: falta configurar la variable de entorno MP_WEBHOOK_SECRET",
      );
      return res.status(500).json({
        mensaje: "La configuracion del webhook esta incompleta",
      });
    }

    // La documentacion indica que, si data.id contiene caracteres
    // alfanumericos en mayusculas (las Orders empiezan con "ORD"), hay que
    // pasarlo a minusculas antes de calcular el manifest de la firma.
    const dataIdFirma =
      typeof idEvento === "string" ? idEvento.toLowerCase() : idEvento;

    WebhookSignatureValidator.validate({
      xSignature: req.headers["x-signature"],
      xRequestId: req.headers["x-request-id"],
      dataId: dataIdFirma,
      secret: firmaSecreta,
    });

    // 4- Si no es una notificacion de Orders, la ignoramos y respondemos 200
    // para que Mercado Pago no reintente un evento que no procesamos.
    if (!idEvento || !esEventoDeOrden(tipoEvento)) {
      return res.sendStatus(200);
    }

    // 5- Configuramos el cliente oficial del SDK con el Access Token privado.
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });
    const orderMP = new Order(client);

    // 6- Nunca confiamos en el payload del webhook: consultamos la Order
    // real a la Orders API para validar su estado y sus transacciones.
    const ordenMP = await orderMP.get({ id: String(idEvento) });

    // 7- Buscamos la orden local por "orderIdMP" o, como respaldo, por el
    // "_id" que guardamos en "external_reference" al crear la Order.
    const filtros = [{ orderIdMP: ordenMP.id ?? String(idEvento) }];
    if (
      ordenMP.external_reference &&
      isValidObjectId(ordenMP.external_reference)
    ) {
      filtros.push({ _id: ordenMP.external_reference });
    }

    const ordenLocal = await Orden.findOne({ $or: filtros });

    // Si la orden no existe en nuestra base, confirmamos la recepcion (200)
    // para evitar reintentos infinitos de un evento que no podemos asociar.
    if (!ordenLocal) {
      console.warn(
        `Webhook: no existe una orden local para la Order ${ordenMP.id}`,
      );
      return res.sendStatus(200);
    }

    // 8- Traducimos el estado de Mercado Pago a nuestro enum local.
    const { estado, pago } = obtenerEstadoLocal(ordenMP);

    // created / processing / action_required: aun no hay nada que actualizar.
    if (!estado) {
      return res.sendStatus(200);
    }

    // 9- Actualizamos el estado y guardamos el id del pago procesado.
    // El id sale de "transactions.payments" de la respuesta de MP.
    ordenLocal.estado = estado;
    const paymentId =
      pago?.id ?? ordenMP.transactions?.payments?.[0]?.id ?? null;
    if (paymentId) {
      ordenLocal.paymentId = paymentId;
    }
    await ordenLocal.save();

    // 10- Si el pago fue aprobado, vaciamos el carrito del usuario dueno de
    // la orden (los servicios ya fueron comprados).
    if (estado === "aprobado") {
      await Carrito.findOneAndUpdate(
        { usuario: ordenLocal.usuario },
        { $set: { items: [] } },
      );
    }

    // 11- Confirmamos la recepcion a Mercado Pago para que no reintente.
    res.sendStatus(200);
  } catch (error) {
    // Firma ausente, mal formada o que no coincide: la peticion no viene de
    // Mercado Pago (o el secreto configurado es incorrecto).
    if (error instanceof InvalidWebhookSignatureError) {
      console.warn(
        `Webhook: firma invalida (${error.reason}) request-id: ${
          error.requestId ?? "sin request-id"
        }`,
      );
      return res.status(401).json({ mensaje: "Firma del webhook invalida" });
    }

    // Cualquier otro fallo (SDK, red, Mongo): logueamos y devolvemos 500
    // para que Mercado Pago reintente la notificacion mas tarde.
    console.error("Error al procesar el webhook de Mercado Pago:", error);
    res.status(500).json({
      mensaje: "Ocurrio un error al procesar la notificacion de pago",
    });
  }
};

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
          success_url: `${process.env.CLIENT_URL}/pago/exitoso?orden=${ordenLocal._id}`,
          failure_url: `${process.env.CLIENT_URL}/pago/fallido?orden=${ordenLocal._id}`,
          pending_url: `${process.env.CLIENT_URL}/pago/pendiente?orden=${ordenLocal._id}`,
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

    // 9- Respondemos solo con lo que el front necesita: la URL del checkout
    // y el id de la orden local (para consultar el estado al volver de MP).
    if (!respuestaMP.checkout_url) {
      return res.status(502).json({
        mensaje: "Mercado Pago no devolvio la URL de checkout",
      });
    }

    res.status(200).json({
      ordenId: ordenLocal._id,
      checkout_url: respuestaMP.checkout_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Ocurrio un error al intentar crear la orden de pago",
    });
  }
};
