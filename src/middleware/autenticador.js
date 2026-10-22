import jwt from "jsonwebtoken";

export const autenticador = (req, res, next)=>{
    try{
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({mensaje: 'Acceso no autorizado: no hay un token en la solicitud'})
        }
        //verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        //guardar el decoded en la peticion
        req.user = decoded
        next();
    }catch(error){
        console.error(error)
        res.status(403).json({mensaje: "Acceso denegado: Token invalido o expirado"})
    }

}

// verificar rutas de admin