import Server from "./src/server/config.js"
import router from "./src/routes/index.routes.js"
// crear el server

const server = new Server() 

// leer las rutas
//http://localhost:3000/api/-
server.app.use('/api',router)

//escuchar el puerto
server.listen()
