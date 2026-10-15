import nodemailer from "nodemailer";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// verificar la conexion con el servidor SMTP
transporter.verify().then(()=>{
    console.info('Servidor de correos listo "Mailtrap conectado"')
}).catch((error)=>{
    console.error('Error al conectar con el servidor de correos: ', error)
})

export default transporter