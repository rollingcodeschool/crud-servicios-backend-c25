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
    const servicios = await Servicio.find();
    res.status(200).json(servicios);
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
    const servicio = await Servicio.findById(req.params.id)
    // si no encontre el servicio
    if(!servicio){
        return res.status(404).json({mensaje: 'Servicio no encontrado'})
    }
    res.status(200).json(servicio)

  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrio un error al intentar listar los servicios" });
  }
};
