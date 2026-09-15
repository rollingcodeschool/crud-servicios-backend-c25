import Servicio from "../models/servicio.js"

export const prueba = (req, res )=>{
    console.log('prueba de mi primer controlador')
    res.status(200).json({mensaje: 'Primer controlador exitoso ✅'})
}
export const crearServicio = (req, res )=>{
    try {
        console.log('aqui tengo que crear un servicio')
        res.status(200).json({mensaje: 'aqui tengo que crear un servicio ✅'})
        
    } catch (error) {
        console.error(error)
        res.status(500).json({mensaje: 'Ocurrio un error al intentar crear un servicio'})
    }
}
