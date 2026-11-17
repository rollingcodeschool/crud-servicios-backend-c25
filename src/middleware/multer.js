import multer from "multer";

// Tamano maximo permitido para la imagen: 2MB
const LIMITE_TAMANO = 2 * 1024 * 1024;

// Formatos de imagen aceptados (el mimetype que envia el navegador)
const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];

// Configuracion de Multer.
// Usamos memoryStorage para que el archivo quede en req.file.buffer y no se escriba en disco;
// desde el controlador ese buffer se envia a Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: LIMITE_TAMANO,
    files: 1, // un solo archivo por peticion
  },
  // Filtro que rechaza los formatos que no sean imagenes jpg, png o webp
  fileFilter: (req, file, cb) => {
    if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
      const error = new Error(
        "Formato no permitido. Solo se aceptan imagenes jpg, png y webp",
      );
      error.status = 400;
      return cb(error);
    }
    cb(null, true);
  },
});

// Middleware que procesa un unico archivo bajo el campo "imagen"
export const subirImagen = upload.single("imagen");

// Middleware de errores propio de Multer.
// Al tener 4 argumentos, Express lo reconoce como manejador de errores.
export const manejarErroresMulter = (err, _req, res, next) => {
  // El archivo supera el limite de 2MB
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      mensaje: "La imagen supera el tamaño maximo permitido de 2MB",
    });
  }

  // Se envio un archivo en un campo con un nombre distinto a "imagen"
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      mensaje: "El campo de la imagen debe llamarse 'imagen'",
    });
  }

  // Error lanzado por nuestro fileFilter (formato no permitido)
  if (err.status === 400) {
    return res.status(400).json({ mensaje: err.message });
  }

  // Cualquier otro error se delega al manejador de errores de Express
  next(err);
};
