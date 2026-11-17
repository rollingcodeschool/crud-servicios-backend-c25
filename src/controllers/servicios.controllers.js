import Servicio from "../models/servicio.js";
import subirImagenACloudinary from "../utils/subirImagen.js";

// URL que se asigna cuando se crea un servicio sin archivo ni URL de imagen
const IMAGEN_POR_DEFECTO = "https://placehold.co/600x400.jpg";

export const prueba = (req, res) => {
  console.log("prueba de mi primer controlador");
  res.status(200).json({ mensaje: "Primer controlador exitoso ✅" });
};
export const crearServicio = async (req, res) => {
  try {
    console.log(req.body);
    // Copiamos los datos del body para no modificar req.body directamente
    const datosServicio = { ...req.body };

    // Si Multer recibio un archivo, subimos su buffer a Cloudinary
    if (req.file) {
      const resultado = await subirImagenACloudinary(req.file.buffer);
      // Guardamos la URL segura que devuelve Cloudinary
      datosServicio.imagen = resultado.secure_url;
    } else if (!datosServicio.imagen) {
      // Si no vino archivo ni URL en el body, usamos la imagen por defecto
      datosServicio.imagen = IMAGEN_POR_DEFECTO;
    }

    // deberia validar los datos del body
    const servicioNuevo = new Servicio(datosServicio);
    //guardar en la BD
    await servicioNuevo.save();
    res.status(201).json({ mensaje: "Servicio creado correctamente" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al intentar crear un servicio" });
  }
};

export const listarServicios = async (req, res) => {
  try {
    const { termino, pagina = 1, limite = 10 } = req.query;
    const pageNum = parseInt(pagina);
    const limit = parseInt(limite);
    const skip = (pageNum - 1) * limit;
    const query = {};
    if (termino) {
      query.nombreServicio = { $regex: termino, $options: "i" };
    }

    const [servicios, cantidadServicios] = await Promise.all([
      Servicio.find(query)
        .populate("categoria", "nombre descripcion")
        .skip(skip)
        .limit(limit),
      Servicio.countDocuments(query),
    ]);
    // no enviar varias consultas sueltas simultaneas, es mejor armar un array con todas las preguntar a la BD
    // const servicios = await Servicio.find(query).skip(skip).limit(limit);
    // const cantidadServicios = await Servicio.countDocuments(query);

    res.status(200).json({
      servicios,
      cantidadServicios,
      paginaActual: pageNum,
      totalPaginas: Math.ceil(cantidadServicios / limit),
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al intentar listar los servicios" });
  }
};

export const servicioBuscado = async (req, res) => {
  try {
    // console.log(req.params.id)
    const servicio = await Servicio.findById(req.params.id).populate(
      "categoria",
      "nombre descripcion",
    );
    // si no encontre el servicio
    if (!servicio) {
      return res.status(404).json({ mensaje: "Servicio no encontrado" });
    }
    res.status(200).json(servicio);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al intentar buscar un servicio" });
  }
};
export const borrarServicio = async (req, res) => {
  try {
    const servicioBorrado = await Servicio.findByIdAndDelete(req.params.id);
    if (!servicioBorrado) {
      return res
        .status(404)
        .json({ mensaje: "no se encontro el servicio para borrar" });
    }
    res.status(200).json({ mensaje: "El servicio fue borrado correctamente" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al intentar borrar un servicio" });
  }
};

export const editarServicio = async (req, res) => {
  try {
    // Copiamos los datos del body para no modificar req.body directamente
    const datosServicio = { ...req.body };

    if (req.file) {
      // Si llega un archivo nuevo, lo subimos y actualizamos la URL del campo imagen
      const resultado = await subirImagenACloudinary(req.file.buffer);
      datosServicio.imagen = resultado.secure_url;
    } else if (!datosServicio.imagen) {
      // Si no llega archivo nuevo ni una URL, quitamos el campo del update
      // para conservar la imagen que ya tenia el servicio
      delete datosServicio.imagen;
    }

    const servicioEditado = await Servicio.findByIdAndUpdate(
      req.params.id,
      datosServicio,
      { new: true },
    ).populate("categoria", "nombre descripcion");
    if (!servicioEditado) {
      return res.status(404).json({ mensaje: "El servicio no fue encontrado" });
    }
    res.status(200).json(servicioEditado);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al intentar editar un servicio" });
  }
};
