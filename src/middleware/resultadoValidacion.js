import { validationResult } from "express-validator";

const resultadoValidacion = (req, res, next )=>{
    const errors = validationResult(req)
    //preguntar si ocurrio un error
    if(!errors.isEmpty()){
        return res.status(400).json(errors.array())
    }
    //continuar con la siguiente ejecución
    next()
}

export default resultadoValidacion;