export const prueba = (req, res )=>{
    console.log('prueba de mi primer controlador')
    res.status(200).json({mensaje: 'Primer controlador exitoso ✅'})
}
//export aqui existiran muchas funciones