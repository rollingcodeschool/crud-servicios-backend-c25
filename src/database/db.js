import mongoose from "mongoose";

const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.info("Conexion con la BD exitosa");
  } catch (error) {
    console.error(error);
  }
};

conectarDB() //ejecutamos la conexion de la BD