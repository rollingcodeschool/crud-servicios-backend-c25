// const express = require('express');
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { dirname } from "path"
import { fileURLToPath } from "url";
import '../database/db.js'

class Server {
  constructor() {
    // definen las propiedades
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.middlewares();
  }
  // metodos de la clase
  middlewares() {
    // localhost:5173 localhost:3000
    this.app.use(cors()); //configuramos CORS para permitir la comunicacion de distintos dominios
    this.app.use(morgan("dev")); //muestra por terminal informacion de la comunicacion HTTP
    this.app.use(express.json()); //podemos leer los datos en formato JSON que llegan en el BODY del request
    //configurar un archivo estatico
    const __dirname = dirname(fileURLToPath(import.meta.url))
    // console.log(__dirname + "/../../public")
    this.app.use(express.static(__dirname + "/../../public")) //configuramos un archivo estatico
  }

  listen() {
    this.app.listen(this.port, () => {
      console.info(`Servidor activo en  http://localhost:${this.port}`);
    });
  }
}

export default Server;
