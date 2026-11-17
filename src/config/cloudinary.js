import { v2 as cloudinary } from "cloudinary";

// Configuracion del SDK v2 de Cloudinary.
// Las credenciales se leen de las variables de entorno (cargadas con --env-file en "pnpm dev").
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // fuerza a que las URLs generadas usen https
});

export default cloudinary;
