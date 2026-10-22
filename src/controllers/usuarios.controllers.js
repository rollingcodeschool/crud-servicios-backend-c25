import jwt from "jsonwebtoken";
import Usuario from "../models/usuario.js";
import transporter from "../utils/mailer.js";
import bcrypt from "bcryptjs";

export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    //1- validar que el email no este duplicado
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(409).json({ mensaje: "El email ya esta registrado" });
    }

    //2- crear el codigo de verificación y fecha de expiracion
    //100000 - 999999
    const codigoVerificacion = Math.floor(
      100000 + Math.random() * 999999,
    ).toString();
    const tiempoExpiracion = new Date(Date.now() + 15 * 60 * 1000);

    // 3- preparar el dato a guardar
    const datosUsuario = {
      nombre,
      email,
      password,
      verificationCode: codigoVerificacion,
      verificationExpires: tiempoExpiracion,
    };

    if (rol && rol.trim() !== "") {
      datosUsuario.rol = rol;
    }

    // 4- crear el usuario
    const nuevoUsuario = await Usuario.create(datosUsuario);

    //5- enviar el correo
    await transporter.sendMail({
      from: '"Crud Servicios" <no-reply@crud-servicios.com>',
      to: nuevoUsuario.email,
      subject: "🔑 Código de Verificación de Cuenta",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">¡Hola, ${nuevoUsuario.nombre}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Gracias por registrarte. Para activar tu cuenta y poder ingresar a la plataforma, por favor utiliza el siguiente código de verificación:
          </p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 4px; color: #007bff;">
           ${codigoVerificacion}
          </div>
          <p style="color: #9; font-size: 12px; text-align: center;">
            Este código vencerá en 15 minutos. Si no solicitaste este registro, puedes ignorar este correo de forma segura.
          </p>
        </div>
      `,
    });

    // 5 - enviar respuesta
    res.status(201).json({
      mensaje:
        "Usuario registrado con exito. Por favor, revisa tu email para verificar tu cuenta.",
      usuario: {
        _id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al registrar un usuario" });
  }
};

export const verificarRegistro = async (req, res) => {
  try {
    const { email, codigo } = req.body;
    //1- buscar al usuario que contiene ese email
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({
        mensaje: "No se encontro ningun usuario con el email enviado.",
      });
    }
    //2- verificar si el usuario no esta activo aún
    if (usuario.isVerified) {
      return res.status(400).json({ mensaje: "Esta cuenta ya fue verificada" });
    }
    //3- verificar si el codigo sigue vigente
    if (new Date() > usuario.verificationExpires) {
      return res.status(400).json({
        mensaje:
          "El código de verificación a expirado, debes solicitar un código nuevo",
      });
    }
    //4- verificar si el codigo enviado es correcto
    if (usuario.verificationCode !== codigo) {
      return res
        .status(400)
        .json({ mensaje: "El código enviado es incorrecto" });
    }

    //verificar el codigo del usuario
    await Usuario.findByIdAndUpdate(usuario._id, {
      $set: { isVerified: true }, //aqui modificamos esta propiedad del documento
      $unset: { verificationCode: 1, verificationExpires: 1 }, //aqui quito estas dos propiedades del documento
    });

    res.status(200).json({
      mensaje: "Cuenta verificada con exito. Ya puedes iniciar sesión",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "No se pudo verificar la cuenta del usuario" });
  }
};

export const solicitarNuevoCodigo = async (req, res) => {
  try {
    const { email } = req.body;
    //1- validar si existe este email
    const usuarioBuscado = await Usuario.findOne({ email });
    if (!usuarioBuscado) {
      return res
        .status(404)
        .json({ mensaje: "No se encontró un usuario con este email" });
    }
    //2- validar que el código aún no este verificado
    if (usuarioBuscado.isVerified) {
      return res.status(400).json({ mensaje: "Esta cuenta ya fue verificada" });
    }

    //3- aqui creamos el nuevo código de verificación y la fecha de exp.
    const codigoVerificacion = Math.floor(
      100000 + Math.random() * 999999,
    ).toString();
    const tiempoExpiracion = new Date(Date.now() + 15 * 60 * 1000);

    //actualizar el usuario con su nuevo codigo y fecha de expiración
    await Usuario.findByIdAndUpdate(usuarioBuscado._id, {
      verificationCode: codigoVerificacion,
      verificationExpires: tiempoExpiracion,
    });

    // 4- volver a enviar el email
    await transporter.sendMail({
      from: '"Crud Servicios" <no-reply@crud-servicios.com>',
      to: usuarioBuscado.email,
      subject: "🔑 Nuevo código de verificación de cuenta",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">¡Hola, ${usuarioBuscado.nombre}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
          Has solicitado un nuevo código de verificación. Utiliza los siguientes 6 dígitos para activar tu cuenta:
          </p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 4px; color: #007bff;">
           ${codigoVerificacion}
          </div>
          <p style="color: #9; font-size: 12px; text-align: center;">
            Este código vencerá en 15 minutos. Si no solicitaste este código, puedes ignorar este correo.
          </p>
        </div>
      `,
    });

    res.status(200).json({
      mensaje: "Nuevo código generado y enviado con exito. Revisa tu email",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje:
        "Ocurrio un error al intentar generar un nuevo código de verificación",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //1- verficar su email
    const usuarioBuscado = await Usuario.findOne({ email });
    if (!usuarioBuscado) {
      return res.status(401).json({ mensaje: "credenciales invalidas" });
    }
    //2- verifiquemos el password
    if (!(await bcrypt.compare(password, usuarioBuscado.password))) {
      return res.status(401).json({ mensaje: "credenciales invalidas" });
    }
    //3- chequear si su codigo de verificación es valido
    if (!usuarioBuscado.isVerified) {
      return res
        .status(403)
        .json({ mensaje: "La cuenta no fue verificada aún" });
    }

    //4-generar el token jwt
    const token = jwt.sign(
      { id: usuarioBuscado._id, rol: usuarioBuscado.rol },
      process.env.JWT_SECRET,
      {
        expiresIn: "1hs",
      },
    );

    res.cookie("token", token,{
      httpOnly:true,
      secure: process.env.NODE_ENV === "produccion",
      samesite: "strict",
      maxAge: 3600000
    } )

    res.status(200).json({
      mensaje: "Login exitoso",
      nombre: usuarioBuscado.nombre 
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrio un error al loguear al usuario" });
  }
};

export const obtenerPerfil = async(req, res)=>{
  try{
    //buscar el perfil del usuario logueado
    const usuarioBuscado= await Usuario.findById(req.user.id).select("-password -isVerified -createdAt -updatedAt")
    if(!usuarioBuscado){
      return res.status(404).json({mensaje: "Usuario no encontrado"})
    }
    res.status(200).json(usuarioBuscado)
  }catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Ocurrio un error al obtener el perfil del usuario" });
  }
}