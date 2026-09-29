import { validationResult } from "express-validator";

const resultadoValidacion = (req, res, next )=>{
    const errors = validationResult(req)
    console.log(errors)
    //preguntar si ocurrio un error
    if(!errors.isEmpty()){
        return res.status(400)
    }
}