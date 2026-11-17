import cloudinary from "../config/cloudinary.js";

// Helper que recibe el buffer de una imagen (req.file.buffer) y la sube a Cloudinary
// mediante upload_stream, que acepta un stream en lugar de una ruta de archivo.
// Devuelve una Promesa que resuelve con el resultado del upload (incluye secure_url).
const subirImagenACloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "servicios", // carpeta donde se guardan las imagenes dentro de Cloudinary
        resource_type: "image",
      },
      (error, resultado) => {
        if (error) {
          return reject(error);
        }
        resolve(resultado);
      },
    );

    // Enviamos el buffer al stream y cerramos para que Cloudinary procese el archivo
    stream.end(buffer);
  });
};

export default subirImagenACloudinary;
