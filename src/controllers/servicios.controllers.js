import Servicio from "../models/servicio.js";

export const prueba = (req, res) => {
  console.log("prueba de mi primer controlador");
  res.status(200).json({ mensaje: "Primer controlador exitoso ✅" });
};
export const crearServicio = async (req, res) => {
  try {
    console.log(req.body);
    // deberia validar los datos del body
    const servicioNuevo = new Servicio(req.body);
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
      Servicio.find(query).skip(skip).limit(limit),
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
    const servicio = await Servicio.findById(req.params.id);
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
    const servicioEditado = await Servicio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
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
